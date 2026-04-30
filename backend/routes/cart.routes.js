const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.put('/item/quantity', cartController.updateCartItemQuantity);
router.get('/:userId/item/:productId', cartController.getCartItem);
router.put('/item/update', cartController.updateCartItemByProduct);
router.delete('/item/delete', cartController.deleteCartItemByProduct);
router.post('/', cartController.createOrUpdateCart);
router.get('/', cartController.getCart);
router.put('/item', cartController.updateCartItem);
router.delete('/item', cartController.deleteCartItem);
router.delete('/', cartController.deleteCart);

module.exports = router;
