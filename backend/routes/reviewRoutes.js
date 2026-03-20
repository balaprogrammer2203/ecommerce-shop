const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { getProductReviews, createOrUpdateReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/products/:productId', getProductReviews);
router.post('/products/:productId', protect, createOrUpdateReview);

module.exports = router;

