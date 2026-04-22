const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all cart routes
router.use(isAuthenticated);

// Increment or decrement cart item quantity
router.put('/item/quantity', cartController.updateCartItemQuantity);

// Get cart item by productId, colour, and size
router.get('/:userId/item/:productId', cartController.getCartItem);

// Update cart item by productId, colour, and size
router.put('/item/update', cartController.updateCartItemByProduct);

// Delete cart item by productId, colour, and size
router.delete('/item/delete', cartController.deleteCartItemByProduct);

// Create or add item to cart
router.post('/', cartController.createOrUpdateCart);

// Get cart for logged-in user (token-based)
router.get('/', cartController.getCart);

// Update cart item
router.put('/item', cartController.updateCartItem);

// Delete cart item
router.delete('/item', cartController.deleteCartItem);

// Delete entire cart
router.delete('/', cartController.deleteCart);

module.exports = router;
