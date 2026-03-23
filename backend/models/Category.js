const mongoose = require('mongoose');

const { refreshCategoryIsLeaf } = require('../services/categoryHierarchyService');

/**
 * Hierarchical categories: materialized path + ancestors for read-heavy listing and filters.
 * Max depth: 3 levels (L1→L2→L3). Slug unique among siblings (compound with parentId).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    /** Unique among siblings; combined with path for URL materialization */
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    /** Root → parent chain of ObjectIds (excludes self) */
    ancestors: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
    },
    /** Materialized path e.g. /electronics/mobiles/smartphones */
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 512,
    },
    level: {
      type: Number,
      min: 0,
      max: 2,
      default: 0,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    /** False when this category has at least one active child */
    isLeaf: {
      type: Boolean,
      default: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    image: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        if (ret.parentId != null) ret.parentCategory = ret.parentId;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

/** Backward-compatible alias for older clients (`parentCategory` === `parentId`). */
categorySchema.virtual('parentCategory').get(function getParentCategory() {
  return this.parentId;
});
categorySchema.virtual('parentCategory').set(function setParentCategory(v) {
  this.parentId = v;
});

categorySchema.index({ parentId: 1, slug: 1 }, { unique: true });
categorySchema.index({ path: 1 }, { unique: true });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ level: 1, isActive: 1, sortOrder: 1, name: 1 });
categorySchema.index({ isActive: 1, parentId: 1, sortOrder: 1 });

/**
 * Compute path / ancestors / level before validation so `path` satisfies `required`.
 * (If this ran only in `pre('save')`, required checks would fail first.)
 */
categorySchema.pre('validate', async function categoryPreValidate() {
  if (!this.slug) {
    throw new Error('Category slug is required');
  }

  if (this.parentId) {
    const parent = await this.constructor.findById(this.parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    if (parent.level >= 2) {
      throw new Error('Maximum category depth is 3 levels (L1 → L2 → L3)');
    }
    if (this._id && parent._id.equals(this._id)) {
      throw new Error('Category cannot be its own parent');
    }
    this.level = parent.level + 1;
    this.ancestors = [...(parent.ancestors || []), parent._id];
    this.path = `${parent.path}/${this.slug}`;
  } else {
    this.parentId = null;
    this.level = 0;
    this.ancestors = [];
    this.path = `/${this.slug}`;
  }
});

categorySchema.post('save', async function categoryPostSave(doc) {
  try {
    await refreshCategoryIsLeaf(doc._id);
    if (doc.parentId) await refreshCategoryIsLeaf(doc.parentId);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('category post save leaf refresh:', e.message);
  }
});

module.exports = mongoose.model('Category', categorySchema);
