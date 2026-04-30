const jwt = require('jsonwebtoken');

const { jwt: jwtConfig } = require('../config/auth');
const status = require('../utils/statusCodes');

const Admin = require('../models/admin.model');
const User = require('../models/User.model');

const AdminSession = require('../models/adminSession.model');
const { getRequestIp, getBrowserDetail } = require('../utils/adminRequestInfo');

const getTokenFromHeaders = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const rawAuthorizationToken = authHeader && !authHeader.startsWith('Bearer ') ? String(authHeader).trim() : null;

    const fallbackToken = req.headers['x-access-token'] || req.headers.token;

    return bearerToken || rawAuthorizationToken || fallbackToken;
};

const findAuthUser = async (userId) => {
    const admin = await Admin.findOne({
        _id: userId,
        deletedAt: null,
    }).select('name phone role');

    if (admin) {
        return {
            authUser: admin,
            authType: 'admin',
        };
    }

    const user = await User.findOne({
        _id: userId,
        deletedAt: null,
    }).select('name email phone role gender profileImage');

    if (user) {
        return {
            authUser: user,
            authType: 'user',
        };
    }

    return {
        authUser: null,
        authType: null,
    };
};

module.exports = async (req, res, next) => {
    try {
        const token = getTokenFromHeaders(req);

        if (!token) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Unauthorized: No token provided',
            });
        }

        const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);

        if (!decoded.id) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Invalid token payload',
            });
        }

        const { authUser, authType } = await findAuthUser(decoded.id);

        if (!authUser) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'User not found',
            });
        }

        let session = null;

        if (authType === 'admin') {
            const deviceId = req.headers['x-device-id'] || req.headers.deviceid || null;
            const currentIp = getRequestIp(req);

            session = await AdminSession.findOne({
                adminId: authUser._id,
                token,
                isLogin: true,
            });

            if (!session) {
                return res.status(status.Unauthorized).json({
                    success: false,
                    message: 'Session not found or already logged out',
                });
            }

            if (session.ipAddress && currentIp && session.ipAddress !== currentIp) {
                return res.status(status.Unauthorized).json({
                    success: false,
                    message: 'IP mismatch detected. Possible stolen token',
                });
            }

            if (session.deviceId && deviceId && session.deviceId !== deviceId) {
                return res.status(status.Unauthorized).json({
                    success: false,
                    message: 'Device mismatch detected. Possible stolen token',
                });
            }
        }

        req.user = {
            id: authUser._id,
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone,
            role: authUser.role,
            authType,
            token,
            sessionId: session ? session._id : null,
        };

        if (authType === 'admin') {
            req.admin = req.user;
        }

        next();
    } catch (error) {
        return res.status(status.Unauthorized).json({
            success: false,
            message: 'Unauthorized',
            error: error.message,
        });
    }
};
