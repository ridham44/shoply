const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const Cart = require('../models/Cart.model');
const Order = require('../models/Order.model');
const status = require('../utils/statusCodes');

exports.getCustomerList = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const filter = {
            role: 'customer',
            deletedAt: null,
        };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('_id name email phone role createdAt updatedAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            User.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Customer user list fetched successfully',
            data: users,
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

exports.getCustomerDetail = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({
            _id: userId,
            role: 'customer',
            deletedAt: null,
        }).select('_id name email phone role createdAt updatedAt');

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer user not found',
            });
        }

        const customer = await Customer.findOne({
            userId: user._id,
            deletedAt: null,
        }).populate('userId', 'name email phone role');

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer detail not found for this user',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Customer detail fetched successfully',
            data: {
                user,
                customer,
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCustomerCart = async (req, res) => {
    try {
        const { userId } = req.params;

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

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer detail not found for this user',
            });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.productId');

        if (!cart) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Cart not found for this customer',
            });
        }

        const cartTotal = cart.items.reduce((sum, item) => {
            return sum + Number(item.totalPrice || 0);
        }, 0);

        return res.status(status.OK).json({
            success: true,
            message: 'Customer cart fetched successfully',
            data: {
                userId: user._id,
                customerId: customer._id,
                totalItems: cart.items.length,
                cartTotal,
                cart,
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCustomerOrderHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

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

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer detail not found for this user',
            });
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const filter = {
            $or: [
                { customer: customer._id },
                { user: user._id },
            ],
        };

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('customer', 'addressLine1 city state pincode country addressType')
                .populate('user', 'name email phone role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        const totalSpent = await Order.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Customer order history fetched successfully',
            data: orders,
            summary: {
                totalOrders: totalSpent[0]?.totalOrders || 0,
                totalSpent: totalSpent[0]?.totalSpent || 0,
            },
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