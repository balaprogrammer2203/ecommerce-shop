const mongoose = require('mongoose');

const categorySnapshotSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    slug: { type: String, required: true },
    path: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

/**
 * Catalog product with denormalized category snapshots for read-heavy queries.
 *
 * Pricing (stored):
 * - `price` — list / MSRP
 * - `discountPrice` — optional sale price (must be < `price` when set)
 *
 * API JSON (`toJSON`) maps to storefront fields: `price` = amount to pay,
 * `originalPrice` = list when on sale (legacy UI).
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 220,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    /** List / regular price (MSRP) */
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    /** Sale price — must be lower than `price` when present */
    discountPrice: {
      type: Number,
      min: 0,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 120,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Denormalized category lineage for filters (no populate). */
    categories: {
      type: [categorySnapshotSchema],
      default: [],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one category snapshot is required'],
    },
    primaryCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    /** Legacy string label (primary category name) for older clients & seeds */
    category: {
      type: String,
      trim: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    images: {
      type: [{ type: String, trim: true, maxlength: 2048 }],
      default: [],
    },
    /** Dynamic specs — filter keys should align with CategoryAttribute.key */
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        const list = Number(ret.price);
        const sale = ret.discountPrice != null ? Number(ret.discountPrice) : null;
        const onSale = sale != null && !Number.isNaN(sale) && sale < list;
        const pay = onSale ? sale : list;
        ret.price = pay;
        ret.originalPrice = onSale ? list : undefined;
        ret.name = ret.title;
        ret.countInStock = ret.stock;
        ret.image = Array.isArray(ret.images) && ret.images.length ? ret.images[0] : undefined;
        if (!ret.category && Array.isArray(ret.categories) && ret.categories.length) {
          ret.category = ret.categories[0].name;
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

productSchema.index({ title: 'text', description: 'text', brand: 'text' }, { weights: { title: 10 }, default_language: 'english' });
productSchema.index({ 'categories._id': 1 });
productSchema.index({ 'categories.slug': 1 });
productSchema.index({ 'categories.path': 1 });
productSchema.index({ primaryCategoryId: 1, slug: 1 });

productSchema.statics.effectivePrice = function effectivePrice(doc) {
  const list = Number(doc.price);
  const sale = doc.discountPrice != null ? Number(doc.discountPrice) : null;
  if (sale != null && !Number.isNaN(sale) && sale < list) return sale;
  return list;
};

productSchema.statics.lineSnapshot = function lineSnapshot(doc) {
  return {
    name: doc.title,
    price: this.effectivePrice(doc),
    image: Array.isArray(doc.images) && doc.images.length ? doc.images[0] : undefined,
  };
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
