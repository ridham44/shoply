const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Multer setup for photo upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Register route
router.post('/register', upload.single('photo'), [
    check('email').isEmail(),
    check('password').isLength({ min: 6 })
], authController.register);

// Login route
router.post('/login', authController.login);

// Forgot password route
router.post('/forgot-password', [
    check('email').isEmail()
], authController.forgotPassword);

// Password reset route
router.post('/reset-password', [
    check('email').isEmail(),
    check('oldPassword').notEmpty(),
    check('newPassword').isLength({ min: 6 })
], authController.resetPassword);

module.exports = router;