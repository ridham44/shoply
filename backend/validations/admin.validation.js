const status = require('../utils/statusCodes');

const nameRegex = /^[A-Za-z ]{2,100}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const otpRegex = /^\d{4,8}$/;

exports.validateSendRegisterOtp = (req, res, next) => {
    try {
        const { name, phone } = req.body;

        if (!name) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Name is required',
            });
        }

        if (!nameRegex.test(name)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Name must contain only alphabets and spaces',
            });
        }

        if (!phone) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number must be 10 digits and valid',
            });
        }

        next();
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.validateVerifyRegisterOtp = (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid phone number',
            });
        }

        if (!otp) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'OTP is required',
            });
        }

        if (!otpRegex.test(String(otp))) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid OTP format',
            });
        }

        next();
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.validateSendLoginOtp = (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid phone number',
            });
        }

        next();
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.validateVerifyLoginOtp = (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid phone number',
            });
        }

        if (!otp) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'OTP is required',
            });
        }

        if (!otpRegex.test(String(otp))) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid OTP format',
            });
        }

        next();
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.validateResendLoginOtp = (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        if (!phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid phone number',
            });
        }

        next();
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};