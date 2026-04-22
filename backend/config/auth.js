module.exports = {
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'adminAccessSecretKey',
        accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '1d',
    },
    otp: {
        length: Number(process.env.OTP_LENGTH) || 6,
        expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
        resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
        maxResendCount: Number(process.env.OTP_MAX_RESEND_COUNT) || 3,
    },
};