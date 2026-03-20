const mongoose = require('mongoose');

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getMyCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    const created = await Cart.create({ user: userId, items: [] });
    return res.json(created);
  }

  return res.json(cart);
});

const addItemToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, product, qty } = req.body;

  const finalProductId = productId ?? product;
  const numericQty = Number(qty);

  if (!finalProductId || !mongoose.Types.ObjectId.isValid(finalProductId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  if (!Number.isInteger(numericQty) || numericQty < 1) {
    throw new AppError('Quantity must be an integer >= 1', 400, 'VALIDATION_ERROR');
  }

  const productDoc = await Product.findById(finalProductId);
  if (!productDoc) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const cart = await Cart.findOne({ user: userId });
  const nextCart = cart ?? (await Cart.create({ user: userId, items: [] }));

  const existingItem = nextCart.items.find((it) => it.product.toString() === finalProductId);
  if (existingItem) {
    existingItem.qty += numericQty;
    existingItem.price = productDoc.price;
    existingItem.name = productDoc.name;
    existingItem.image = productDoc.image;
  } else {
    nextCart.items.push({
      product: productDoc._id,
      name: productDoc.name,
      qty: numericQty,
      price: productDoc.price,
      image: productDoc.image,
    });
  }

  nextCart.recalculateTotals();
  await nextCart.save();

  return res.status(201).json(await nextCart.populate('items.product'));
});

const updateCartItemQty = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { qty } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  const numericQty = Number(qty);
  if (!Number.isInteger(numericQty) || numericQty < 1) {
    throw new AppError('Quantity must be an integer >= 1', 400, 'VALIDATION_ERROR');
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');

  const item = cart.items.find((it) => it.product.toString() === productId);
  if (!item) throw new AppError('Item not found in cart', 404, 'CART_ITEM_NOT_FOUND');

  item.qty = numericQty;

  const productDoc = await Product.findById(productId);
  if (productDoc) {
    item.price = productDoc.price;
    item.name = productDoc.name;
    item.image = productDoc.image;
  }

  cart.recalculateTotals();
  await cart.save();

  return res.json(await cart.populate('items.product'));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, 'INVALID_ID');
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');

  cart.items = cart.items.filter((it) => it.product.toString() !== productId);
  cart.recalculateTotals();
  await cart.save();

  return res.json(await cart.populate('items.product'));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId });

  if (!cart) return res.json({ message: 'Cart was already empty' });

  cart.items = [];
  cart.recalculateTotals();
  await cart.save();

  return res.json(await cart.populate('items.product'));
});

module.exports = {
  getMyCart,
  addItemToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
};

