const mongoose = require('mongoose');
const status = require('../utils/statusCodes');

const validAddressTypes = ['Home', 'Work', 'Other'];

exports.validateCreateCustomer = (req, res, next) => {
    try {
        const { addressLine1, city, state, pincode, country, addressType } = req.body;

        if (!addressLine1 || !String(addressLine1).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Address line 1 is required',
            });
        }

        if (!city || !String(city).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'City is required',
            });
        }

        if (!state || !String(state).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'State is required',
            });
        }

        if (!pincode || !String(pincode).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Pincode is required',
            });
        }

        if (!country || !String(country).trim()) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Country is required',
            });
        }

        if (!addressType) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Address type is required',
            });
        }

        if (!validAddressTypes.includes(addressType)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Address type must be Home, Work, or Other',
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

exports.validateUpdateCustomer = (req, res, next) => {
    try {
        const { userId } = req.params;
        const { addressType } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid user id',
            });
        }

        if (addressType && !validAddressTypes.includes(addressType)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Address type must be Home, Work, or Other',
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

exports.validateUserIdParam = (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid user id',
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
