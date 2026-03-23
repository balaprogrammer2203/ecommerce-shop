const mongoose = require('mongoose');

/**
 * Lazy-load the Category model to avoid a circular dependency:
 * `models/Category` → this service → `models/Category` (incomplete export).
 */
const getCategoryModel = () => require('../models/Category');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Recompute isLeaf from active children count.
 */
const refreshCategoryIsLeaf = async (categoryId) => {
  const Category = getCategoryModel();
  if (!categoryId) return;
  const activeChildren = await Category.countDocuments({ parentId: categoryId, isActive: true });
  await Category.updateOne({ _id: categoryId }, { $set: { isLeaf: activeChildren === 0 } });
};

/**
 * Category id + all descendants (by path prefix), active only.
 */
const getDescendantCategoryIds = async (categoryDoc) => {
  const Category = getCategoryModel();
  if (!categoryDoc) return [];
  const basePath = categoryDoc.path;
  const escaped = escapeRegex(basePath);
  const descendants = await Category.find({
    isActive: true,
    $or: [{ _id: categoryDoc._id }, { path: { $regex: new RegExp(`^${escaped}(/|$)`) } }],
  })
    .select('_id')
    .lean();
  return descendants.map((c) => c._id);
};

const resolveCategoryByIdOrSlug = async (idOrSlug) => {
  const Category = getCategoryModel();
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug) && String(new mongoose.Types.ObjectId(idOrSlug)) === idOrSlug) {
    return Category.findById(idOrSlug);
  }
  return Category.findOne({ slug: idOrSlug, isActive: true });
};

/**
 * Build denormalized snapshot for embedding on products.
 */
const buildCategorySnapshot = (cat) => {
  if (!cat) return null;
  return {
    _id: cat._id,
    slug: cat.slug,
    path: cat.path,
    name: cat.name,
  };
};

/**
 * After a category's slug or parent changes, re-save descendants breadth-first
 * so each `pre('validate')` hook recomputes path / ancestors / level.
 */
const rebuildSubtreePaths = async (rootId) => {
  const Category = getCategoryModel();
  const root = await Category.findById(rootId);
  if (!root) return;
  let frontier = [root];
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      const kids = await Category.find({ parentId: p._id }).sort({ sortOrder: 1, name: 1 });
      for (const k of kids) {
        k.parentId = p._id;
        await k.save();
        const fresh = await Category.findById(k._id);
        if (fresh) next.push(fresh);
      }
    }
    frontier = next;
  }
};

module.exports = {
  escapeRegex,
  refreshCategoryIsLeaf,
  getDescendantCategoryIds,
  resolveCategoryByIdOrSlug,
  buildCategorySnapshot,
  rebuildSubtreePaths,
};
