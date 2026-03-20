const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Math.max(1, Number(req.query.limit) || 20);
  const page = Math.max(1, Number(req.query.page) || 1);

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  return res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, categoryId, countInStock, brand } = req.body;

  if (!name || !description || price === undefined) {
    throw new AppError('Missing required product fields', 400, 'VALIDATION_ERROR');
  }

  if (category === undefined && categoryId === undefined) {
    throw new AppError('Missing category information', 400, 'VALIDATION_ERROR');
  }

  let finalCategory = category;

  if (categoryId && !finalCategory) {
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) throw new AppError('Invalid categoryId', 400, 'INVALID_CATEGORY');
    finalCategory = categoryDoc.name;
  }

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category: finalCategory,
    categoryId,
    countInStock,
    brand,
  });

  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const { name, description, price, image, category, categoryId, countInStock, brand } = req.body;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (image !== undefined) product.image = image;

  // If categoryId is provided, prefer it as the source of truth.
  if (categoryId !== undefined) {
    if (categoryId === null || categoryId === '') {
      product.categoryId = undefined;
    } else {
      const categoryDoc = await Category.findById(categoryId);
      if (!categoryDoc) throw new AppError('Invalid categoryId', 400, 'INVALID_CATEGORY');
      product.categoryId = categoryDoc._id;
      product.category = categoryDoc.name;
    }
  } else if (category !== undefined) {
    product.category = category;

    // Best-effort: populate categoryId if the category exists.
    const maybeSlug = slugify(category);
    if (maybeSlug) {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: maybeSlug }, { name: new RegExp(`^${category}$`, 'i') }],
      });
      if (categoryDoc) product.categoryId = categoryDoc._id;
    }
  }

  if (countInStock !== undefined) product.countInStock = countInStock;
  if (brand !== undefined) product.brand = brand;

  const updatedProduct = await product.save();
  return res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  await product.deleteOne();
  return res.json({ message: 'Product removed' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

