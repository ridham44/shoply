const express = require('express');
const router = express.Router();

const controller = require('../controllers/admin.controller');
const validation = require('../validations/admin.validation');
const adminAuth = require('../middleware/adminAuth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

router.post('/register/send-otp', validation.validateSendRegisterOtp, controller.sendRegisterOtp);
router.post('/register/verify-otp', validation.validateVerifyRegisterOtp, controller.verifyRegisterOtp);
router.get('/details', adminAuth, authorizeAdmin, controller.getAdminDetails);
router.get('/details/:id', adminAuth, authorizeAdmin, controller.getAdminById);
router.post('/login/send-otp', validation.validateSendLoginOtp, controller.sendLoginOtp);
router.post('/login/resend-otp', validation.validateResendLoginOtp, controller.resendLoginOtp);
router.post('/login/verify-otp', validation.validateVerifyLoginOtp, controller.verifyLoginOtp);

router.post('/logout', adminAuth, authorizeAdmin, controller.logoutAdmin);

module.exports = router;
