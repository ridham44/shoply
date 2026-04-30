require('dotenv').config();

module.exports = {
    jwt: {
        accessTokenSecret: process.env.JWT_SECRET || 'supersecretkey',
        accessTokenExpiry: process.env.JWT_EXPIRES_IN || '1d',
    },

    otp: {
        length: Number(process.env.OTP_LENGTH) || 6,
        expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
        resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN) || 60,
        maxResendCount: Number(process.env.OTP_MAX_RESEND) || 3,
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
    },
};