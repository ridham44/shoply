const mongoose = require('mongoose');
const status = require('../utils/statusCodes');


exports.validateCreateReview = (req, res, next) => {
    try {
        const { productId, customerName, rating, review } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Valid productId is required',
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        if (!review || !String(review).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Review is required',
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

exports.validateUpdateReview = (req, res, next) => {
    try {
        const { id } = req.params;
        const { productId, rating, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid review id',
            });
        }

        if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid productId',
            });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        if (status && !['Active', 'Inactive'].includes(status)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Status must be Active or Inactive',
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

exports.validateReviewId = (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid review id',
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