const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (v) => Number.isFinite(v),
        message: 'Price must be a valid number',
      },
    },
    image: {
      type: String,
    },
    // Keep `category` as a string for backward compatibility with the frontend.
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Optional reference for future integrations.
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 120,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' }, { weights: { name: 10 }, default_language: 'english' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

