const mongoose = require('mongoose');

/**
 * Filter metadata per category (RAM, Storage, Color, …) with constrained enum values.
 */
const categoryAttributeSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    /** Machine key used in `Product.attributes` and query params */
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 64,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    values: {
      type: [{ type: String, trim: true }],
      default: [],
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

categoryAttributeSchema.index({ categoryId: 1, key: 1 }, { unique: true });
categoryAttributeSchema.index({ categoryId: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('CategoryAttribute', categoryAttributeSchema);
