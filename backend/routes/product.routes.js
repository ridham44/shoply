const express = require('express');
const router = express.Router();

const controller = require('../controllers/product.controller');
const validation = require('../validations/product.validation');
const adminOnly = require('../middleware/authorizeAdmin.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');

router.post('/', adminAuth, adminOnly, validation.validateCreateProduct, controller.createProduct);
router.get('/', controller.getProductList);
router.get('/:id', controller.getProductById);
router.put('/:id', adminAuth, adminOnly, validation.validateUpdateProduct, controller.updateProduct);
router.delete('/:id', adminAuth, adminOnly, controller.deleteProduct);

module.exports = router;
