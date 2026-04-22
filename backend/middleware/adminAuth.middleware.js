const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/auth');
const status = require('../utils/statusCodes');
const Admin = require('../models/admin.model');
const AdminSession = require('../models/adminSession.model');
const { getRequestIp, getBrowserDetail } = require('../utils/adminRequestInfo');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        const rawAuthorizationToken = authHeader && !authHeader.startsWith('Bearer ') ? String(authHeader).trim() : null;
        const fallbackToken = req.headers['x-access-token'] || req.headers.token;

        const token = bearerToken || rawAuthorizationToken || fallbackToken;
        const deviceId = req.headers['x-device-id'] || req.headers.deviceid || null;
        const currentIp = getRequestIp(req);
        const currentBrowser = getBrowserDetail(req);

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

        const admin = await Admin.findOne({
            _id: decoded.id,
            deletedAt: null,
        });

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found',
            });
        }

        const session = await AdminSession.findOne({
            adminId: admin._id,
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

        if (session.browserDetail && currentBrowser && session.browserDetail !== currentBrowser) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Browser mismatch detected. Possible stolen token',
            });
        }

        req.admin = {
            id: admin._id,
            name: admin.name,
            phone: admin.phone,
            role: admin.role,
            token,
            sessionId: session._id,
        };

        next();
    } catch (error) {
        return res.status(status.Unauthorized).json({
            success: false,
            message: 'Unauthorized',
            error: error.message,
        });
    }
};
