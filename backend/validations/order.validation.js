const mongoose = require('mongoose');
const status = require('../utils/statusCodes');

const validOrderStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const validPaymentMethods = ['COD', 'UPI', 'Card', 'NetBanking'];

exports.validateCreateOrder = (req, res, next) => {
    try {
        const { items, paymentMethod, deliveryAddress } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Items are required and must be a non-empty array',
            });
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: `Invalid productId at items[${i}]`,
                });
            }

            if (!item.quantity || Number(item.quantity) < 1) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: `Quantity must be at least 1 at items[${i}]`,
                });
            }
        }

        if (!paymentMethod || !String(paymentMethod).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Payment method is required',
            });
        }

        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: `Payment method must be one of: ${validPaymentMethods.join(', ')}`,
            });
        }

        if (!deliveryAddress || !String(deliveryAddress).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Delivery address is required',
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

exports.validateUpdateOrderStatus = (req, res, next) => {
    try {
        const { orderStatus } = req.body;

        if (!orderStatus) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Order status is required',
            });
        }

        if (!validOrderStatuses.includes(orderStatus)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: `Order status must be one of: ${validOrderStatuses.join(', ')}`,
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

exports.validateOrderId = (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid order id',
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
