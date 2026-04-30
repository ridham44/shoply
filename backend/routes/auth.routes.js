const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const customerAuth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validation = require('../validations/auth.validation');

router.post('/register', upload.single('profileImage'), validation.validateRegister, controller.register);

router.post('/login', validation.validateLogin, controller.login);

router.get('/profile', customerAuth, controller.getProfile);

router.put('/profile', customerAuth, upload.single('profileImage'), validation.validateUpdateProfile, controller.updateProfile);

router.post('/reset-password', customerAuth, validation.validateResetPassword, controller.resetPassword);
module.exports = router;
