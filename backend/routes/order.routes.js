const express = require('express');
const router = express.Router();

const controller = require('../controllers/order.controller');
const validation = require('../validations/order.validation');
const auth = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

router.post('/', auth, validation.validateCreateOrder, controller.createOrder);

router.get('/', auth, authorizeAdmin, controller.getOrders);

router.get('/my', auth, controller.getMyOrders);

router.get('/:id', auth, validation.validateOrderId, controller.getOrderById);

router.patch('/status/:id', auth, authorizeAdmin, validation.validateOrderId, validation.validateUpdateOrderStatus, controller.updateOrderStatus);

router.delete('/:id', auth, authorizeAdmin, validation.validateOrderId, controller.deleteOrder);

module.exports = router;
