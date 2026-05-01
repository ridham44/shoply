const mongoose = require('mongoose');

const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const status = require('../utils/statusCodes');
const createNotification = require('../utils/createNotification');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;

        const user = await User.findOne({
            _id: userId,
            role: 'customer',
            deletedAt: null,
        });

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer user not found',
            });
        }

        const customer = await Customer.findOne({
            userId: user._id,
            deletedAt: null,
        });

        const { items, paymentMethod, deliveryAddress } = req.body;

        const productIds = items.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'One or more products not found',
            });
        }

        const productMap = {};
        products.forEach((p) => { productMap[p._id.toString()] = p; });

        let totalAmount = 0;

        const orderItems = items.map((item) => {
            const product = productMap[item.productId.toString()];
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            return {
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                productDescription: product.description || '',
                productCategory: product.category?.toString() || '',
                productSize: product.size || '',
                productColour: product.colour || '',
                productDetails: product.product_details || '',
            };
        });

        const order = await Order.create({
            user: user._id,
            customer: customer?._id || null,
            items: orderItems,
            totalAmount,
            paymentMethod,
            deliveryAddress,
        });

        createNotification({
            type: 'order',
            title: 'New Order Received',
            message: `Order #${order._id.toString().slice(-4).toUpperCase()} has been placed by ${user.name}. Total amount: ₹${totalAmount}.`,
            metadata: { orderId: order._id, userId: user._id },
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { search, orderStatus, fromDate, toDate, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        if (search) {
            filter.$or = [
                { deliveryAddress: { $regex: search, $options: 'i' } },
                { paymentMethod: { $regex: search, $options: 'i' } },
            ];
        }

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = to;
            }
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email phone')
                .populate('customer', 'addressLine1 city state pincode country')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
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

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;

        const { orderStatus, page = 1, limit = 10 } = req.query;

        const filter = { user: userId };

        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
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

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const authType = req.user?.authType;

        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('customer', 'addressLine1 city state pincode country');

        if (!order) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (authType !== 'admin' && order.user?._id.toString() !== userId.toString()) {
            return res.status(status.Forbidden).json({
                success: false,
                message: 'Access denied',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Order fetched successfully',
            data: order,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true, runValidators: true },
        )
            .populate('user', 'name email phone')
            .populate('customer', 'addressLine1 city state pincode country');

        if (!order) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Order not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Order not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
