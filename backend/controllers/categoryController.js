const mongoose = require('mongoose');

const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  refreshCategoryIsLeaf,
  resolveCategoryByIdOrSlug,
  rebuildSubtreePaths,
} = require('../services/categoryHierarchyService');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const collectDescendantIds = async (rootId) => {
  const out = [];
  const walk = async (pid) => {
    const children = await Category.find({ parentId: pid }).select('_id');
    for (const ch of children) {
      out.push(ch._id);
      await walk(ch._id);
    }
  };
  await walk(rootId);
  return out;
};

const assertValidParent = async (categoryId, newParentId) => {
  if (!newParentId) return;

  if (!mongoose.Types.ObjectId.isValid(newParentId)) {
    throw new AppError('Invalid parent category id', 400, 'VALIDATION_ERROR');
  }

  if (categoryId && newParentId.toString() === categoryId.toString()) {
    throw new AppError('Category cannot be its own parent', 400, 'VALIDATION_ERROR');
  }

  const parent = await Category.findById(newParentId);
  if (!parent) throw new AppError('Parent category not found', 404, 'CATEGORY_NOT_FOUND');
  if (parent.level >= 2) {
    throw new AppError('Parent is at maximum depth; cannot attach under it', 400, 'VALIDATION_ERROR');
  }

  if (categoryId) {
    const descendants = await collectDescendantIds(categoryId);
    const ids = new Set([categoryId.toString(), ...descendants.map((d) => d.toString())]);
    if (ids.has(newParentId.toString())) {
      throw new AppError('Invalid parent: would create a cycle in the category tree', 400, 'VALIDATION_ERROR');
    }
  }
};

const normalizeParentInput = (body) => {
  const raw = body.parentId ?? body.parentCategory;
  if (raw === undefined || raw === null || raw === '') return null;
  return raw;
};

/** Default: active only. Use `active=all` for admin views that need inactive rows. */
const activeFilterFromQuery = (active) => {
  if (active === 'all' || active === 'both') return {};
  if (active === 'false' || active === false || active === '0') return { isActive: false };
  return { isActive: true };
};

const getCategories = asyncHandler(async (req, res) => {
  const filter = activeFilterFromQuery(req.query.active);

  const categories = await Category.find(filter)
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .populate('parentId', 'name slug path level');
  return res.json(categories);
});

/**
 * Nested tree for storefront / admin menus.
 */
const getCategoryTree = asyncHandler(async (req, res) => {
  const filter = activeFilterFromQuery(req.query.active);

  const all = await Category.find(filter).sort({ level: 1, sortOrder: 1, name: 1 }).lean();

  const byId = new Map();
  all.forEach((c) => {
    byId.set(c._id.toString(), { ...c, children: [] });
  });

  const roots = [];
  byId.forEach((node) => {
    const pid = node.parentId ? node.parentId.toString() : null;
    if (!pid) {
      roots.push(node);
    } else {
      const parent = byId.get(pid);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });

  return res.json(roots);
});

const getCategoryBreadcrumbs = asyncHandler(async (req, res) => {
  const cat = await resolveCategoryByIdOrSlug(req.params.id);
  if (!cat) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const trail = [];
  if (cat.ancestors?.length) {
    const anc = await Category.find({ _id: { $in: cat.ancestors } })
      .select('name slug path')
      .lean();
    const byId = new Map(anc.map((a) => [a._id.toString(), a]));
    for (const id of cat.ancestors) {
      const a = byId.get(id.toString());
      if (a) trail.push(a);
    }
  }

  trail.push({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    path: cat.path,
  });

  return res.json(trail);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await resolveCategoryByIdOrSlug(req.params.id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  await category.populate('parentId', 'name slug path level');
  return res.json(category);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, isActive, sortOrder, image, metaTitle, metaDescription } = req.body;

  if (!name) throw new AppError('Category name is required', 400, 'VALIDATION_ERROR');

  const finalSlug = slugify(slug || name);
  if (!finalSlug) throw new AppError('Invalid category slug', 400, 'VALIDATION_ERROR');

  let parentId = normalizeParentInput(req.body);
  if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
    throw new AppError('Invalid parent category id', 400, 'VALIDATION_ERROR');
  }

  await assertValidParent(null, parentId);

  const duplicate = await Category.findOne({ slug: finalSlug, parentId: parentId || null });
  if (duplicate) {
    throw new AppError('A category with this slug already exists under the same parent', 409, 'DUPLICATE_SLUG');
  }

  const category = await Category.create({
    name,
    slug: finalSlug,
    description,
    isActive: isActive ?? true,
    parentId: parentId || null,
    sortOrder: sortOrder ?? 0,
    image,
    metaTitle,
    metaDescription,
  });

  return res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const previousPath = category.path;
  const previousParent = category.parentId ? category.parentId.toString() : '';

  const { name, slug, description, isActive, sortOrder, image, metaTitle, metaDescription } = req.body;

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (image !== undefined) category.image = image;
  if (metaTitle !== undefined) category.metaTitle = metaTitle;
  if (metaDescription !== undefined) category.metaDescription = metaDescription;

  if (req.body.parentId !== undefined || req.body.parentCategory !== undefined) {
    let nextParent = normalizeParentInput(req.body);
    if (nextParent && !mongoose.Types.ObjectId.isValid(nextParent)) {
      throw new AppError('Invalid parent category id', 400, 'VALIDATION_ERROR');
    }
    await assertValidParent(category._id, nextParent);
    category.parentId = nextParent;
  }

  if (slug !== undefined) {
    const finalSlug = slugify(slug);
    if (!finalSlug) throw new AppError('Invalid category slug', 400, 'VALIDATION_ERROR');
    category.slug = finalSlug;
  } else if (name !== undefined && slug === undefined) {
    category.slug = slugify(name);
  }

  const parentForUniqueness = category.parentId;
  const dup = await Category.findOne({
    slug: category.slug,
    parentId: parentForUniqueness || null,
    _id: { $ne: category._id },
  });
  if (dup) {
    throw new AppError('A category with this slug already exists under the same parent', 409, 'DUPLICATE_SLUG');
  }

  await category.save();

  const nextParent = category.parentId ? category.parentId.toString() : '';
  if (category.path !== previousPath || nextParent !== previousParent) {
    await rebuildSubtreePaths(category._id);
  }

  if (category.parentId) await refreshCategoryIsLeaf(category.parentId);

  return res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const childCount = await Category.countDocuments({ parentId: category._id });
  if (childCount > 0) {
    throw new AppError('Cannot deactivate category while it has subcategories', 400, 'CATEGORY_HAS_CHILDREN');
  }

  const parentId = category.parentId;
  category.isActive = false;
  await category.save();

  await refreshCategoryIsLeaf(category._id);
  if (parentId) await refreshCategoryIsLeaf(parentId);

  return res.json({ message: 'Category deactivated' });
});

module.exports = {
  getCategories,
  getCategoryTree,
  getCategoryBreadcrumbs,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
