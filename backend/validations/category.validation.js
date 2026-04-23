const mongoose = require('mongoose');
const status = require('../utils/statusCodes');

exports.validateCreateCategory = (req, res, next) => {
    try {
        const { category_name } = req.body;

        if (!category_name || !String(category_name).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Category name is required',
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
exports.validateUpdateCategory = (req, res, next) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid category id',
            });
        }

        if (category_name !== undefined && !String(category_name).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Category name cannot be empty',
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
