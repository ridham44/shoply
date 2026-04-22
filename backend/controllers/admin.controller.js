const otpGenerator = require('otp-generator');
const mongoose = require('mongoose');
const Admin = require('../models/admin.model');
const AdminOtp = require('../models/adminOtp.model');
const AdminSession = require('../models/adminSession.model');
const status = require('../utils/statusCodes');
const { otp: otpConfig } = require('../config/auth');
const { generateAdminToken } = require('../utils/adminToken');
const { getRequestIp, getBrowserDetail, getDeviceType } = require('../utils/adminRequestInfo');

const createOtpValue = () => {
    return otpGenerator.generate(otpConfig.length, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
    });
};

const getSessionDuration = (loginAt, logoutAt) => {
    const diffMs = new Date(logoutAt) - new Date(loginAt);

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
};

exports.sendRegisterOtp = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const existingAdmin = await Admin.findOne({
            phone,
            deletedAt: null,
        });

        if (existingAdmin) {
            return res.status(status.Conflict).json({
                success: false,
                message: 'Admin already registered with this phone number',
            });
        }

        const existingOtp = await AdminOtp.findOne({
            phone,
            type: 'register',
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (existingOtp) {
            const secondsPassed = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);

            if (secondsPassed < otpConfig.resendCooldownSeconds) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: `Please wait ${otpConfig.resendCooldownSeconds - secondsPassed} seconds before requesting OTP again`,
                });
            }

            if (existingOtp.resendCount >= otpConfig.maxResendCount) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: 'Maximum OTP resend limit reached',
                });
            }

            existingOtp.otp = createOtpValue();
            existingOtp.expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);
            existingOtp.lastSentAt = new Date();
            existingOtp.resendCount += 1;
            existingOtp.registrationData = {
                name,
                role: 'admin',
            };

            await existingOtp.save();

            return res.status(status.OK).json({
                success: true,
                message: 'Register OTP sent successfully',
                otp: existingOtp.otp,
            });
        }

        const otp = createOtpValue();

        const otpDoc = await AdminOtp.create({
            phone,
            type: 'register',
            otp,
            expiresAt: new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000),
            lastSentAt: new Date(),
            resendCount: 0,
            isUsed: false,
            registrationData: {
                name,
                role: 'admin',
            },
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Register OTP sent successfully',
            otp: otpDoc.otp,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.verifyRegisterOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers.deviceid || null;

        const otpDoc = await AdminOtp.findOne({
            phone,
            type: 'register',
            otp: String(otp),
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid register OTP',
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Register OTP has expired',
            });
        }

        const alreadyExists = await Admin.findOne({
            phone,
            deletedAt: null,
        });

        if (alreadyExists) {
            return res.status(status.Conflict).json({
                success: false,
                message: 'Admin already exists',
            });
        }

        const admin = await Admin.create({
            name: otpDoc.registrationData?.name,
            phone,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        otpDoc.isUsed = true;
        await otpDoc.save();

        const token = generateAdminToken(admin);

        const ipAddress = getRequestIp(req);
        const browserDetail = getBrowserDetail(req);
        const deviceType = getDeviceType(req);

        await AdminSession.create({
            adminId: admin._id,
            token,
            ipAddress,
            browserDetail,
            deviceType,
            deviceId,
            isLogin: true,
            loginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            data: admin,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.sendLoginOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        const admin = await Admin.findOne({
            phone,
            deletedAt: null,
        });

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found with this phone number',
            });
        }

        const existingOtp = await AdminOtp.findOne({
            phone,
            type: 'login',
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (existingOtp) {
            const secondsPassed = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);

            if (secondsPassed < otpConfig.resendCooldownSeconds) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: `Please wait ${otpConfig.resendCooldownSeconds - secondsPassed} seconds before requesting OTP again`,
                });
            }

            if (existingOtp.resendCount >= otpConfig.maxResendCount) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: 'Maximum OTP resend limit reached',
                });
            }

            existingOtp.otp = createOtpValue();
            existingOtp.expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);
            existingOtp.lastSentAt = new Date();
            existingOtp.resendCount += 1;

            await existingOtp.save();

            return res.status(status.OK).json({
                success: true,
                message: 'Login OTP sent successfully',
                otp: existingOtp.otp,
            });
        }

        const otp = createOtpValue();

        const otpDoc = await AdminOtp.create({
            phone,
            type: 'login',
            otp,
            expiresAt: new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000),
            lastSentAt: new Date(),
            resendCount: 0,
            isUsed: false,
        });

        return res.status(status.OK).json({
            success: true,
            message: 'Login OTP sent successfully',
            otp: otpDoc.otp,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.verifyLoginOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers.deviceid || null;

        const admin = await Admin.findOne({
            phone,
            deletedAt: null,
        });

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found',
            });
        }

        const otpDoc = await AdminOtp.findOne({
            phone,
            type: 'login',
            otp: String(otp),
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid login OTP',
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Login OTP has expired',
            });
        }

        otpDoc.isUsed = true;
        await otpDoc.save();

        const token = generateAdminToken(admin);

        const ipAddress = getRequestIp(req);
        const browserDetail = getBrowserDetail(req);
        const deviceType = getDeviceType(req);

        await AdminSession.create({
            adminId: admin._id,
            token,
            ipAddress,
            browserDetail,
            deviceType,
            deviceId,
            isLogin: true,
            loginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(status.OK).json({
            success: true,
            message: 'Admin login successful',
            token,
            data: admin,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.logoutAdmin = async (req, res) => {
    try {
        const session = await AdminSession.findOne({
            _id: req.admin.sessionId,
            adminId: req.admin.id,
            token: req.admin.token,
            isLogin: true,
        });

        if (!session) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Active session not found',
            });
        }

        const logoutAt = new Date();

        session.isLogin = false;
        session.logoutAt = logoutAt;
        session.sessionDuration = getSessionDuration(session.loginAt, logoutAt);

        await session.save();

        return res.status(status.OK).json({
            success: true,
            message: 'Admin logged out successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
exports.resendLoginOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        const admin = await Admin.findOne({
            phone,
            deletedAt: null,
        });

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found with this phone number',
            });
        }

        const existingOtp = await AdminOtp.findOne({
            phone,
            type: 'login',
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (!existingOtp) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'No active login OTP found. Please request login OTP first',
            });
        }

        const secondsPassed = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);

        if (secondsPassed < otpConfig.resendCooldownSeconds) {
            return res.status(status.BadRequest).json({
                success: false,
                message: `Please wait ${otpConfig.resendCooldownSeconds - secondsPassed} seconds before requesting OTP again`,
            });
        }

        if (existingOtp.resendCount >= otpConfig.maxResendCount) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Maximum OTP resend limit reached',
            });
        }

        existingOtp.otp = createOtpValue();
        existingOtp.expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);
        existingOtp.lastSentAt = new Date();
        existingOtp.resendCount += 1;

        await existingOtp.save();

        return res.status(status.OK).json({
            success: true,
            message: 'Login OTP resent successfully',
            otp: existingOtp.otp,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAdminDetails = async (req, res) => {
    try {
        const admin = await Admin.findOne({
            _id: req.admin.id,
            deletedAt: null,
        }).lean();

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found',
            });
        }

        const session = await AdminSession.findOne({
            _id: req.admin.sessionId,
            adminId: req.admin.id,
            token: req.admin.token,
            isLogin: true,
        }).lean();

        return res.status(status.OK).json({
            success: true,
            message: 'Admin details fetched successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    phone: admin.phone,
                },
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAdminById = async (req, res) => {
    try {
        const { id } = req.params;

        // validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid admin id',
            });
        }

        const admin = await Admin.findOne({
            _id: id,
            deletedAt: null,
        }).lean();

        if (!admin) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Admin not found',
            });
        }

        // optional: include active sessions
        const sessions = await AdminSession.find({
            adminId: id,
            isLogin: true,
        }).lean();

        return res.status(status.OK).json({
            success: true,
            message: 'Admin fetched successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    phone: admin.phone,
                    role: admin.role,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt,
                    deletedAt: admin.deletedAt,
                },
                activeSessions: sessions.map((s) => ({
                    sessionId: s._id,
                    ipAddress: s.ipAddress,
                    deviceType: s.deviceType,
                    deviceId: s.deviceId,
                    browserDetail: s.browserDetail,
                    loginAt: s.loginAt,
                })),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
