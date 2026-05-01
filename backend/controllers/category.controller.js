const mongoose = require('mongoose');
const Category = require('../models/Category.model');
const status = require('../utils/statusCodes');
const uploadToImagekit = require('../utils/uploadToImagekit');
const { getCategoryImageUrl } = require('../utils/imageUrl');

exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        const existingCategory = await Category.findOne({
            category_name: { $regex: `^${category_name}$`, $options: 'i' },
        });

        if (existingCategory) {
            return res.status(status.Conflict).json({
                success: false,
                message: 'Category already exists',
            });
        }

        let imageData = null;

        if (req.file) {
            imageData = await uploadToImagekit(req.file, '/categories');
        }

        const category = await Category.create({
            category_name,
            category_photo: imageData ? imageData.filePath : '',
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Category created successfully',
            data: {
                ...category.toObject(),
                category_photo: getCategoryImageUrl(category.category_photo),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCategoryList = async (req, res) => {
    try {
        const { search, fromDate, toDate, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (search) {
            filter.category_name = { $regex: search, $options: 'i' };
        }

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = to;
            }
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [categories, total] = await Promise.all([
            Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
            Category.countDocuments(filter),
        ]);

        const formattedCategories = categories.map((category) => ({
            ...category.toObject(),
            category_photo: getCategoryImageUrl(category.category_photo),
        }));

        return res.status(status.OK).json({
            success: true,
            message: 'Category list fetched successfully',
            data: formattedCategories,
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

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid category id',
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Category not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Category fetched successfully',
            data: {
                ...category.toObject(),
                category_photo: getCategoryImageUrl(category.category_photo),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid category id',
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Category not found',
            });
        }

        if (category_name) {
            const existingCategory = await Category.findOne({
                _id: { $ne: id },
                category_name: { $regex: `^${category_name}$`, $options: 'i' },
            });

            if (existingCategory) {
                return res.status(status.Conflict).json({
                    success: false,
                    message: 'Category already exists',
                });
            }

            category.category_name = category_name;
        }

        if (req.file) {
            const imageData = await uploadToImagekit(req.file, '/categories');
            category.category_photo = imageData ? imageData.filePath : category.category_photo;
        }

        await category.save();

        return res.status(status.OK).json({
            success: true,
            message: 'Category updated successfully',
            data: {
                ...category.toObject(),
                category_photo: getCategoryImageUrl(category.category_photo),
            },
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Invalid category id',
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Category not found',
            });
        }

        await Category.findByIdAndDelete(id);

        return res.status(status.OK).json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};
