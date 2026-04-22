const mongoose = require('mongoose');

exports.validateCreateProduct = (req, res, next) => {
    try {
        const {
            name,
            brand,
            price,
            description,
            product_images,
            originalPrice,
            size,
            colour,
            stock,
            category,
            product_details,
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        if (!brand || !String(brand).trim()) {
            return res.status(400).json({ success: false, message: 'Brand is required' });
        }

        if (price === undefined || Number(price) < 0) {
            return res.status(400).json({ success: false, message: 'Valid price is required' });
        }

        if (!description || !String(description).trim()) {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }

        if (!Array.isArray(product_images) || product_images.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product image is required' });
        }

        if (originalPrice === undefined || Number(originalPrice) < 0) {
            return res.status(400).json({ success: false, message: 'Valid original price is required' });
        }

        if (!size || !String(size).trim()) {
            return res.status(400).json({ success: false, message: 'Size is required' });
        }

        if (!colour || !String(colour).trim()) {
            return res.status(400).json({ success: false, message: 'Colour is required' });
        }

        if (stock === undefined || Number(stock) < 0) {
            return res.status(400).json({ success: false, message: 'Valid stock is required' });
        }

        if (!category || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: 'Valid category is required' });
        }

        if (!product_details || !String(product_details).trim()) {
            return res.status(400).json({ success: false, message: 'Product details are required' });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.validateUpdateProduct = (req, res, next) => {
    try {
        const {
            name,
            brand,
            price,
            description,
            product_images,
            originalPrice,
            discount,
            size,
            colour,
            stock,
            category,
            product_details,
        } = req.body;

        if (
            name === undefined &&
            brand === undefined &&
            price === undefined &&
            description === undefined &&
            product_images === undefined &&
            originalPrice === undefined &&
            discount === undefined &&
            size === undefined &&
            colour === undefined &&
            stock === undefined &&
            category === undefined &&
            product_details === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update',
            });
        }

        if (price !== undefined && Number(price) < 0) {
            return res.status(400).json({ success: false, message: 'Price cannot be negative' });
        }

        if (originalPrice !== undefined && Number(originalPrice) < 0) {
            return res.status(400).json({ success: false, message: 'Original price cannot be negative' });
        }

        if (discount !== undefined && Number(discount) < 0) {
            return res.status(400).json({ success: false, message: 'Discount cannot be negative' });
        }

        if (stock !== undefined && Number(stock) < 0) {
            return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
        }

        if (category !== undefined && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' });
        }

        if (product_images !== undefined && (!Array.isArray(product_images) || product_images.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Product images must be a non-empty array',
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