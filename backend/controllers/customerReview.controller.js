const mongoose = require('mongoose');
const CustomerReview = require('../models/customerReview.model');
const User = require('../models/User.model');
const status = require('../utils/statusCodes');

exports.createReview = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Unauthorized user',
            });
        }

        const user = await User.findOne({
            _id: userId,
            role: 'customer',
            deletedAt: null,
        }).select('name phone email profileImage role');

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer user not found',
            });
        }

        const review = await CustomerReview.create({
            ...req.body,
            userId,
            customerName: user.name,
            customerPhone: user.phone,
            customerEmail: user.email,
            customerProfileImage: user.profileImage,
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Review created successfully',
            data: review,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid product ID',
            });
        }

        const reviews = await CustomerReview.find({
            productId,
            deletedAt: null,
        })
            .select('userId rating review')
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        return res.status(status.OK).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await CustomerReview.findOne({
            _id: id,
            deletedAt: null,
        })
            .populate('productId', 'name brand price product_images')
            .populate('userId', 'name phone email profileImage role');

        if (!review) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Review fetched successfully',
            data: review,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const allowedFields = ['rating', 'review'];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const review = await CustomerReview.findOneAndUpdate(
            {
                _id: id,
                deletedAt: null,
            },
            updateData,
            {
                new: true,
                runValidators: true,
            },
        )
            .populate('productId', 'name brand price product_images')
            .populate('userId', 'name phone email profileImage role');

        if (!review) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await CustomerReview.findOneAndUpdate(
            {
                _id: id,
                deletedAt: null,
            },
            {
                deletedAt: new Date(),
            },
            {
                new: true,
            },
        );

        if (!review) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: reviewStatus } = req.body;

        if (!['Active', 'Inactive'].includes(reviewStatus)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Status must be Active or Inactive',
            });
        }

        const review = await CustomerReview.findOneAndUpdate(
            {
                _id: id,
                deletedAt: null,
            },
            {
                status: reviewStatus,
            },
            {
                new: true,
                runValidators: true,
            },
        )
            .populate('productId', 'name brand price product_images')
            .populate('userId', 'name phone email profileImage role');

        if (!review) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Review not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Review status updated successfully',
            data: review,
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
