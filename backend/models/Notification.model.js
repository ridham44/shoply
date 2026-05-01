const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['order', 'customer', 'review', 'system'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        isRemoved: { type: Boolean, default: false },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
