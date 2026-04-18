const express = require('express');

const {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
} = require('../controllers/adminUserController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAdminUsers);
router.get('/:id', protect, admin, getAdminUserById);
router.put('/:id', protect, admin, updateAdminUser);
router.delete('/:id', protect, admin, deleteAdminUser);

module.exports = router;
