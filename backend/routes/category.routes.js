const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');
const validation = require('../validations/category.validation');
const upload = require('../middleware/upload.middlewear');
const adminAuth = require('../middleware/authorizeAdmin.middleware');

router.post('/', adminAuth, upload.single('category_photo'), validation.validateCreateCategory, controller.createCategory);

router.get('/', controller.getCategoryList);
router.get('/:id', controller.getCategoryById);
router.put('/:id', adminAuth, upload.single('category_photo'), validation.validateUpdateCategory, controller.updateCategory);
router.delete('/:id', adminAuth, controller.deleteCategory);

module.exports = router;
