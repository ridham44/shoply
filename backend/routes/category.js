const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const multer = require('multer');

// Multer setup for category photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Admin routes (CRUD)
router.post('/admin', upload.single('category_photo'), categoryController.createCategory);
router.put('/admin/:id', upload.single('category_photo'), categoryController.updateCategory);
router.delete('/admin/:id', categoryController.deleteCategory);
router.get('/admin', categoryController.getAllCategoriesAdmin);

// User route (GET only)
router.get('/user', categoryController.getAllCategoriesUser);

module.exports = router;
