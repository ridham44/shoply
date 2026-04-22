const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');

// Create customer
router.post('/', customerController.createCustomer);

// Get all customers
router.get('/', customerController.getCustomers);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Update customer
router.put('/:id', customerController.updateCustomer);

// Delete customer
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
