const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for photo upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve user photos with robust fallback to default.png
router.get('/photo/:filename', (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadsDir, req.params.filename);
        const defaultPath = path.join(uploadsDir, 'default.png');
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        } else {
            return res.sendFile(defaultPath);
        }
    } catch (err) {
        const defaultPath = path.join(__dirname, '../uploads', 'default.png');
        return res.sendFile(defaultPath);
    }
});

// View profile
router.get('/', isAuthenticated, profileController.viewProfile);

// Update profile (with optional photo upload)
router.put('/', upload.single('photo'), isAuthenticated, profileController.updateProfile);

module.exports = router;