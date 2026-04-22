const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['register', 'login'],
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        lastSentAt: {
            type: Date,
            default: Date.now,
        },
        resendCount: {
            type: Number,
            default: 0,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        registrationData: {
            name: {
                type: String,
                default: null,
            },
            role: {
                type: String,
                default: 'admin',
            },
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    },
);

adminOtpSchema.index({ phone: 1, type: 1 });

module.exports = mongoose.model('AdminOtp', adminOtpSchema);
