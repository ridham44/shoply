const express = require('express');
const router = express.Router();

const controller = require('../controllers/customerReview.controller');
const validation = require('../validations/customerReview.validation');

const auth = require('../middleware/auth.middleware');

router.post('/', auth, validation.validateCreateReview, controller.createReview);

router.get('/', auth, controller.getAllReviews);
router.get('/product/:productId', auth, controller.getReviews);

router.get('/:id', auth, validation.validateReviewId, controller.getReviewById);

router.put('/:id', auth, validation.validateUpdateReview, controller.updateReview);

router.patch('/status/:id', auth, validation.validateReviewId, controller.updateReviewStatus);

router.delete('/:id', auth, validation.validateReviewId, controller.deleteReview);

module.exports = router;
