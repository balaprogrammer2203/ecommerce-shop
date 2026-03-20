const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const {
  getMyCart,
  addItemToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

router.get('/', protect, getMyCart);
router.post('/items', protect, addItemToCart);
router.put('/items/:productId', protect, updateCartItemQty);
router.delete('/items/:productId', protect, removeCartItem);
router.delete('/clear', protect, clearCart);

module.exports = router;

