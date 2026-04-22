exports.validateCreateCategory = (req, res, next) => {
    try {
        const { category_name } = req.body;

        console.log('Validating category creation:', { category_name });

        if (!category_name || !String(category_name).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.validateUpdateCategory = (req, res, next) => {
    try {
        const { category_name, category_photo } = req.body;

        if (category_name === undefined && category_photo === undefined) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update',
            });
        }

        if (category_name !== undefined && !String(category_name).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name cannot be empty',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
