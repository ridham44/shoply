const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const status = require('../utils/statusCodes');

// Create customer detail by userId
exports.createCustomer = async (req, res) => {
    try {
        const userId = req.user?.id;

        const {
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            country,
            addressType,
        } = req.body;

        if (!userId) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Unauthorized user',
            });
        }

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

        const existingCustomer = await Customer.findOne({
            userId: user._id,
            deletedAt: null,
        });

        if (existingCustomer) {
            return res.status(status.Conflict).json({
                success: false,
                message: 'Customer detail already exists for this user',
            });
        }

        const customer = await Customer.create({
            userId: user._id,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            country,
            addressType,
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Customer detail created successfully',
            data: customer,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
// Get all customers from User collection
exports.getCustomers = async (req, res) => {
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
            User.find(filter).select('_id name email phone role createdAt updatedAt').sort({ createdAt: -1 }).skip(skip).limit(limitNumber),

            User.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Customers fetched successfully',
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

// Get customer detail by userId
exports.getCustomerByUserId = async (req, res) => {
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

        return res.status(status.OK).json({
            success: true,
            message: 'Customer fetched successfully',
            data: {
                user,
                customer: customer || null,
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

// Update customer detail by userId
exports.updateCustomer = async (req, res) => {
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

        const allowedFields = ['addressLine1', 'addressLine2', 'landmark', 'city', 'state', 'pincode', 'country', 'addressType'];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const customer = await Customer.findOneAndUpdate(
            {
                userId: user._id,
                deletedAt: null,
            },
            updateData,
            {
                new: true,
                runValidators: true,
            },
        ).populate('userId', 'name email phone role');

        if (!customer) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer detail not found for this user',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

// Hard delete customer and user by userId
exports.deleteCustomer = async (req, res) => {
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

        await Customer.deleteOne({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        return res.status(status.OK).json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
