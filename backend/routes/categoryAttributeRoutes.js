const express = require('express');

const {
  listCategoryAttributes,
  getCategoryAttributeById,
  createCategoryAttribute,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} = require('../controllers/categoryAttributeController');

const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listCategoryAttributes);
router.get('/:id', getCategoryAttributeById);

router.post('/', protect, admin, createCategoryAttribute);
router.put('/:id', protect, admin, updateCategoryAttribute);
router.delete('/:id', protect, admin, deleteCategoryAttribute);

module.exports = router;
