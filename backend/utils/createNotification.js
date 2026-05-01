const Notification = require('../models/Notification.model');

const createNotification = async ({ type, title, message, metadata = {} }) => {
    try {
        await Notification.create({ type, title, message, metadata });
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
};

module.exports = createNotification;
