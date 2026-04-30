const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const status = require('../utils/statusCodes');
const uploadToImagekit = require('../utils/uploadToImagekit');
const { getProductImageUrl, getCategoryImageUrl } = require('../utils/imageUrl');


exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            price,
            description,
            originalPrice,
            discount,
            size,
            colour,
            stock,
            category,
            product_details,
        } = req.body;

        let productImages = [];

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) => uploadToImagekit(file, '/products'))
            );

            productImages = uploadedImages.map((image) => image.filePath);
        }

        const product = await Product.create({
            name,
            brand,
            price,
            description,
            product_images: productImages,
            originalPrice,
            discount,
            size,
            colour,
            stock,
            category,
            product_details,
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Product created successfully',
            data: {
                ...product.toObject(),
                product_images: product.product_images.map((image) => getProductImageUrl(image)),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

const formatProduct = (product) => {
    const productObj = product.toObject ? product.toObject() : product;

    return {
        ...productObj,
        product_images: Array.isArray(productObj.product_images)
            ? productObj.product_images.map((image) => getProductImageUrl(image))
            : [],
        category: productObj.category
            ? {
                  ...productObj.category,
                  category_photo: getCategoryImageUrl(productObj.category.category_photo),
              }
            : null,
    };
};

exports.getProductList = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { colour: { $regex: search, $options: 'i' } },
                { size: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) filter.category = category;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'category_name category_photo')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Product.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Product list fetched successfully',
            data: products.map(formatProduct),
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

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid product id',
            });
        }

        const product = await Product.findById(id)
            .populate('category', 'category_name category_photo')
            .populate('reviews.user', 'name email');

        if (!product) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Product not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Product fetched successfully',
            data: formatProduct(product),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid product id',
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);

            if (!categoryExists) {
                return res.status(status.BadRequest).json({
                    success: false,
                    message: 'Invalid category',
                });
            }
        }

        const updateData = { ...req.body };

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) => uploadToImagekit(file, '/products'))
            );

            updateData.product_images = uploadedImages.map((image) => image.filePath);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('category', 'category_name category_photo')
            .populate('reviews.user', 'name email');

        return res.status(status.OK).json({
            success: true,
            message: 'Product updated successfully',
            data: formatProduct(updatedProduct),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid product id',
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Product not found',
            });
        }

        await Product.findByIdAndDelete(id);

        return res.status(status.OK).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
