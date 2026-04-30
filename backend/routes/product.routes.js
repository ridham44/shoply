const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const controller = require('../controllers/product.controller');
const validation = require('../validations/product.validation');
const adminOnly = require('../middleware/authorizeAdmin.middleware');
const adminAuth = require('../middleware/auth.middleware');

router.post('/', adminAuth, adminOnly, upload.array('product_images', 5), validation.validateCreateProduct, controller.createProduct);
router.get('/', controller.getProductList);
router.get('/category/:categoryId', controller.getProductsByCategory);
router.get('/:id', controller.getProductById);
router.put('/:id', adminAuth, adminOnly, upload.array('product_images', 5), validation.validateUpdateProduct, controller.updateProduct);
router.delete('/:id', adminAuth, adminOnly, controller.deleteProduct);

module.exports = router;
