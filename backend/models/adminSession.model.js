const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        browserDetail: {
            type: String,
            default: null,
        },
        deviceType: {
            type: String,
            default: null,
        },
        deviceId: {
            type: String,
            default: null,
        },
        isLogin: {
            type: Boolean,
            default: true,
        },
        loginAt: {
            type: Date,
            default: Date.now,
        },
        logoutAt: {
            type: Date,
            default: null,
        },
        sessionDuration: {
            type: String,
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    },
);

adminSessionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

adminSessionSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('AdminSession', adminSessionSchema);
