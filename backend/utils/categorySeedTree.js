/**
 * Hierarchical ecommerce category seed (L1 → L2 → L3).
 * Slugs are globally unique strings safe for URLs and compound index (parent + slug).
 *
 * L1 names must include: Electronics, Fashion, Home & Kitchen — used by product seed strings.
 */
module.exports.CATEGORY_TREE = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, computers, TV, audio, cameras, smart home, and accessories.',
    sortOrder: 10,
    children: [
      {
        name: 'Mobiles & Tablets',
        slug: 'electronics-mobiles-tablets',
        description: 'Smartphones, tablets, and mobile computing.',
        sortOrder: 1,
        children: [
          {
            name: 'Smartphones',
            slug: 'electronics-mobiles-tablets-smartphones',
            description: 'Android and iOS smartphones.',
            sortOrder: 1,
          },
          {
            name: 'Tablets & E-Readers',
            slug: 'electronics-mobiles-tablets-ereaders',
            description: 'Tablets and dedicated e-readers.',
            sortOrder: 2,
          },
          {
            name: 'Mobile Accessories',
            slug: 'electronics-mobiles-tablets-accessories',
            description: 'Cases, chargers, cables, and screen protectors.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Computers & Office',
        slug: 'electronics-computers-office',
        description: 'Laptops, desktops, monitors, and office electronics.',
        sortOrder: 2,
        children: [
          {
            name: 'Laptops',
            slug: 'electronics-computers-office-laptops',
            description: 'Ultrabooks, gaming laptops, and Chromebooks.',
            sortOrder: 1,
          },
          {
            name: 'Desktops & All-in-Ones',
            slug: 'electronics-computers-office-desktops',
            description: 'Tower PCs, mini PCs, and all-in-one systems.',
            sortOrder: 2,
          },
          {
            name: 'Monitors & Peripherals',
            slug: 'electronics-computers-office-peripherals',
            description: 'Displays, keyboards, mice, and webcams.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'TV & Home Entertainment',
        slug: 'electronics-tv-home',
        description: 'Televisions, streaming, soundbars, and projectors.',
        sortOrder: 3,
        children: [
          {
            name: 'Televisions',
            slug: 'electronics-tv-home-televisions',
            description: 'LED, OLED, and QLED TVs.',
            sortOrder: 1,
          },
          {
            name: 'Streaming & Media Players',
            slug: 'electronics-tv-home-streaming',
            description: 'Sticks, boxes, and smart TV platforms.',
            sortOrder: 2,
          },
          {
            name: 'Soundbars & Home Theater',
            slug: 'electronics-tv-home-audio',
            description: 'Soundbars, receivers, and surround systems.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Headphones & Audio',
        slug: 'electronics-headphones-audio',
        description: 'Headphones, earbuds, speakers, and hi-fi.',
        sortOrder: 4,
        children: [
          {
            name: 'Over-Ear & On-Ear',
            slug: 'electronics-headphones-audio-over-ear',
            description: 'Wired and wireless full-size headphones.',
            sortOrder: 1,
          },
          {
            name: 'True Wireless Earbuds',
            slug: 'electronics-headphones-audio-earbuds',
            description: 'In-ear wireless and sport earbuds.',
            sortOrder: 2,
          },
          {
            name: 'Portable Speakers',
            slug: 'electronics-headphones-audio-speakers',
            description: 'Bluetooth and smart speakers.',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: "Men's, women's, kids' apparel, footwear, and accessories.",
    sortOrder: 20,
    children: [
      {
        name: "Men's Clothing",
        slug: 'fashion-mens-clothing',
        description: 'Tops, bottoms, outerwear, and suits for men.',
        sortOrder: 1,
        children: [
          {
            name: 'Shirts & Polos',
            slug: 'fashion-mens-clothing-shirts',
            description: 'Dress shirts, polos, and casual shirts.',
            sortOrder: 1,
          },
          {
            name: 'Pants & Jeans',
            slug: 'fashion-mens-clothing-pants',
            description: 'Jeans, chinos, and trousers.',
            sortOrder: 2,
          },
          {
            name: 'Jackets & Coats',
            slug: 'fashion-mens-clothing-outerwear',
            description: 'Lightweight jackets, parkas, and winter coats.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: "Women's Clothing",
        slug: 'fashion-womens-clothing',
        description: 'Dresses, tops, bottoms, and activewear for women.',
        sortOrder: 2,
        children: [
          {
            name: 'Dresses & Jumpsuits',
            slug: 'fashion-womens-clothing-dresses',
            description: 'Casual, work, and occasion dresses.',
            sortOrder: 1,
          },
          {
            name: 'Tops & Blouses',
            slug: 'fashion-womens-clothing-tops',
            description: 'Tees, blouses, knitwear, and tanks.',
            sortOrder: 2,
          },
          {
            name: 'Intimates & Sleepwear',
            slug: 'fashion-womens-clothing-intimates',
            description: 'Bras, underwear, pajamas, and loungewear.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Footwear & Bags',
        slug: 'fashion-footwear-bags',
        description: 'Shoes, boots, sneakers, handbags, and wallets.',
        sortOrder: 3,
        children: [
          {
            name: 'Sneakers & Athletic',
            slug: 'fashion-footwear-bags-sneakers',
            description: 'Running, training, and lifestyle sneakers.',
            sortOrder: 1,
          },
          {
            name: 'Boots & Formal Shoes',
            slug: 'fashion-footwear-bags-boots',
            description: 'Boots, loafers, and dress shoes.',
            sortOrder: 2,
          },
          {
            name: 'Handbags & Wallets',
            slug: 'fashion-footwear-bags-handbags',
            description: 'Totes, crossbody bags, and wallets.',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, appliances, cookware, décor, and organization.',
    sortOrder: 30,
    children: [
      {
        name: 'Kitchen & Dining',
        slug: 'home-kitchen-kitchen-dining',
        description: 'Cookware, appliances, and tableware.',
        sortOrder: 1,
        children: [
          {
            name: 'Cookware & Bakeware',
            slug: 'home-kitchen-kitchen-dining-cookware',
            description: 'Pots, pans, baking sheets, and Dutch ovens.',
            sortOrder: 1,
          },
          {
            name: 'Small Kitchen Appliances',
            slug: 'home-kitchen-kitchen-dining-appliances',
            description: 'Mixers, blenders, coffee makers, and air fryers.',
            sortOrder: 2,
          },
          {
            name: 'Dinnerware & Flatware',
            slug: 'home-kitchen-kitchen-dining-dinnerware',
            description: 'Plates, bowls, glasses, and utensils.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Home Décor & Furniture',
        slug: 'home-kitchen-decor-furniture',
        description: 'Seating, tables, lighting, and decorative accents.',
        sortOrder: 2,
        children: [
          {
            name: 'Lighting',
            slug: 'home-kitchen-decor-furniture-lighting',
            description: 'Lamps, ceiling lights, and smart bulbs.',
            sortOrder: 1,
          },
          {
            name: 'Rugs & Textiles',
            slug: 'home-kitchen-decor-furniture-textiles',
            description: 'Area rugs, curtains, and throws.',
            sortOrder: 2,
          },
          {
            name: 'Storage & Organization',
            slug: 'home-kitchen-decor-furniture-storage',
            description: 'Shelving, bins, and closet systems.',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Bedding & Bath',
        slug: 'home-kitchen-bedding-bath',
        description: 'Sheets, comforters, towels, and bath accessories.',
        sortOrder: 3,
        children: [
          {
            name: 'Bedding Sets',
            slug: 'home-kitchen-bedding-bath-bedding',
            description: 'Sheets, duvets, pillows, and mattress pads.',
            sortOrder: 1,
          },
          {
            name: 'Bath Towels & Mats',
            slug: 'home-kitchen-bedding-bath-towels',
            description: 'Towels, bath mats, and shower curtains.',
            sortOrder: 2,
          },
          {
            name: 'Bathroom Accessories',
            slug: 'home-kitchen-bedding-bath-accessories',
            description: 'Dispensers, mirrors, and organizers.',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Skincare, hair care, makeup, grooming, and fragrance.',
    sortOrder: 40,
    children: [
      {
        name: 'Skincare',
        slug: 'beauty-personal-care-skincare',
        description: 'Cleansers, moisturizers, serums, and sun care.',
        sortOrder: 1,
        children: [
          {
            name: 'Face Care',
            slug: 'beauty-personal-care-skincare-face',
            description: 'Cleansers, toners, treatments, and moisturizers.',
            sortOrder: 1,
          },
          {
            name: 'Sun Care & Body',
            slug: 'beauty-personal-care-skincare-sun-body',
            description: 'Sunscreen, body lotions, and hand care.',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Hair Care',
        slug: 'beauty-personal-care-hair',
        description: 'Shampoo, styling, tools, and color.',
        sortOrder: 2,
        children: [
          {
            name: 'Shampoo & Conditioner',
            slug: 'beauty-personal-care-hair-shampoo',
            description: 'Cleansing, conditioning, and treatments.',
            sortOrder: 1,
          },
          {
            name: 'Styling Tools',
            slug: 'beauty-personal-care-hair-tools',
            description: 'Dryers, straighteners, and curling tools.',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness, team sports, camping, cycling, and outdoor recreation.',
    sortOrder: 50,
    children: [
      {
        name: 'Exercise & Fitness',
        slug: 'sports-outdoors-fitness',
        description: 'Cardio, strength training, and yoga.',
        sortOrder: 1,
        children: [
          {
            name: 'Cardio Equipment',
            slug: 'sports-outdoors-fitness-cardio',
            description: 'Treadmills, bikes, ellipticals, and rowers.',
            sortOrder: 1,
          },
          {
            name: 'Strength & Weights',
            slug: 'sports-outdoors-fitness-strength',
            description: 'Dumbbells, kettlebells, benches, and racks.',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Outdoor Recreation',
        slug: 'sports-outdoors-outdoor',
        description: 'Camping, hiking, and cycling gear.',
        sortOrder: 2,
        children: [
          {
            name: 'Camping & Hiking',
            slug: 'sports-outdoors-outdoor-camping',
            description: 'Tents, sleeping bags, backpacks, and trekking poles.',
            sortOrder: 1,
          },
          {
            name: 'Cycling',
            slug: 'sports-outdoors-outdoor-cycling',
            description: 'Bikes, helmets, lights, and accessories.',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
];
