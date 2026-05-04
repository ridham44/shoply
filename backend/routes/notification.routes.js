const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/authorizeAdmin.middleware');

router.get('/', auth, authorizeAdmin, controller.getNotifications);
router.get('/unread', auth, authorizeAdmin, controller.getUnreadNotifications);
router.patch('/read-all', auth, authorizeAdmin, controller.markAllAsRead);
router.patch('/reset-all', auth, authorizeAdmin, controller.resetAll);
router.delete('/clear-all', auth, authorizeAdmin, controller.clearAll);
router.patch('/:id/read', auth, authorizeAdmin, controller.markAsRead);
router.delete('/:id', auth, authorizeAdmin, controller.removeNotification);

module.exports = router;
