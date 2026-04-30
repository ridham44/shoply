const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', auth, profileController.viewProfile);

router.put('/', auth, upload.single('profileImage'), profileController.updateProfile);

module.exports = router;
