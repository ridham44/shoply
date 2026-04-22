const mongoose = require('mongoose');
const status = require('../utils/statusCodes');

exports.validateCustomerId = (req, res, next) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: 'Customer id is required',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: 'Invalid customer id',
            });
        }

        next();
    } catch (error) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};
