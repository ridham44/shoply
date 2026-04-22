const Category = require('../models/Category');

// Admin: Create category
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    let category_photo = '';
    if (req.file) {
      category_photo = req.file.filename;
    }
    const category = new Category({ category_name, category_photo });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    let updateData = { category_name };
    if (req.file) {
      updateData.category_photo = req.file.filename;
    }
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found.' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
};

// Admin: Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};

// Admin: Get all categories
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

// User: Get all categories (show only)
exports.getAllCategoriesUser = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};
