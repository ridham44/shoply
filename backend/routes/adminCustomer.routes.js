const express = require('express');
const router = express.Router();

const controller = require('../controllers/adminCustomer.controller');
const auth = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

router.get('/', auth, authorizeAdmin, controller.getCustomerList);

router.get('/:userId', auth, authorizeAdmin, controller.getCustomerDetail);

router.get('/:userId/cart', auth, authorizeAdmin, controller.getCustomerCart);

router.get('/:userId/orders', auth, authorizeAdmin, controller.getCustomerOrderHistory);

module.exports = router;
