const express = require('express');
const router = express.Router();

const controller = require('../controllers/product.controller');
const validation = require('../validations/product.validation');
const adminAuth = require('../middleware/authorizeAdmin.middleware');

router.post('/', adminAuth, validation.validateCreateProduct, controller.createProduct);
router.get('/', controller.getProductList);
router.get('/:id', controller.getProductById);
router.put('/:id', adminAuth, validation.validateUpdateProduct, controller.updateProduct);
router.delete('/:id', adminAuth, controller.deleteProduct);

module.exports = router;
