const express = require('express');
const router = express.Router();

const controller = require('../controllers/customer.controller');
const validation = require('../validations/customer.validation');
const auth = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

router.post('/', auth, validation.validateCreateCustomer, controller.createCustomer);

router.get('/', auth, authorizeAdmin, controller.getCustomers);

router.get('/:userId', auth, validation.validateUserIdParam, controller.getCustomerByUserId);

router.put('/:userId', auth, validation.validateUpdateCustomer, controller.updateCustomer);

router.delete('/:userId', auth, validation.validateUserIdParam, controller.deleteCustomer);

module.exports = router;
