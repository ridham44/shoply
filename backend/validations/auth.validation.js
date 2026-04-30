const status = require('../utils/statusCodes');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

exports.validateRegister = (req, res, next) => {
    try {
        const { name, email, password, phone, gender } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Name is required',
            });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Valid email is required',
            });
        }

        if (!password || password.length < 6) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        if (!phone || !phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Valid 10-digit phone number is required',
            });
        }

        if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Gender must be male, female or other',
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

exports.validateLogin = (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !String(identifier).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Email or phone is required',
            });
        }

        if (!password) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Password is required',
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

exports.validateUpdateProfile = (req, res, next) => {
    try {
        const { name, email, phone, gender } = req.body;

        if (name && !String(name).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Name cannot be empty',
            });
        }

        if (email && !emailRegex.test(email)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        if (phone && !phoneRegex.test(phone)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'phone must be 10 digits',
            });
        }

        if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid gender value',
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

exports.validateResetPassword = (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Old and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'New password must be at least 6 characters',
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
