const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  escapeRegex,
  getDescendantCategoryIds,
  resolveCategoryByIdOrSlug,
  buildCategorySnapshot,
} = require('../services/categoryHierarchyService');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/**
 * Stored pricing: `price` = list, `discountPrice` = optional sale.
 * Accepts legacy body: originalPrice + price (sale) like older clients.
 */
const normalizeListAndSale = (body) => {
  const rawPrice = body.price;
  if (rawPrice === undefined || rawPrice === null) return null;

  let list = Number(rawPrice);
  let sale = body.discountPrice != null && body.discountPrice !== '' ? Number(body.discountPrice) : null;

  const op = body.originalPrice;
  if (op != null && op !== '' && Number(op) > list) {
    sale = list;
    list = Number(op);
  }

  if (sale != null && (Number.isNaN(sale) || sale >= list)) {
    sale = null;
  }

  return { list, sale };
};

const parseAttributesFilter = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
};

const buildProductFilter = async (query) => {
  const {
    keyword,
    categoryId,
    categorySlug,
    category,
    minPrice,
    maxPrice,
    brand,
    attrs,
    attributes,
  } = query;

  const and = [];

  if (keyword) {
    const rx = new RegExp(escapeRegex(String(keyword)), 'i');
    and.push({
      $or: [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }],
    });
  }

  const catKey = categoryId || categorySlug || category;
  if (catKey) {
    const catDoc = await resolveCategoryByIdOrSlug(String(catKey));
    if (catDoc) {
      const ids = await getDescendantCategoryIds(catDoc);
      and.push({ 'categories._id': { $in: ids } });
    }
  }

  if (minPrice != null || maxPrice != null) {
    const mp = minPrice != null ? Number(minPrice) : null;
    const xp = maxPrice != null ? Number(maxPrice) : null;
    const parts = [];
    if (mp != null && !Number.isNaN(mp)) {
      parts.push({ $gte: [{ $ifNull: ['$discountPrice', '$price'] }, mp] });
    }
    if (xp != null && !Number.isNaN(xp)) {
      parts.push({ $lte: [{ $ifNull: ['$discountPrice', '$price'] }, xp] });
    }
    if (parts.length) {
      and.push({ $expr: { $and: parts } });
    }
  }

  if (brand) {
    and.push({ brand: new RegExp(escapeRegex(String(brand)), 'i') });
  }

  const attrObj = parseAttributesFilter(attrs ?? attributes);
  if (attrObj && typeof attrObj === 'object') {
    for (const [k, v] of Object.entries(attrObj)) {
      if (v === undefined || v === null || v === '') continue;
      and.push({ [`attributes.${k}`]: v });
    }
  }

  return and.length ? { $and: and } : {};
};

const resolvePrimaryCategoryDoc = async (body) => {
  if (body.categoryId) {
    if (!mongoose.Types.ObjectId.isValid(body.categoryId)) {
      throw new AppError('Invalid categoryId', 400, 'INVALID_CATEGORY');
    }
    const c = await Category.findById(body.categoryId);
    if (!c || !c.isActive) throw new AppError('Invalid categoryId', 400, 'INVALID_CATEGORY');
    return c;
  }

  if (body.category) {
    const s = slugify(body.category);
    let c = await Category.findOne({ slug: s, isActive: true });
    if (!c) {
      c = await Category.findOne({ name: new RegExp(`^${escapeRegex(body.category)}$`, 'i'), isActive: true });
    }
    if (!c) throw new AppError('Could not resolve category from `category` string', 400, 'INVALID_CATEGORY');
    return c;
  }

  throw new AppError('categoryId or category is required', 400, 'VALIDATION_ERROR');
};

const applyCategoryToProduct = (product, categoryDoc) => {
  const snap = buildCategorySnapshot(categoryDoc);
  product.categories = [snap];
  product.primaryCategoryId = categoryDoc._id;
  product.categoryId = categoryDoc._id;
  product.category = categoryDoc.name;
};

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const page = Math.max(1, Number(req.query.page) || 1);

  const filter = await buildProductFilter(req.query);
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  return res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize) || 1,
    total: count,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  const title = body.title || body.name;
  if (!title || !body.description) {
    throw new AppError('Missing required product fields (title/name, description)', 400, 'VALIDATION_ERROR');
  }

  const pricing = normalizeListAndSale(body);
  if (pricing == null) throw new AppError('price is required', 400, 'VALIDATION_ERROR');

  const categoryDoc = await resolvePrimaryCategoryDoc(body);

  const slug = slugify(body.slug || title);
  if (!slug) throw new AppError('Invalid product slug', 400, 'VALIDATION_ERROR');

  const slugTaken = await Product.findOne({ slug });
  if (slugTaken) throw new AppError('Product slug already in use', 409, 'DUPLICATE_SLUG');

  const images =
    Array.isArray(body.images) && body.images.length
      ? body.images
      : body.image
        ? [body.image]
        : [];

  const stock = body.stock ?? body.countInStock ?? 0;

  const product = new Product({
    title,
    slug,
    description: body.description,
    price: pricing.list,
    discountPrice: pricing.sale != null ? pricing.sale : undefined,
    brand: body.brand,
    stock,
    images,
    attributes: body.attributes && typeof body.attributes === 'object' ? body.attributes : {},
  });

  applyCategoryToProduct(product, categoryDoc);

  await product.save();
  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const body = req.body;

  if (body.title !== undefined || body.name !== undefined) {
    product.title = body.title ?? body.name;
  }
  if (body.description !== undefined) product.description = body.description;

  const pricingTouched =
    body.price !== undefined || body.discountPrice !== undefined || body.originalPrice !== undefined;
  if (pricingTouched) {
    const merged = {
      price: body.price !== undefined ? body.price : product.price,
      discountPrice:
        body.discountPrice !== undefined
          ? body.discountPrice === null || body.discountPrice === ''
            ? null
            : body.discountPrice
          : product.discountPrice,
      originalPrice: body.originalPrice,
    };
    const pricing = normalizeListAndSale(merged);
    if (pricing) {
      product.price = pricing.list;
      product.discountPrice = pricing.sale != null ? pricing.sale : undefined;
    }
  }

  if (body.slug !== undefined) {
    const s = slugify(body.slug);
    if (!s) throw new AppError('Invalid product slug', 400, 'VALIDATION_ERROR');
    product.slug = s;
  }

  if (body.images !== undefined) {
    product.images = Array.isArray(body.images) ? body.images : [];
  } else if (body.image !== undefined) {
    product.images = body.image ? [body.image] : [];
  }

  if (body.stock !== undefined || body.countInStock !== undefined) {
    product.stock = body.stock ?? body.countInStock;
  }

  if (body.brand !== undefined) product.brand = body.brand;

  if (body.attributes !== undefined && typeof body.attributes === 'object') {
    product.attributes = body.attributes;
  }

  if (body.categoryId !== undefined || body.category !== undefined) {
    const categoryDoc = await resolvePrimaryCategoryDoc({
      categoryId: body.categoryId,
      category: body.category,
    });
    applyCategoryToProduct(product, categoryDoc);
  }

  const dup = await Product.findOne({ slug: product.slug, _id: { $ne: product._id } });
  if (dup) throw new AppError('Product slug already in use', 409, 'DUPLICATE_SLUG');

  const list = Number(product.price);
  const sale = product.discountPrice != null ? Number(product.discountPrice) : null;
  if (sale != null && !Number.isNaN(sale) && sale >= list) {
    throw new AppError('discountPrice must be less than list price', 400, 'VALIDATION_ERROR');
  }

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
