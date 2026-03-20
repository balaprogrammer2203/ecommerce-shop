const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const getCategories = asyncHandler(async (req, res) => {
  const { active } = req.query;
  const filter = {};

  if (active !== undefined) {
    filter.isActive = active === 'true' || active === true;
  }

  const categories = await Category.find(filter).sort({ isActive: -1, name: 1 });
  return res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  return res.json(category);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, isActive, parentCategory } = req.body;

  if (!name) throw new AppError('Category name is required', 400, 'VALIDATION_ERROR');

  const finalSlug = slugify(slug || name);
  if (!finalSlug) throw new AppError('Invalid category slug', 400, 'VALIDATION_ERROR');

  const category = await Category.create({
    name,
    slug: finalSlug,
    description,
    isActive: isActive ?? true,
    parentCategory: parentCategory ?? null,
  });

  return res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const updates = {};
  const { name, slug, description, isActive, parentCategory } = req.body;

  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.isActive = isActive;
  if (parentCategory !== undefined) updates.parentCategory = parentCategory;

  if (slug !== undefined) {
    const finalSlug = slugify(slug);
    if (!finalSlug) throw new AppError('Invalid category slug', 400, 'VALIDATION_ERROR');
    updates.slug = finalSlug;
  } else if (name !== undefined && slug === undefined) {
    // If slug wasn't provided, keep it consistent when name changes.
    updates.slug = slugify(name);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  return res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  // Soft delete to avoid breaking products that use the category string.
  category.isActive = false;
  await category.save();

  return res.json({ message: 'Category deactivated' });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

