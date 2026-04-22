const Customer = require('../models/Customer');
const Cart = require('../models/cart');
const Order = require('../models/order');
const status = require('../utils/statusCodes');

exports.getCustomerList = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { pincode: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [customers, total] = await Promise.all([
            Customer.find(filter)
                .select('_id fullName phoneNumber createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Customer.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Customer list fetched successfully',
            data: customers,
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
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId).populate('user', 'name email phone role');

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Customer detail fetched successfully',
            data: customer,
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
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        if (!customer.user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'This customer is not linked with any user',
            });
        }

        const cart = await Cart.findOne({ user: customer.user }).populate('items.productId');

        if (!cart) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Cart not found for this customer',
            });
        }

        const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

        return res.status(status.OK).json({
            success: true,
            message: 'Customer cart fetched successfully',
            data: {
                customerId: customer._id,
                userId: customer.user,
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
        const { customerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const filter = {
            $or: [{ customer: customer._id }, ...(customer.user ? [{ user: customer.user }] : [])],
        };

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('customer', 'fullName phoneNumber city state')
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Order.countDocuments(filter),
        ]);

        const totalSpent = await Order.aggregate([
            {
                $match: {
                    $or: [{ customer: customer._id }, ...(customer.user ? [{ user: customer.user }] : [])],
                },
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
