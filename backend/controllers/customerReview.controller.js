const mongoose = require('mongoose');
const CustomerReview = require('../models/customerReview.model');
const User = require('../models/User.model');
const status = require('../utils/statusCodes');
const createNotification = require('../utils/createNotification');

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

        createNotification({
            type: 'review',
            title: `${review.rating}-Star Review Received`,
            message: `${user.name} left a ${review.rating}-star review for a product.`,
            metadata: { reviewId: review._id, userId: user._id, productId: review.productId },
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

exports.getAllReviews = async (req, res) => {
    try {
        const { search, rating, page = 1, limit = 10 } = req.query;

        const filter = { deletedAt: null };

        if (rating) {
            const ratingNum = Number(rating);
            if (ratingNum >= 1 && ratingNum <= 5) {
                filter.rating = ratingNum;
            }
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };

            const [matchedUsers, matchedProducts] = await Promise.all([
                User.find({ name: searchRegex }).select('_id'),
                require('../models/Product.model').find({ name: searchRegex }).select('_id'),
            ]);

            const userIds = matchedUsers.map((u) => u._id);
            const productIds = matchedProducts.map((p) => p._id);

            filter.$or = [
                { userId: { $in: userIds } },
                { productId: { $in: productIds } },
            ];
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [reviews, total] = await Promise.all([
            CustomerReview.find(filter)
                .select('userId productId rating review')
                .populate('userId', 'name')
                .populate('productId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            CustomerReview.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: reviews,
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
