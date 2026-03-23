const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/items', protect, addToWishlist);
router.delete('/items/:productId', protect, removeFromWishlist);
router.post('/merge', protect, mergeWishlist);

module.exports = router;
