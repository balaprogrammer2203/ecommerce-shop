const express = require('express');

const {
  getCategories,
  getCategoryTree,
  getCategoryBreadcrumbs,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/tree', getCategoryTree);
router.get('/:id/breadcrumbs', getCategoryBreadcrumbs);
router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
