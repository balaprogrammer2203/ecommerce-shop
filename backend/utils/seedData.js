/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const MegaMenu = require('../models/MegaMenu');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { CATEGORY_TREE } = require('./categorySeedTree');
const { MEGA_MENU_ITEMS } = require('./megaMenuSeed');
const { buildCategorySnapshot } = require('../services/categoryHierarchyService');
const CategoryAttribute = require('../models/CategoryAttribute');

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

/**
 * Dummy product photos: Lorem Picsum with a stable seed per product.
 * Hotlink-friendly (avoids Unsplash referrer / hotlink restrictions in some browsers).
 * @see https://picsum.photos/
 */
const productImageUrl = (name, category) => {
  const seed = slugify(`${category} ${name}`).slice(0, 64) || 'product';
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
};

/** ~50 dummy products (names unique per category for upsert). */
const RAW_PRODUCTS = [
  // Electronics (18)
  ['Android Phone X', 'A powerful Android phone with a stunning display.', 499.99, 599.99, 'Electronics', 25, 'Nova'],
  ['Laptop Pro 14', 'Lightweight laptop for work and study with long battery life.', 899, 1049, 'Electronics', 18, 'Aurum'],
  ['Pro Tablet 11 inch', 'Bright LCD tablet for reading, drawing, and streaming anywhere you go.', 349.99, 399.99, 'Electronics', 30, 'Nova'],
  ['Wireless Earbuds Pro', 'Active noise cancellation with charging case and all-day comfort.', 159.99, null, 'Electronics', 80, 'PulseAudio'],
  ['Studio Headphones', 'Over-ear closed-back headphones for mixing and casual listening.', 199, 249, 'Electronics', 45, 'PulseAudio'],
  ['4K Monitor 27 inch', 'IPS panel with HDR support ideal for creative work and gaming.', 379.99, null, 'Electronics', 22, 'ViewCraft'],
  ['Mechanical Keyboard RGB', 'Hot-swappable switches with per-key lighting and aluminum frame.', 129.99, 159.99, 'Electronics', 55, 'KeyForge'],
  ['Ergonomic Wireless Mouse', 'Silent clicks and long battery life for office productivity.', 49.99, null, 'Electronics', 100, 'KeyForge'],
  ['USB-C Hub 7-in-1', 'HDMI, USB-A, SD card reader, and pass-through charging in one dock.', 59.99, null, 'Electronics', 120, 'LinkPort'],
  ['Smart Watch Series G', 'Fitness tracking, sleep scores, and notifications on your wrist.', 279, 329, 'Electronics', 40, 'Chrono'],
  ['Action Camera 4K', 'Waterproof body with stabilization for sports and travel footage.', 249.99, null, 'Electronics', 28, 'LensGo'],
  ['Portable SSD 1TB', 'USB 3.2 speeds for backups and editing on the go.', 119.99, 139.99, 'Electronics', 65, 'DataVault'],
  ['Webcam HD 1080p', 'Auto light correction and dual mics for clear video calls.', 79.99, null, 'Electronics', 90, 'ViewCraft'],
  ['Bluetooth Speaker Mini', '360 sound and 12-hour playtime in a pocket-friendly size.', 69.99, null, 'Electronics', 75, 'PulseAudio'],
  ['Wireless Game Controller', 'Low latency compatible with PC and popular consoles.', 54.99, null, 'Electronics', 110, 'KeyForge'],
  ['Wi-Fi 6 Router AX', 'Whole-home coverage with parental controls and guest network.', 139.99, 169.99, 'Electronics', 35, 'LinkPort'],
  ['Streaming TV Stick 4K', 'Plug-and-play apps with voice remote included in the box.', 49.99, null, 'Electronics', 200, 'ViewCraft'],
  ['Power Bank 20000mAh', 'Fast charging for phones and tablets with dual USB-C ports.', 44.99, null, 'Electronics', 150, 'Nova'],
  // Fashion (16)
  ['Wireless Sneakers', 'Comfortable everyday sneakers with breathable materials.', 79.95, null, 'Fashion', 60, 'Stride'],
  ['Classic Oxford Shirt', 'Crisp cotton shirt for office or weekend smart casual outfits.', 54.99, 69.99, 'Fashion', 70, 'UrbanLine'],
  ['Slim Fit Jeans', 'Stretch denim with a modern taper and reinforced stitching.', 69.99, null, 'Fashion', 85, 'UrbanLine'],
  ['Lightweight Running Jacket', 'Wind-resistant shell that packs into its own pocket.', 89.99, null, 'Fashion', 50, 'Stride'],
  ['Canvas Daypack', 'Laptop sleeve and water bottle pockets for commute or campus.', 64.99, 79.99, 'Fashion', 45, 'CarryCo'],
  ['Leather Belt', 'Full-grain leather with brushed buckle in multiple widths.', 39.99, null, 'Fashion', 120, 'UrbanLine'],
  ['Wool Winter Scarf', 'Soft merino blend in classic plaid for cold weather.', 34.99, null, 'Fashion', 95, 'UrbanLine'],
  ['Sport Cap Adjustable', 'Moisture-wicking sweatband and UPF fabric for outdoor runs.', 24.99, null, 'Fashion', 200, 'Stride'],
  ['Performance Running Shorts', 'Built-in liner and zip pocket for keys or cards.', 36.99, null, 'Fashion', 88, 'Stride'],
  ['Fleece Hoodie', 'Mid-weight hoodie with kangaroo pocket and ribbed cuffs.', 59.99, 74.99, 'Fashion', 72, 'UrbanLine'],
  ['Pique Polo Shirt', 'Breathable polo for golf, office casual, or weekend wear.', 42.99, null, 'Fashion', 95, 'UrbanLine'],
  ['Leather Dress Shoes', 'Goodyear welt construction with cushioned insole.', 129.99, 159.99, 'Fashion', 40, 'UrbanLine'],
  ['Canvas Tote Bag', 'Reinforced handles and inner zip pocket for daily essentials.', 32.99, null, 'Fashion', 110, 'CarryCo'],
  ['Polarized Sunglasses', 'UV400 lenses in a lightweight acetate frame.', 79.99, null, 'Fashion', 65, 'Chrono'],
  ['Crew Socks 6-Pack', 'Cushioned sole and arch support for all-day comfort.', 19.99, null, 'Fashion', 300, 'Stride'],
  ['Packable Rain Jacket', 'Sealed seams and hood that stows into the collar.', 74.99, 94.99, 'Fashion', 55, 'Stride'],
  // Home & Kitchen (16)
  ['Smart Microwave 900W', 'Even heating with preset cooking modes.', 129.99, null, 'Home & Kitchen', 12, 'HeatWave'],
  ['Programmable Coffee Maker', '12-cup glass carafe with auto brew and strength control.', 89.99, 109.99, 'Home & Kitchen', 48, 'BrewHaus'],
  ['Stand Mixer 5 Quart', 'Planetary mixing with dough hook and whisk attachments.', 349.99, null, 'Home & Kitchen', 25, 'BrewHaus'],
  ['Non-Stick Pan Set 3pc', 'Induction-ready fry pans with cool-touch handles.', 79.99, null, 'Home & Kitchen', 60, 'HeatWave'],
  ['Glass Food Storage Set', 'Leak-proof lids and oven-safe borosilicate containers.', 44.99, null, 'Home & Kitchen', 90, 'NestStore'],
  ['Air Fryer 5 Liter', 'Digital presets for fries, chicken, and vegetables with less oil.', 119.99, 149.99, 'Home & Kitchen', 42, 'HeatWave'],
  ['Robot Vacuum Lite', 'Slim profile with edge cleaning and scheduled runs.', 199.99, null, 'Home & Kitchen', 30, 'CleanBot'],
  ['Electric Kettle 1.7L', 'Variable temperature for tea and coffee with keep-warm mode.', 49.99, null, 'Home & Kitchen', 75, 'BrewHaus'],
  ['Dinnerware Set 16 Piece', 'Stoneware plates and bowls, dishwasher and microwave safe.', 89.99, null, 'Home & Kitchen', 38, 'NestStore'],
  ['LED Desk Lamp', 'Adjustable color temperature and USB charging port.', 39.99, 49.99, 'Home & Kitchen', 100, 'LumaHome'],
  ['Throw Blanket Soft', 'Machine-washable microfleece in neutral tones.', 29.99, null, 'Home & Kitchen', 130, 'NestStore'],
  ['Indoor Plant Pot Set', 'Ceramic planters with drainage trays, set of three.', 34.99, null, 'Home & Kitchen', 85, 'LumaHome'],
  ['Bamboo Cutting Board', 'Juice groove and easy-grip handles, knife-friendly surface.', 27.99, null, 'Home & Kitchen', 140, 'NestStore'],
  ['Storage Ottoman', 'Hinged lid and linen upholstery for living room clutter.', 99.99, null, 'Home & Kitchen', 33, 'NestStore'],
  ['Essential Oil Diffuser', 'Ultrasonic mist with timer and soft LED mood lighting.', 36.99, null, 'Home & Kitchen', 95, 'LumaHome'],
  ['Wall Clock Minimal', 'Silent sweep movement with matte metal frame.', 45.99, 55.99, 'Home & Kitchen', 58, 'LumaHome'],
];

/** Example filterable attributes for a subset of catalog items */
const SAMPLE_PRODUCT_ATTRIBUTES = {
  'Android Phone X': { ram: '8GB', storage: '128GB', color: 'Phantom Black' },
  'Laptop Pro 14': { ram: '16GB', storage: '512GB SSD', color: 'Silver' },
  'Pro Tablet 11 inch': { ram: '6GB', storage: '256GB', color: 'Graphite' },
};

const SEED = {
  products: RAW_PRODUCTS.map(([name, description, price, originalPrice, category, countInStock, brand]) => {
    const image = productImageUrl(name, category);
    return {
      name,
      description,
      price,
      category,
      countInStock,
      brand,
      image,
      originalPrice,
    };
  }),
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

const dropLegacyCategoryIndexes = async () => {
  const coll = Category.collection;
  for (const name of ['slug_1', 'parentCategory_1_slug_1']) {
    try {
      await coll.dropIndex(name);
      // eslint-disable-next-line no-console
      console.log(`Dropped legacy index on categories: ${name}`);
    } catch {
      // index missing or already removed
    }
  }
};

/**
 * Upserts a 3-level category branch. Fills `categoryDocs` with L1 categories by name (for product validation).
 */
const upsertCategoryNode = async (node, parentDoc, categoryDocs) => {
  const parentId = parentDoc ? parentDoc._id : null;
  const slug = node.slug;
  let doc = await Category.findOne({ slug, parentId: parentId || null });

  const payload = {
    name: node.name,
    slug,
    description: node.description || '',
    sortOrder: node.sortOrder ?? 0,
    isActive: true,
    parentId: parentId || null,
  };

  if (!doc) {
    doc = await Category.create(payload);
  } else {
    doc.name = payload.name;
    doc.description = payload.description;
    doc.sortOrder = payload.sortOrder;
    doc.isActive = true;
    doc.parentId = parentId || null;
    await doc.save();
  }

  if (!parentId) {
    categoryDocs[node.name] = doc;
  }

  if (node.children && node.children.length) {
    for (const child of node.children) {
      await upsertCategoryNode(child, doc, categoryDocs);
    }
  }

  return doc;
};

const upsertProduct = async (
  { name, description, price, originalPrice, image, category, countInStock, brand },
  categoryDocs,
) => {
  const slug = slugify(name);
  const cat = categoryDocs[category];
  if (!cat) throw new Error(`Missing category seed for: ${category}`);

  const snap = buildCategorySnapshot(cat);
  const images = image ? [image] : [];
  const onSale = originalPrice != null && originalPrice !== '' && Number(originalPrice) > Number(price);
  const listPrice = onSale ? Number(originalPrice) : Number(price);
  const discountPrice = onSale ? Number(price) : undefined;
  const attrs = SAMPLE_PRODUCT_ATTRIBUTES[name] || {};

  const existing = await Product.findOne({ slug });
  if (existing) {
    existing.title = name;
    existing.description = description;
    existing.price = listPrice;
    existing.discountPrice = discountPrice;
    existing.images = images;
    existing.stock = countInStock;
    existing.brand = brand;
    existing.categories = [snap];
    existing.primaryCategoryId = cat._id;
    existing.categoryId = cat._id;
    existing.category = cat.name;
    existing.attributes = attrs;
    await existing.save();
    return existing;
  }

  return Product.create({
    title: name,
    slug,
    description,
    price: listPrice,
    discountPrice,
    images,
    stock: countInStock,
    brand,
    categories: [snap],
    primaryCategoryId: cat._id,
    categoryId: cat._id,
    category: cat.name,
    attributes: attrs,
  });
};

const main = async () => {
  await connectDB();
  await dropLegacyCategoryIndexes();

  const adminUser = await upsertUser({ ...CREDENTIALS.admin, role: 'admin' });
  const customerUser = await upsertUser({ ...CREDENTIALS.customer, role: 'customer' });

  const categoryDocs = {};
  for (const root of CATEGORY_TREE) {
    await upsertCategoryNode(root, null, categoryDocs);
  }

  await MegaMenu.findOneAndUpdate(
    { key: 'default' },
    { $set: { items: MEGA_MENU_ITEMS } },
    { upsert: true, new: true },
  );

  const productDocs = {};
  for (const p of SEED.products) {
    // Ensure category exists for admin UX; product keeps using the string name.
    if (!categoryDocs[p.category]) throw new Error(`Missing category seed for: ${p.category}`);
    const doc = await upsertProduct(p, categoryDocs);
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
      { returnDocument: 'after', upsert: true, runValidators: true }
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
      const snap = Product.lineSnapshot(product);
      nextCart.items.push({
        product: product._id,
        name: snap.name,
        qty: it.qty,
        price: snap.price,
        image: snap.image,
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
          const snap = Product.lineSnapshot(product);
          return {
            product: product._id,
            name: snap.name,
            qty: oi.qty,
            price: snap.price,
            image: snap.image,
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
  console.log(`Categories in DB: ${await Category.countDocuments()}`);
  console.log(`Products in catalog: ${SEED.products.length}`);
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

