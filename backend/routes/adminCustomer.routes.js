const express = require('express');
const router = express.Router();

const controller = require('../controllers/customer.controller');
const auth = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

// Customer user list from User collection
router.get('/', auth, authorizeAdmin, controller.getCustomerList);

// Customer detail by userId
router.get('/:userId', auth, authorizeAdmin, controller.getCustomerDetail);

// Customer cart by userId
router.get('/:userId/cart', auth, authorizeAdmin, controller.getCustomerCart);

// Customer order history by userId
router.get('/:userId/orders', auth, authorizeAdmin, controller.getCustomerOrderHistory);

module.exports = router;
