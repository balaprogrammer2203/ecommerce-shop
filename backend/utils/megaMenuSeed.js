/**
 * Storefront header mega-menu seed (aligned with frontend `myntraNavConfig`).
 * Links reference `Category.slug` values from `categorySeedTree.js`.
 */
module.exports.MEGA_MENU_ITEMS = [
  {
    id: 'men',
    label: 'Men',
    sortOrder: 10,
    columns: [
      {
        title: 'Topwear',
        links: [
          { label: 'T-Shirts', categorySlug: 'fashion-mens-clothing-shirts', badge: 'trending' },
          { label: 'Casual Shirts', categorySlug: 'fashion-mens-clothing-shirts' },
          { label: 'Formal Shirts', categorySlug: 'fashion-mens-clothing-shirts', badge: 'new' },
        ],
      },
      {
        title: 'Bottomwear',
        links: [
          { label: 'Jeans', categorySlug: 'fashion-mens-clothing-pants', badge: 'sale' },
          { label: 'Trousers', categorySlug: 'fashion-mens-clothing-pants' },
          { label: 'Shorts', categorySlug: 'fashion-mens-clothing-pants' },
        ],
      },
      {
        title: 'Footwear',
        links: [
          { label: 'Sneakers', categorySlug: 'fashion-footwear-bags-sneakers', badge: 'trending' },
          { label: 'Casual Shoes', categorySlug: 'fashion-footwear-bags-boots' },
          { label: 'Sports Shoes', categorySlug: 'fashion-footwear-bags-sneakers' },
        ],
      },
      {
        title: 'Accessories',
        links: [
          { label: 'Watches', categorySlug: 'electronics-headphones-audio-earbuds' },
          { label: 'Wallets', categorySlug: 'fashion-footwear-bags-handbags' },
          { label: 'Sunglasses', categorySlug: 'fashion-footwear-bags-handbags', badge: 'new' },
        ],
      },
    ],
  },
  {
    id: 'women',
    label: 'Women',
    sortOrder: 20,
    columns: [
      {
        title: 'Indian & Fusion',
        links: [
          { label: 'Dresses', categorySlug: 'fashion-womens-clothing-dresses', badge: 'trending' },
          { label: 'Tops & Tees', categorySlug: 'fashion-womens-clothing-tops' },
          { label: 'Kurtas', categorySlug: 'fashion-womens-clothing-tops', badge: 'new' },
        ],
      },
      {
        title: 'Western Wear',
        links: [
          { label: 'Tops & Blouses', categorySlug: 'fashion-womens-clothing-tops' },
          { label: 'Jeans', categorySlug: 'fashion-mens-clothing-pants' },
          { label: 'Skirts', categorySlug: 'fashion-womens-clothing-dresses', badge: 'sale' },
        ],
      },
      {
        title: 'Footwear',
        links: [
          { label: 'Heels', categorySlug: 'fashion-footwear-bags-boots' },
          { label: 'Flats', categorySlug: 'fashion-footwear-bags-sneakers' },
          { label: 'Sports Shoes', categorySlug: 'fashion-footwear-bags-sneakers' },
        ],
      },
      {
        title: 'Accessories',
        links: [
          { label: 'Handbags', categorySlug: 'fashion-footwear-bags-handbags', badge: 'trending' },
          { label: 'Jewellery', categorySlug: 'beauty-personal-care-skincare-face' },
          { label: 'Sunglasses', categorySlug: 'fashion-footwear-bags-handbags' },
        ],
      },
    ],
  },
  {
    id: 'kids',
    label: 'Kids',
    sortOrder: 30,
    columns: [
      {
        title: 'Boys Clothing',
        links: [
          { label: 'T-Shirts', categorySlug: 'fashion-mens-clothing-shirts', badge: 'new' },
          { label: 'Shorts', categorySlug: 'fashion-mens-clothing-pants' },
          { label: 'Ethnic Wear', categorySlug: 'fashion-mens-clothing-shirts' },
        ],
      },
      {
        title: 'Girls Clothing',
        links: [
          { label: 'Dresses', categorySlug: 'fashion-womens-clothing-dresses' },
          { label: 'Tops', categorySlug: 'fashion-womens-clothing-tops', badge: 'trending' },
          { label: 'Skirts', categorySlug: 'fashion-womens-clothing-dresses' },
        ],
      },
      {
        title: 'Footwear',
        links: [
          { label: 'Sports Shoes', categorySlug: 'fashion-footwear-bags-sneakers' },
          { label: 'Sandals', categorySlug: 'fashion-footwear-bags-boots' },
          { label: 'School Shoes', categorySlug: 'fashion-footwear-bags-boots', badge: 'sale' },
        ],
      },
      {
        title: 'Toys',
        links: [
          { label: 'Soft Toys', categorySlug: 'home-kitchen-bedding-bath-bedding' },
          { label: 'Sports', categorySlug: 'sports-outdoors-fitness-cardio' },
          { label: 'Outdoor', categorySlug: 'sports-outdoors-outdoor-camping' },
        ],
      },
    ],
  },
  {
    id: 'home',
    label: 'Home & Living',
    sortOrder: 40,
    columns: [
      {
        title: 'Kitchen & Dining',
        links: [
          { label: 'Cookware', categorySlug: 'home-kitchen-kitchen-dining-cookware', badge: 'sale' },
          { label: 'Appliances', categorySlug: 'home-kitchen-kitchen-dining-appliances', badge: 'trending' },
          { label: 'Dinnerware', categorySlug: 'home-kitchen-kitchen-dining-dinnerware' },
        ],
      },
      {
        title: 'Decor',
        links: [
          { label: 'Lighting', categorySlug: 'home-kitchen-decor-furniture-lighting', badge: 'new' },
          { label: 'Rugs', categorySlug: 'home-kitchen-decor-furniture-textiles' },
          { label: 'Storage', categorySlug: 'home-kitchen-decor-furniture-storage' },
        ],
      },
      {
        title: 'Bedding',
        links: [
          { label: 'Bedding Sets', categorySlug: 'home-kitchen-bedding-bath-bedding' },
          { label: 'Bath Towels', categorySlug: 'home-kitchen-bedding-bath-towels' },
          { label: 'Bath Accessories', categorySlug: 'home-kitchen-bedding-bath-accessories' },
        ],
      },
      {
        title: 'Brands',
        links: [
          { label: 'Featured', categorySlug: 'home-kitchen' },
          { label: 'New arrivals', categorySlug: 'home-kitchen-kitchen-dining', badge: 'new' },
          { label: 'Sale', categorySlug: 'home-kitchen-decor-furniture', badge: 'sale' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    label: 'Beauty',
    sortOrder: 50,
    columns: [
      {
        title: 'Makeup',
        links: [
          { label: 'Face', categorySlug: 'beauty-personal-care-skincare-face', badge: 'trending' },
          { label: 'Eyes', categorySlug: 'beauty-personal-care-skincare-face' },
          { label: 'Lips', categorySlug: 'beauty-personal-care-skincare-face', badge: 'new' },
        ],
      },
      {
        title: 'Skincare',
        links: [
          { label: 'Moisturizers', categorySlug: 'beauty-personal-care-skincare-face' },
          { label: 'Sun care', categorySlug: 'beauty-personal-care-skincare-sun-body', badge: 'sale' },
          { label: 'Masks', categorySlug: 'beauty-personal-care-skincare-face' },
        ],
      },
      {
        title: 'Haircare',
        links: [
          { label: 'Shampoo', categorySlug: 'beauty-personal-care-hair-shampoo' },
          { label: 'Conditioner', categorySlug: 'beauty-personal-care-hair-shampoo' },
          { label: 'Tools', categorySlug: 'beauty-personal-care-hair-tools', badge: 'trending' },
        ],
      },
      {
        title: 'Fragrances',
        links: [
          { label: 'Perfumes', categorySlug: 'beauty-personal-care-hair-shampoo' },
          { label: 'Mists', categorySlug: 'beauty-personal-care-skincare-face' },
          { label: 'Gift sets', categorySlug: 'beauty-personal-care', badge: 'new' },
        ],
      },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    sortOrder: 60,
    columns: [
      {
        title: 'Tech',
        links: [
          { label: 'Audio', categorySlug: 'electronics-headphones-audio', badge: 'trending' },
          { label: 'Wearables', categorySlug: 'electronics-mobiles-tablets-accessories' },
          { label: 'Cameras', categorySlug: 'electronics-mobiles-tablets-smartphones', badge: 'new' },
        ],
      },
      {
        title: 'Mobiles',
        links: [
          { label: 'Smartphones', categorySlug: 'electronics-mobiles-tablets-smartphones' },
          { label: 'Tablets', categorySlug: 'electronics-mobiles-tablets-ereaders' },
          { label: 'Accessories', categorySlug: 'electronics-mobiles-tablets-accessories', badge: 'sale' },
        ],
      },
      {
        title: 'Computers',
        links: [
          { label: 'Laptops', categorySlug: 'electronics-computers-office-laptops' },
          { label: 'Desktops', categorySlug: 'electronics-computers-office-desktops' },
          { label: 'Peripherals', categorySlug: 'electronics-computers-office-peripherals' },
        ],
      },
      {
        title: 'Discover',
        links: [
          { label: 'New drops', categorySlug: 'electronics', badge: 'new' },
          { label: 'Trending', categorySlug: 'electronics-tv-home', badge: 'trending' },
          { label: 'Sale', categorySlug: 'electronics-computers-office', badge: 'sale' },
        ],
      },
    ],
  },
];
