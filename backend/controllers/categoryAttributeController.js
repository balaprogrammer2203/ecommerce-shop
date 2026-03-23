const mongoose = require('mongoose');

const Category = require('../models/Category');
const CategoryAttribute = require('../models/CategoryAttribute');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const slugifyKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)+/g, '');

const listCategoryAttributes = asyncHandler(async (req, res) => {
  const { categoryId, active } = req.query;
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Valid categoryId query param is required', 400, 'VALIDATION_ERROR');
  }

  const filter = { categoryId };
  if (active !== undefined) {
    filter.isActive = active === 'true' || active === true;
  }

  const rows = await CategoryAttribute.find(filter).sort({ sortOrder: 1, label: 1 });
  return res.json(rows);
});

const getCategoryAttributeById = asyncHandler(async (req, res) => {
  const row = await CategoryAttribute.findById(req.params.id);
  if (!row) throw new AppError('Category attribute not found', 404, 'NOT_FOUND');
  return res.json(row);
});

const createCategoryAttribute = asyncHandler(async (req, res) => {
  const { categoryId, key, label, values, sortOrder, isActive } = req.body;

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Valid categoryId is required', 400, 'VALIDATION_ERROR');
  }
  if (!label) throw new AppError('label is required', 400, 'VALIDATION_ERROR');

  const cat = await Category.findById(categoryId);
  if (!cat) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const finalKey = slugifyKey(key || label);
  if (!finalKey) throw new AppError('Invalid attribute key', 400, 'VALIDATION_ERROR');

  const row = await CategoryAttribute.create({
    categoryId,
    key: finalKey,
    label,
    values: Array.isArray(values) ? values : [],
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
  });

  return res.status(201).json(row);
});

const updateCategoryAttribute = asyncHandler(async (req, res) => {
  const row = await CategoryAttribute.findById(req.params.id);
  if (!row) throw new AppError('Category attribute not found', 404, 'NOT_FOUND');

  const { key, label, values, sortOrder, isActive } = req.body;

  if (label !== undefined) row.label = label;
  if (values !== undefined) row.values = Array.isArray(values) ? values : [];
  if (sortOrder !== undefined) row.sortOrder = sortOrder;
  if (isActive !== undefined) row.isActive = isActive;
  if (key !== undefined) {
    const k = slugifyKey(key);
    if (!k) throw new AppError('Invalid attribute key', 400, 'VALIDATION_ERROR');
    row.key = k;
  }

  await row.save();
  return res.json(row);
});

const deleteCategoryAttribute = asyncHandler(async (req, res) => {
  const row = await CategoryAttribute.findById(req.params.id);
  if (!row) throw new AppError('Category attribute not found', 404, 'NOT_FOUND');

  await row.deleteOne();
  return res.json({ message: 'Category attribute removed' });
});

module.exports = {
  listCategoryAttributes,
  getCategoryAttributeById,
  createCategoryAttribute,
  updateCategoryAttribute,
  deleteCategoryAttribute,
};
