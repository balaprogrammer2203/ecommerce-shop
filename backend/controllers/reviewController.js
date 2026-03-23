const mongoose = require('mongoose');

const Product = require('../models/Product');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getPagination = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  return {
    page: Math.max(page, 1),
    limit: Math.min(Math.max(limit, 1), 50),
  };
};

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit } = getPagination(req);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  const filter = { product: productId, isApproved: true };
  const count = await Review.countDocuments(filter);

  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(limit * (page - 1))
    .limit(limit);

  return res.json({
    reviews,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

const createOrUpdateReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const { rating, title, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError('Rating must be an integer between 1 and 5', 400, 'VALIDATION_ERROR');
  }

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const review = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    {
      $set: {
        rating: numericRating,
        title,
        comment,
        isApproved: true,
      },
    },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );

  // Update product review stats.
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating ?? 0;
  const numReviews = stats[0]?.numReviews ?? 0;

  await Product.findByIdAndUpdate(productId, { averageRating: avgRating, numReviews }, { returnDocument: 'before' });

  return res.status(201).json(review);
});

module.exports = {
  getProductReviews,
  createOrUpdateReview,
};

