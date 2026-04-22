const mongoose = require('mongoose');
const Category = require('../models/category');
const status = require('../utils/statusCodes');

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

        const category = await Category.create({
            category_name,
            category_photo: req.file ? req.file.filename : '',
        });

        return res.status(status.CREATED).json({
            success: true,
            message: 'Category created successfully',
            data: category,
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

        const category = await Category.findById(id);

        if (!category) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Category not found',
            });
        }

        if (category_name) {
            category.category_name = category_name;
        }

        if (req.file) {
            category.category_photo = req.file.filename;
        }

        await category.save();

        return res.status(status.OK).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
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
        const { search, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (search) {
            filter.category_name = { $regex: search, $options: 'i' };
        }

        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [categories, total] = await Promise.all([
            Category.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Category.countDocuments(filter),
        ]);

        return res.status(status.OK).json({
            success: true,
            message: 'Category list fetched successfully',
            data: categories,
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
            data: category,
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