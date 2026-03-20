/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

dotenv.config();

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const CREDENTIALS = {
  admin: { email: 'admin@shopsphere.dev', password: 'AdminPass123', name: 'Admin User' },
  customer: { email: 'customer@shopsphere.dev', password: 'CustomerPass123', name: 'Customer User' },
};

const SEED = {
  categories: [
    { name: 'Electronics', description: 'Phones, laptops, and accessories' },
    { name: 'Fashion', description: 'Men and women apparel' },
    { name: 'Home & Kitchen', description: 'Appliances and home decor' },
  ],
  products: [
    {
      name: 'Android Phone X',
      description: 'A powerful Android phone with a stunning display.',
      price: 499.99,
      image: 'https://via.placeholder.com/600x400.png?text=Android+Phone+X',
      category: 'Electronics',
      countInStock: 25,
      brand: 'Nova',
    },
    {
      name: 'Laptop Pro 14',
      description: 'Lightweight laptop for work and study with long battery life.',
      price: 899.0,
      image: 'https://via.placeholder.com/600x400.png?text=Laptop+Pro+14',
      category: 'Electronics',
      countInStock: 18,
      brand: 'Aurum',
    },
    {
      name: 'Wireless Sneakers',
      description: 'Comfortable everyday sneakers with breathable materials.',
      price: 79.95,
      image: 'https://via.placeholder.com/600x400.png?text=Wireless+Sneakers',
      category: 'Fashion',
      countInStock: 60,
      brand: 'Stride',
    },
    {
      name: 'Smart Microwave 900W',
      description: 'Even heating with preset cooking modes.',
      price: 129.99,
      image: 'https://via.placeholder.com/600x400.png?text=Smart+Microwave+900W',
      category: 'Home & Kitchen',
      countInStock: 12,
      brand: 'HeatWave',
    },
  ],
  reviews: [
    { productName: 'Android Phone X', user: 'customer', rating: 5, title: 'Excellent phone', comment: 'Fast, smooth, and great battery.' },
    { productName: 'Android Phone X', user: 'admin', rating: 4, title: 'Solid performance', comment: 'Great value for the price.' },
    { productName: 'Laptop Pro 14', user: 'customer', rating: 5, title: 'Perfect for work', comment: 'Keyboard is amazing. Runs cool.' },
    { productName: 'Wireless Sneakers', user: 'customer', rating: 4, title: 'Comfortable', comment: 'Good fit and quality materials.' },
  ],
  cart: {
    user: 'customer',
    items: [
      { productName: 'Android Phone X', qty: 1 },
      { productName: 'Wireless Sneakers', qty: 2 },
    ],
  },
  orders: [
    {
      user: 'customer',
      orderItems: [
        { productName: 'Android Phone X', qty: 1 },
        { productName: 'Wireless Sneakers', qty: 1 },
      ],
      shippingAddress: { address: '123 Market St', city: 'San Francisco', postalCode: '94105', country: 'USA' },
      paymentMethod: 'stripe',
      isPaid: false,
      isDelivered: false,
    },
    {
      user: 'customer',
      orderItems: [{ productName: 'Laptop Pro 14', qty: 1 }],
      shippingAddress: { address: '456 Bay Ave', city: 'San Jose', postalCode: '95112', country: 'USA' },
      paymentMethod: 'paypal',
      isPaid: true,
      isDelivered: true,
    },
  ],
};

const upsertUser = async ({ email, password, name, role }) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ name, email, password, role });
};

const upsertCategory = async ({ name, description }) => {
  const slug = slugify(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    existing.name = name;
    existing.description = description;
    existing.isActive = true;
    existing.parentCategory = null;
    await existing.save();
    return existing;
  }
  return Category.create({ name, slug, description, isActive: true, parentCategory: null });
};

const upsertProduct = async ({ name, description, price, image, category, countInStock, brand }) => {
  const existing = await Product.findOne({ name, category });
  if (existing) {
    existing.description = description;
    existing.price = price;
    existing.image = image;
    existing.countInStock = countInStock;
    existing.brand = brand;
    // stats will be updated after we seed reviews
    await existing.save();
    return existing;
  }

  return Product.create({
    name,
    description,
    price,
    image,
    category,
    countInStock,
    brand,
  });
};

const main = async () => {
  await connectDB();

  const adminUser = await upsertUser({ ...CREDENTIALS.admin, role: 'admin' });
  const customerUser = await upsertUser({ ...CREDENTIALS.customer, role: 'customer' });

  const categoryDocs = {};
  for (const cat of SEED.categories) {
    const doc = await upsertCategory(cat);
    categoryDocs[cat.name] = doc;
  }

  const productDocs = {};
  for (const p of SEED.products) {
    // Ensure category exists for admin UX; product keeps using the string name.
    if (!categoryDocs[p.category]) throw new Error(`Missing category seed for: ${p.category}`);
    const doc = await upsertProduct(p);
    productDocs[p.name] = doc;
  }

  // Seed reviews and compute stats.
  for (const r of SEED.reviews) {
    const reviewer = r.user === 'admin' ? adminUser : customerUser;
    const product = productDocs[r.productName];
    if (!product) continue;

    await Review.findOneAndUpdate(
      { user: reviewer._id, product: product._id },
      {
        $set: {
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isApproved: true,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  const productsWithStats = await Product.find({ _id: { $in: Object.values(productDocs).map((d) => d._id) } });
  for (const p of productsWithStats) {
    const stats = await Review.aggregate([
      { $match: { product: p._id, isApproved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
    ]);
    const avgRating = stats[0]?.avgRating ?? 0;
    const numReviews = stats[0]?.numReviews ?? 0;
    p.averageRating = avgRating;
    p.numReviews = numReviews;
    await p.save();
  }

  // Upsert cart for customer.
  {
    const cart = await Cart.findOne({ user: customerUser._id });
    const nextCart = cart ?? (await Cart.create({ user: customerUser._id, items: [] }));

    nextCart.items = [];
    for (const it of SEED.cart.items) {
      const product = productDocs[it.productName];
      if (!product) continue;
      nextCart.items.push({
        product: product._id,
        name: product.name,
        qty: it.qty,
        price: product.price,
        image: product.image,
      });
    }

    nextCart.recalculateTotals();
    await nextCart.save();
  }

  // Create sample orders only if none exist for customer (idempotent).
  const existingOrders = await Order.countDocuments({ user: customerUser._id });
  if (existingOrders === 0) {
    for (const o of SEED.orders) {
      const owner = o.user === 'admin' ? adminUser : customerUser;

      const orderItems = o.orderItems
        .map((oi) => {
          const product = productDocs[oi.productName];
          if (!product) return null;
          return {
            product: product._id,
            name: product.name,
            qty: oi.qty,
            price: product.price,
            image: product.image,
          };
        })
        .filter(Boolean);

      const itemsPrice = orderItems.reduce((sum, it) => sum + it.qty * it.price, 0);
      const taxPrice = 0;
      const shippingPrice = 0;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      const order = await Order.create({
        user: owner._id,
        orderItems,
        shippingAddress: o.shippingAddress,
        paymentMethod: o.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: Boolean(o.isPaid),
        paidAt: o.isPaid ? new Date() : undefined,
        isDelivered: Boolean(o.isDelivered),
        deliveredAt: o.isDelivered ? new Date() : undefined,
      });

      // Ensure order persisted with state fields.
      await order.save();
    }
  }

  console.log('Seed complete.');
  console.log('Login as:');
  console.log(`- admin: ${CREDENTIALS.admin.email} / ${CREDENTIALS.admin.password}`);
  console.log(`- customer: ${CREDENTIALS.customer.email} / ${CREDENTIALS.customer.password}`);
};

main()
  .then(() => {
    // Allow logs to flush; do not force exit, in case nodemon attaches.
    setTimeout(() => mongoose.connection.close().catch(() => {}), 250);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });

