const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { isAdmin, isAuthenticated } = require('../middleware/auth');

// Admin routes
router.post('/', isAuthenticated, isAdmin, productController.createProduct);
router.put('/:id', isAuthenticated, isAdmin, productController.updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);

// Admin view routes
router.get('/admin', isAuthenticated, isAdmin, productController.getProducts);
router.get('/admin/:id', isAuthenticated, isAdmin, productController.getProductById);

// User routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
