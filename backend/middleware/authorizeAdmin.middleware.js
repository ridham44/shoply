const status = require('../utils/statusCodes');

module.exports = (req, res, next) => {
    try {
        if (!req.admin || req.admin.role !== 'admin') {
           // console.log('Unauthorized access attempt by user:', req.admin ? req.admin.id : 'Unknown');
            return res.status(status.Forbidden).json({
                success: false,
                message: 'Access denied. Admin only',
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
