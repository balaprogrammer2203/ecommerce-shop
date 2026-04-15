const mongoose = require('mongoose');

const megaMenuLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    /** Target category slug (matches `Category.slug`; used for `/category/:slug` links) */
    categorySlug: { type: String, required: true, trim: true, lowercase: true },
    badge: { type: String, enum: ['new', 'trending', 'sale'], default: undefined },
  },
  { _id: false },
);

const megaMenuColumnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    links: { type: [megaMenuLinkSchema], default: [] },
  },
  { _id: false },
);

const megaMenuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    columns: { type: [megaMenuColumnSchema], default: [] },
  },
  { _id: false },
);

/**
 * Singleton storefront mega-menu (Myntra-style columns). Seeded from `megaMenuSeed.js`.
 */
const megaMenuSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true, index: true },
    items: { type: [megaMenuItemSchema], default: [] },
  },
  { timestamps: true },
);

megaMenuSchema.index({ key: 1 });

module.exports = mongoose.model('MegaMenu', megaMenuSchema);
