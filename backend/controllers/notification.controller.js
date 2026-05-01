const mongoose = require('mongoose');
const Notification = require('../models/Notification.model');
const status = require('../utils/statusCodes');

exports.getNotifications = async (req, res) => {
    try {
        const { type, search, isRead, fromDate, toDate, page = 1, limit = 20 } = req.query;

        const filter = {};

        // Filter by notification category
        if (type && ['order', 'customer', 'review', 'system'].includes(type)) {
            filter.type = type;
        }

        // Filter by read/unread status (isRead=true or isRead=false)
        if (isRead !== undefined && isRead !== '') {
            filter.isRead = isRead === 'true';
        }

        // Filter by removed/not-removed (isRemoved=true or isRemoved=false)
        if (req.query.isRemoved !== undefined && req.query.isRemoved !== '') {
            filter.isRemoved = req.query.isRemoved === 'true';
        }

        // Filter by date range (validate dates before applying)
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) {
                const from = new Date(fromDate);
                if (!isNaN(from)) filter.createdAt.$gte = from;
            }
            if (toDate) {
                const to = new Date(toDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = to;
                }
            }
            if (!filter.createdAt.$gte && !filter.createdAt.$lte) {
                delete filter.createdAt;
            }
        }

        // Search in title and message
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 20;
        const skip = (pageNumber - 1) * limitNumber;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Notification.countDocuments(filter),
            Notification.countDocuments({ isRemoved: { $ne: true }, isRead: { $ne: true } }),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Notifications fetched successfully',
            data: notifications,
            meta: {
                total,
                unreadCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getUnreadNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const filter = { isRead: { $ne: true }, isRemoved: { $ne: true } };

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 20;
        const skip = (pageNumber - 1) * limitNumber;

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Notification.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Unread notifications fetched successfully',
            data: notifications,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid notification ID',
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, isRemoved: { $ne: true } },
            { isRead: true },
            { new: true },
        );

        if (!notification) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Notification not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRemoved: { $ne: true }, isRead: { $ne: true } }, { isRead: true });

        return res.status(status.OK).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.removeNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid notification ID',
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, isRemoved: { $ne: true } },
            { isRemoved: true },
            { new: true },
        );

        if (!notification) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Notification not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Notification removed',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.clearAll = async (req, res) => {
    try {
        await Notification.updateMany({ isRemoved: { $ne: true } }, { isRemoved: true });

        return res.status(status.OK).json({
            success: true,
            message: 'All notifications cleared',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
