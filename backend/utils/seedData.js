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

const CATEGORY_SLUG_BUCKETS = {
  Electronics: [
    'electronics-mobiles-tablets-smartphones',
    'electronics-mobiles-tablets-ereaders',
    'electronics-mobiles-tablets-accessories',
    'electronics-computers-office-laptops',
    'electronics-computers-office-desktops',
    'electronics-computers-office-peripherals',
    'electronics-tv-home-televisions',
    'electronics-tv-home-streaming',
    'electronics-tv-home-audio',
    'electronics-headphones-audio-over-ear',
    'electronics-headphones-audio-earbuds',
    'electronics-headphones-audio-speakers',
  ],
  Fashion: [
    'fashion-mens-clothing-shirts',
    'fashion-mens-clothing-pants',
    'fashion-mens-clothing-outerwear',
    'fashion-womens-clothing-dresses',
    'fashion-womens-clothing-tops',
    'fashion-womens-clothing-intimates',
    'fashion-footwear-bags-sneakers',
    'fashion-footwear-bags-boots',
    'fashion-footwear-bags-handbags',
  ],
  'Home & Kitchen': [
    'home-kitchen-kitchen-dining-cookware',
    'home-kitchen-kitchen-dining-appliances',
    'home-kitchen-kitchen-dining-dinnerware',
    'home-kitchen-decor-furniture-lighting',
    'home-kitchen-decor-furniture-textiles',
    'home-kitchen-decor-furniture-storage',
    'home-kitchen-bedding-bath-bedding',
    'home-kitchen-bedding-bath-towels',
    'home-kitchen-bedding-bath-accessories',
  ],
};

/** Example filterable attributes for a subset of catalog items */
const SAMPLE_PRODUCT_ATTRIBUTES = {
  'Android Phone X': { ram: '8GB', storage: '128GB', color: 'Phantom Black' },
  'Laptop Pro 14': { ram: '16GB', storage: '512GB SSD', color: 'Silver' },
  'Pro Tablet 11 inch': { ram: '6GB', storage: '256GB', color: 'Graphite' },
};

const LEAF_PRODUCTS_PER_CATEGORY = 20;

const CATEGORY_PRODUCT_PROFILES = {
  electronics: [
    { name: 'Smartphone', desc: 'High-performance smartphone with all-day battery and crisp display.', min: 249, max: 1299, brand: 'NovaTech' },
    { name: 'Laptop', desc: 'Portable laptop designed for productivity, entertainment, and remote work.', min: 499, max: 1899, brand: 'Aurum' },
    { name: 'Tablet', desc: 'Lightweight tablet for streaming, reading, sketching, and video calls.', min: 199, max: 999, brand: 'NovaTech' },
    { name: 'Bluetooth Speaker', desc: 'Compact wireless speaker with rich sound and deep bass response.', min: 39, max: 249, brand: 'PulseAudio' },
    { name: 'Wireless Earbuds', desc: 'True wireless earbuds with clear calls and adaptive noise control.', min: 29, max: 299, brand: 'PulseAudio' },
    { name: 'Smart Watch', desc: 'Fitness and health tracking smartwatch with customizable watch faces.', min: 69, max: 449, brand: 'Chrono' },
    { name: 'Monitor', desc: 'Wide color-gamut monitor ideal for work, editing, and gaming setups.', min: 119, max: 899, brand: 'ViewCraft' },
    { name: 'Mechanical Keyboard', desc: 'Responsive keyboard with tactile switches and durable keycaps.', min: 49, max: 249, brand: 'KeyForge' },
  ],
  fashion: [
    { name: 'Shirt', desc: 'Breathable everyday shirt with a comfortable fit and clean finish.', min: 19, max: 109, brand: 'UrbanLine' },
    { name: 'Jeans', desc: 'Stretch denim jeans with modern styling and reliable comfort.', min: 29, max: 139, brand: 'UrbanLine' },
    { name: 'Jacket', desc: 'Lightweight jacket built for layering across seasons.', min: 39, max: 219, brand: 'Stride' },
    { name: 'Sneakers', desc: 'Cushioned sneakers engineered for all-day wear and support.', min: 34, max: 189, brand: 'Stride' },
    { name: 'Dress', desc: 'Elegant dress with flattering silhouette and soft touch fabric.', min: 29, max: 199, brand: 'Modea' },
    { name: 'Handbag', desc: 'Versatile handbag with roomy compartments for daily essentials.', min: 24, max: 169, brand: 'CarryCo' },
    { name: 'Hoodie', desc: 'Cozy hoodie featuring breathable fabric and relaxed fit.', min: 25, max: 129, brand: 'UrbanLine' },
    { name: 'Sandals', desc: 'Comfortable sandals with lightweight sole and secure straps.', min: 19, max: 119, brand: 'Stride' },
  ],
  'home-kitchen': [
    { name: 'Cookware Set', desc: 'Durable cookware set suitable for everyday family meals.', min: 49, max: 329, brand: 'HeatWave' },
    { name: 'Coffee Maker', desc: 'Programmable coffee maker with consistent flavor extraction.', min: 39, max: 289, brand: 'BrewHaus' },
    { name: 'Storage Organizer', desc: 'Multi-purpose organizer for tidy shelves and cabinets.', min: 14, max: 119, brand: 'NestStore' },
    { name: 'LED Lamp', desc: 'Energy-efficient lighting with adjustable brightness levels.', min: 19, max: 149, brand: 'LumaHome' },
    { name: 'Dining Set', desc: 'Elegant dining essentials designed for daily and festive meals.', min: 39, max: 349, brand: 'NestStore' },
    { name: 'Bedding Set', desc: 'Soft and breathable bedding set for a comfortable sleep.', min: 29, max: 219, brand: 'NestStore' },
    { name: 'Air Fryer', desc: 'Fast-cooking air fryer for crispy meals using less oil.', min: 49, max: 259, brand: 'HeatWave' },
    { name: 'Vacuum Cleaner', desc: 'Powerful vacuum cleaner for effective dust and debris pickup.', min: 69, max: 399, brand: 'CleanBot' },
  ],
  'beauty-personal-care': [
    { name: 'Face Cleanser', desc: 'Gentle cleanser that removes impurities without dryness.', min: 8, max: 49, brand: 'PureGlow' },
    { name: 'Moisturizer', desc: 'Hydrating moisturizer for long-lasting softness and glow.', min: 10, max: 69, brand: 'PureGlow' },
    { name: 'Sunscreen', desc: 'Broad-spectrum sunscreen for daily skin protection.', min: 9, max: 59, brand: 'DermaCare' },
    { name: 'Shampoo', desc: 'Nourishing shampoo designed for healthy, shiny hair.', min: 7, max: 45, brand: 'SilkRoots' },
    { name: 'Conditioner', desc: 'Moisture-lock conditioner that smooths and detangles hair.', min: 7, max: 45, brand: 'SilkRoots' },
    { name: 'Hair Dryer', desc: 'Quick-dry hair dryer with adjustable heat settings.', min: 24, max: 149, brand: 'SilkRoots' },
    { name: 'Serum', desc: 'Concentrated serum to target uneven texture and dullness.', min: 12, max: 89, brand: 'DermaCare' },
    { name: 'Body Lotion', desc: 'Daily body lotion for soft and healthy-looking skin.', min: 8, max: 39, brand: 'PureGlow' },
  ],
  'sports-outdoors': [
    { name: 'Yoga Mat', desc: 'Non-slip yoga mat for workouts, mobility, and stretching.', min: 14, max: 79, brand: 'PeakMotion' },
    { name: 'Dumbbell Set', desc: 'Durable dumbbell set ideal for home strength sessions.', min: 29, max: 249, brand: 'PeakMotion' },
    { name: 'Trekking Backpack', desc: 'Ergonomic backpack with multiple storage compartments.', min: 39, max: 199, brand: 'TrailCore' },
    { name: 'Camping Tent', desc: 'Weather-resistant camping tent for outdoor adventures.', min: 69, max: 349, brand: 'TrailCore' },
    { name: 'Cycling Helmet', desc: 'Lightweight helmet with airflow channels and secure fit.', min: 24, max: 149, brand: 'RideAxis' },
    { name: 'Resistance Bands', desc: 'Versatile resistance bands for full-body training.', min: 9, max: 59, brand: 'PeakMotion' },
    { name: 'Fitness Tracker', desc: 'Activity tracker with step, heart rate, and sleep metrics.', min: 29, max: 199, brand: 'PeakMotion' },
    { name: 'Sleeping Bag', desc: 'Insulated sleeping bag built for cool night conditions.', min: 34, max: 179, brand: 'TrailCore' },
  ],
};

const resolveCategoryGroup = (slug) => {
  const s = String(slug || '');
  if (s.startsWith('electronics')) return 'electronics';
  if (s.startsWith('fashion')) return 'fashion';
  if (s.startsWith('home-kitchen')) return 'home-kitchen';
  if (s.startsWith('beauty-personal-care')) return 'beauty-personal-care';
  if (s.startsWith('sports-outdoors')) return 'sports-outdoors';
  return 'electronics';
};

const DEFAULT_SHIPPING_RETURNS =
  'Free standard shipping on orders over $50. Most items ship within 1–2 business days. Easy 30-day returns in original condition with tags and packaging.';

/**
 * Rich PDP fields: gallery, highlights, specs, variants — derived deterministically from product identity.
 */
const buildRichProductFields = ({ name, brand, categorySlug, productSlug }) => {
  const group = resolveCategoryGroup(categorySlug || productSlug || '');
  const hash = stableHash(`${productSlug}:${name}`);
  const gallery = [0, 1, 2, 3].map((i) =>
    productImageUrl(`${name} gallery ${i}`, `${group}-${productSlug}-${i}`),
  );
  const sku = `SSP-${String(productSlug).toUpperCase().replace(/[^A-Z0-9]/gi, '').slice(0, 10) || 'ITEM'}-${1000 + (hash % 8999)}`;
  const warranties = [
    '1-year limited manufacturer warranty.',
    '2-year limited warranty; register within 30 days.',
    '90-day satisfaction guarantee on eligible defects.',
  ];
  const warranty = warranties[hash % warranties.length];

  const baseHighlights = [
    'Authenticity guaranteed — sourced from authorized supply partners.',
    'Quality-checked before dispatch for consistent customer experience.',
    'Secure packaging to reduce transit damage.',
    'Dedicated support for order and warranty questions.',
  ];

  const groupHighlights = {
    electronics: [
      'Engineered for reliable daily performance and long service life.',
      'Compatible with mainstream accessories and industry-standard interfaces.',
      'Energy-efficient operation where applicable.',
    ],
    fashion: [
      'Comfort-focused materials with breathable construction.',
      'Designed for versatile styling across seasons.',
      'Machine-washable care on select fabrics (see label).',
    ],
    'home-kitchen': [
      'Thoughtful ergonomics for everyday cooking and living.',
      'Materials selected for durability and easy maintenance.',
      'Fits modern kitchens and compact spaces.',
    ],
    'beauty-personal-care': [
      'Dermatologist-tested formulas on applicable SKUs.',
      'Cruelty-free brand standards where noted on packaging.',
      'Clear ingredient labeling and usage guidance.',
    ],
    'sports-outdoors': [
      'Built for training, travel, and outdoor conditions.',
      'Tested for stability, grip, and wear resistance.',
      'Packable designs where applicable for on-the-go use.',
    ],
  };

  const highlights = [...(groupHighlights[group] || groupHighlights.electronics), ...baseHighlights].slice(0, 7);

  const specPresets = {
    electronics: [
      { label: 'Model', value: `${brand || 'ShopSphere'} ${String(name).split(' ').slice(-2).join(' ')}` },
      { label: 'Warranty', value: warranty },
      { label: 'In the box', value: 'Main unit, quick-start guide, compliance documentation.' },
      { label: 'Power', value: hash % 2 === 0 ? '100–240V universal adapter' : 'USB-C rechargeable' },
      { label: 'Connectivity', value: 'See product documentation for ports and wireless profiles.' },
      { label: 'Materials', value: 'Premium plastics / aluminum alloy (varies by SKU).' },
      { label: 'Certifications', value: 'CE, FCC where applicable.' },
      { label: 'Software updates', value: 'Supported via companion app or manufacturer portal when available.' },
    ],
    fashion: [
      { label: 'Fit', value: hash % 3 === 0 ? 'Regular' : hash % 3 === 1 ? 'Slim' : 'Relaxed' },
      { label: 'Fabric', value: 'Primary blend varies by style; see care label.' },
      { label: 'Care', value: 'Follow garment label; wash cold with like colors.' },
      { label: 'Origin', value: 'Imported' },
      { label: 'Closure', value: hash % 2 === 0 ? 'Zip / button' : 'Pull-on' },
      { label: 'Season', value: 'All-season layering' },
    ],
    'home-kitchen': [
      { label: 'Capacity / size', value: 'As listed on packaging; measure your space before purchase.' },
      { label: 'Materials', value: 'Food-safe materials where applicable; BPA-free on plastic SKUs.' },
      { label: 'Care', value: 'Dishwasher-safe pieces noted on packaging; hand-wash delicate finishes.' },
      { label: 'Warranty', value: warranty },
      { label: 'Power', value: 'Refer to rating plate for voltage and wattage.' },
    ],
    'beauty-personal-care': [
      { label: 'Skin type', value: 'Formulated for common skin types; patch test recommended.' },
      { label: 'Volume', value: 'Standard retail size unless variant is selected.' },
      { label: 'Shelf life', value: 'See PAO symbol on packaging after opening.' },
      { label: 'Free from', value: 'Formulation details printed on outer carton.' },
    ],
    'sports-outdoors': [
      { label: 'Intended use', value: 'Training, recreation, and light outdoor activity.' },
      { label: 'Weight', value: 'Varies by configuration; see packaging.' },
      { label: 'Care', value: 'Rinse gear after exposure to salt or chlorine; air dry.' },
      { label: 'Safety', value: 'Follow manufacturer guidelines; replace if damaged.' },
    ],
  };

  const specifications = specPresets[group] || specPresets.electronics;

  const colorPresets = {
    electronics: [
      { name: 'Graphite', hex: '#1e293b' },
      { name: 'Silver', hex: '#94a3b8' },
      { name: 'Midnight', hex: '#0f172a' },
    ],
    fashion: [
      { name: 'Black', hex: '#0f172a' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Oat', hex: '#d6c4b0' },
      { name: 'Sage', hex: '#6b8f71' },
    ],
    'home-kitchen': [
      { name: 'Matte White', hex: '#f8fafc' },
      { name: 'Stainless', hex: '#cbd5e1' },
      { name: 'Charcoal', hex: '#334155' },
    ],
    'beauty-personal-care': [
      { name: 'Original', hex: '#fce7f3' },
      { name: 'Sensitive', hex: '#e0f2fe' },
    ],
    'sports-outdoors': [
      { name: 'Black', hex: '#111827' },
      { name: 'Cobalt', hex: '#2563eb' },
      { name: 'Forest', hex: '#166534' },
    ],
  };

  const colors = colorPresets[group] || colorPresets.electronics;

  const sizePresets = {
    electronics: ['128 GB', '256 GB', '512 GB', '1 TB'],
    fashion: ['XS', 'S', 'M', 'L', 'XL'],
    'home-kitchen': ['One size', 'S', 'M', 'L'],
    'beauty-personal-care': ['50 ml', '100 ml', '150 ml'],
    'sports-outdoors': ['S', 'M', 'L', 'XL'],
  };

  const sizes = sizePresets[group] || ['One size'];

  return {
    gallery,
    sku,
    warranty,
    highlights,
    specifications,
    colors,
    sizes,
    shippingReturns: DEFAULT_SHIPPING_RETURNS,
  };
};

const collectLeafCategories = (nodes, out = []) => {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      out.push({ slug: node.slug, name: node.name });
      continue;
    }
    collectLeafCategories(node.children, out);
  }
  return out;
};

const stableHash = (value) => {
  let h = 0;
  const s = String(value);
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const toPrice = (num) => Number(num.toFixed(2));

const generateCategoryProducts = ({ categoryName, categorySlug, count }) => {
  const group = resolveCategoryGroup(categorySlug);
  const profiles = CATEGORY_PRODUCT_PROFILES[group] || CATEGORY_PRODUCT_PROFILES.electronics;

  return Array.from({ length: count }, (_, index) => {
    const serial = index + 1;
    const profile = profiles[index % profiles.length];
    const model = `${100 + ((index * 7) % 900)}`;
    const itemName = `${categoryName} ${profile.name} ${model}`;
    const seedKey = `${categorySlug}-${itemName}-${serial}`;
    const priceSpan = Math.max(1, profile.max - profile.min);
    const hashed = stableHash(seedKey);
    const rawPrice = profile.min + (hashed % Math.floor(priceSpan * 100)) / 100;
    const currentPrice = toPrice(rawPrice);
    const originalPrice =
      serial % 3 === 0 ? toPrice(currentPrice + Math.max(5, currentPrice * 0.12)) : null;
    const stock = 15 + (hashed % 180);
    const image = productImageUrl(`${itemName} product`, `${group} ${categoryName}`);

    return {
      name: itemName,
      description: profile.desc,
      price: currentPrice,
      originalPrice,
      category: group === 'home-kitchen' ? 'Home & Kitchen' : categoryName.split('&')[0].trim(),
      categorySlug,
      countInStock: stock,
      brand: profile.brand,
      image,
      isFeatured: serial <= 2,
      isTrending: serial <= 6,
    };
  });
};

const SEED = {
  products: (() => {
    const categoryCounters = {};
    return RAW_PRODUCTS.map(([name, description, price, originalPrice, category, countInStock, brand], idx) => {
      const image = productImageUrl(name, category);
      const bucket = CATEGORY_SLUG_BUCKETS[category] || [];
      const counter = categoryCounters[category] || 0;
      const categorySlug = bucket.length ? bucket[counter % bucket.length] : 'electronics';
      categoryCounters[category] = counter + 1;

      return {
        name,
        description,
        price,
        category,
        categorySlug,
        countInStock,
        brand,
        image,
        originalPrice,
        isFeatured: idx < 12,
        isTrending: idx % 2 === 0 || idx < 20,
      };
    });
  })(),
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
  categoryDocs[node.slug] = doc;

  if (node.children && node.children.length) {
    for (const child of node.children) {
      await upsertCategoryNode(child, doc, categoryDocs);
    }
  }

  return doc;
};

const upsertProduct = async (
  {
    name,
    description,
    price,
    originalPrice,
    image,
    images: imagesOverride,
    category,
    categorySlug,
    countInStock,
    brand,
    isFeatured,
    isTrending,
  },
  categoryDocs,
) => {
  const slug = slugify(name);
  const cat = categoryDocs[categorySlug] || categoryDocs[category];
  if (!cat) throw new Error(`Missing category seed for: ${categorySlug || category}`);

  const snap = buildCategorySnapshot(cat);
  const rich = buildRichProductFields({
    name,
    brand: brand || 'ShopSphere',
    categorySlug: cat.slug,
    productSlug: slug,
  });
  const images =
    Array.isArray(imagesOverride) && imagesOverride.length > 0
      ? imagesOverride
      : image
        ? [image, ...rich.gallery.filter((u) => u !== image).slice(0, 3)]
        : rich.gallery;
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
    existing.isFeatured = Boolean(isFeatured);
    existing.isTrending = Boolean(isTrending);
    existing.attributes = attrs;
    existing.sku = rich.sku;
    existing.warranty = rich.warranty;
    existing.highlights = rich.highlights;
    existing.specifications = rich.specifications;
    existing.colors = rich.colors;
    existing.sizes = rich.sizes;
    existing.shippingReturns = rich.shippingReturns;
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
    isFeatured: Boolean(isFeatured),
    isTrending: Boolean(isTrending),
    attributes: attrs,
    sku: rich.sku,
    warranty: rich.warranty,
    highlights: rich.highlights,
    specifications: rich.specifications,
    colors: rich.colors,
    sizes: rich.sizes,
    shippingReturns: rich.shippingReturns,
  });
};

const BULK_REVIEW_TEMPLATES = [
  {
    rating: 5,
    title: 'Exceeded expectations',
    comment:
      'Really impressed with build quality and finish. {{product}} feels premium in daily use and matches the listing photos closely.',
  },
  {
    rating: 5,
    title: 'Would buy again',
    comment:
      'Fast shipping and careful packaging. {{product}} works exactly as described—no surprises, which is exactly what I wanted.',
  },
  {
    rating: 4,
    title: 'Solid overall',
    comment:
      'Great value for the price. A couple of minor details could be improved, but nothing that affects everyday use of {{product}}.',
  },
  {
    rating: 4,
    title: 'Happy customer',
    comment:
      'Setup was straightforward and support answered my sizing/spec question quickly. {{product}} has been reliable so far.',
  },
  {
    rating: 5,
    title: 'Perfect for my needs',
    comment:
      'I compared a few options and this was the best balance of features and price. {{product}} fits my routine really well.',
  },
  {
    rating: 3,
    title: 'Good, not perfect',
    comment:
      '{{product}} is fine for the price point. If you are picky about materials/finish, read the specs carefully—but I still recommend it.',
  },
  {
    rating: 5,
    title: 'Enterprise-grade feel',
    comment:
      'Feels like something you would expect from a much more expensive brand. Documentation and labeling on {{product}} were clear.',
  },
  {
    rating: 4,
    title: 'Nice upgrade',
    comment:
      'Upgraded from an older model and the difference is noticeable. {{product}} runs cooler/quieter than what I replaced.',
  },
];

const ensureSeedReviewUsers = async () => {
  const reviewers = [];
  const baseNames = [
    'Avery Chen',
    'Jordan Patel',
    'Riley Gomez',
    'Casey Nguyen',
    'Morgan Brooks',
    'Taylor Singh',
    'Jamie Ortiz',
    'Quinn Rivera',
    'Skylar Ali',
    'Reese Kumar',
    'Devon Shah',
    'Blake Martinez',
  ];
  for (let i = 1; i <= 28; i += 1) {
    const email = `seed.reviewer.${i}@shopsphere.dev`;
    let u = await User.findOne({ email });
    if (!u) {
      const name = `${baseNames[i % baseNames.length]}${i % 5 === 0 ? ' (Verified purchase)' : ''}`;
      u = await User.create({
        name,
        email,
        password: 'ReviewerSeed123!',
        role: 'customer',
      });
    }
    reviewers.push(u);
  }
  return reviewers;
};

const seedBulkSampleReviews = async (reviewers) => {
  if (!reviewers.length) return;
  const products = await Product.find({}).select('_id title').limit(180);
  let tplIdx = 0;

  for (const prod of products) {
    const n = 3 + (stableHash(String(prod._id)) % 3);
    const start = stableHash(String(prod._id)) % reviewers.length;
    for (let i = 0; i < n; i += 1) {
      const u = reviewers[(start + i) % reviewers.length];
      const tpl = BULK_REVIEW_TEMPLATES[tplIdx % BULK_REVIEW_TEMPLATES.length];
      tplIdx += 1;
      const comment = tpl.comment.replace(/\{\{product\}\}/g, prod.title);
      await Review.findOneAndUpdate(
        { user: u._id, product: prod._id },
        {
          $set: {
            rating: tpl.rating,
            title: tpl.title,
            comment,
            isApproved: true,
          },
        },
        { upsert: true, runValidators: true },
      );
    }
  }
};

const refreshAllProductReviewStats = async () => {
  const cursor = Product.find({}, '_id').cursor();
  for await (const p of cursor) {
    const stats = await Review.aggregate([
      { $match: { product: p._id, isApproved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
    ]);
    const avgRating = stats[0]?.avgRating ?? 0;
    const numReviews = stats[0]?.numReviews ?? 0;
    await Product.updateOne(
      { _id: p._id },
      { $set: { averageRating: Math.round(avgRating * 10) / 10, numReviews } },
    );
  }
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
    if (!categoryDocs[p.categorySlug]) throw new Error(`Missing category seed for: ${p.categorySlug}`);
    const doc = await upsertProduct(p, categoryDocs);
    productDocs[p.name] = doc;
  }

  // Ensure each leaf category has at least N seeded products.
  const leafCategories = collectLeafCategories(CATEGORY_TREE);
  for (const leaf of leafCategories) {
    const existingCount = await Product.countDocuments({ 'categories.slug': leaf.slug });
    const missingCount = Math.max(0, LEAF_PRODUCTS_PER_CATEGORY - existingCount);
    if (missingCount === 0) continue;

    const generatedProducts = generateCategoryProducts({
      categoryName: leaf.name,
      categorySlug: leaf.slug,
      count: missingCount,
    });

    for (const gp of generatedProducts) {
      const doc = await upsertProduct(gp, categoryDocs);
      productDocs[gp.name] = doc;
    }
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

  const seedReviewers = await ensureSeedReviewUsers();
  await seedBulkSampleReviews(seedReviewers);
  await refreshAllProductReviewStats();

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
  console.log(`Products in catalog: ${await Product.countDocuments()}`);
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

