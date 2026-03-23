const mongoose = require('mongoose');

const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const toIdStrings = (wishlist) => wishlist.map((id) => id.toString());

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('wishlist');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return res.json({ productIds: toIdStrings(user.wishlist || []) });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Valid productId is required', 400, 'VALIDATION_ERROR');
  }

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: product._id } },
    { returnDocument: 'after' }
  ).select('wishlist');

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return res.status(201).json({ productIds: toIdStrings(user.wishlist) });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { returnDocument: 'after' }
  ).select('wishlist');

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return res.json({ productIds: toIdStrings(user.wishlist) });
});

const mergeWishlist = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds)) {
    throw new AppError('productIds must be an array', 400, 'VALIDATION_ERROR');
  }

  const validIds = productIds
    .filter((id) => mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => new mongoose.Types.ObjectId(String(id)));

  if (validIds.length === 0) {
    const user = await User.findById(req.user._id).select('wishlist');
    return res.json({ productIds: toIdStrings(user?.wishlist || []) });
  }

  const existing = await Product.find({ _id: { $in: validIds } }).select('_id');
  const existingSet = new Set(existing.map((d) => d._id.toString()));
  const toAdd = validIds.filter((id) => existingSet.has(id.toString()));

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: { $each: toAdd } } },
    { returnDocument: 'after' }
  ).select('wishlist');

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return res.json({ productIds: toIdStrings(user.wishlist) });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
};
