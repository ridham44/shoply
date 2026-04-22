const express = require('express');
const router = express.Router();

const controller = require('../controllers/adminCustomer.controller');
const validation = require('../validations/adminCustomer.validation');
const authMiddleware = require('../middleware/adminAuth.middleware');
const adminOnly = require('../middleware/authorizeAdmin.middleware');

router.get('/', authMiddleware, adminOnly, controller.getCustomerList);

router.get('/:customerId', authMiddleware, adminOnly, validation.validateCustomerId, controller.getCustomerDetail);

router.get('/:customerId/cart', authMiddleware, adminOnly, validation.validateCustomerId, controller.getCustomerCart);

router.get('/:customerId/order-history', authMiddleware, adminOnly, validation.validateCustomerId, controller.getCustomerOrderHistory);

module.exports = router;
