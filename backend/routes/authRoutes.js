const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

module.exports = router;

