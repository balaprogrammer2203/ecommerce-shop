/**
 * OpenAPI specification for this Express backend.
 *
 * Notes:
 * - Your auth guard (`protect`) accepts JWT via either:
 *   - HTTP-only cookie: `jwt`
 *   - Header: `Authorization: Bearer <token>`
 * - Swagger UI is protected in `backend/swagger/index.js` using `protect` + `admin`.
 */
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Ecommerce API',
    version: '1.0.0',
    description:
      'Swagger/OpenAPI docs for the ecommerce MERN backend. Endpoints that require authentication accept JWT via `Authorization: Bearer <token>` or the `jwt` cookie.',
  },
  tags: [
    { name: 'Health', description: 'Service status' },
    { name: 'Auth', description: 'Authentication and user profile' },
    { name: 'Products', description: 'Product catalog' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'CategoryAttributes', description: 'Per-category filter definitions (enums)' },
    { name: 'Reviews', description: 'Product reviews' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Cart', description: 'Shopping cart' },
    { name: 'Wishlist', description: 'Saved products (authenticated)' },
  ],
  servers: [{ url: '/', description: 'Same origin' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token. Example: Authorization: Bearer <token>',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
        description: 'HTTP-only cookie containing JWT (set during login).',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: {},
        },
        required: ['code', 'message'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { $ref: '#/components/schemas/Error' },
          stack: { type: 'string', nullable: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
          token: { type: 'string' },
        },
        required: ['_id', 'name', 'email', 'role', 'token'],
      },
      Product: {
        type: 'object',
        description:
          'Catalog product. Stored with list `price` + optional `discountPrice`; JSON responses also expose legacy `price` (amount to pay), `originalPrice`, `name`, `image`, `countInStock`.',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          name: { type: 'string', description: 'Alias of title (legacy)' },
          description: { type: 'string' },
          price: { type: 'number', description: 'Amount customer pays (effective); list price when on sale is originalPrice' },
          discountPrice: { type: 'number', nullable: true, description: 'Sale price as stored in DB (may be omitted in responses after transform)' },
          originalPrice: { type: 'number', nullable: true },
          images: { type: 'array', items: { type: 'string' } },
          image: { type: 'string', nullable: true, description: 'First image (legacy)' },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                slug: { type: 'string' },
                path: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          primaryCategoryId: { type: 'string', nullable: true },
          category: { type: 'string' },
          categoryId: { type: 'string', nullable: true },
          stock: { type: 'number' },
          countInStock: { type: 'number', description: 'Alias of stock' },
          brand: { type: 'string', nullable: true },
          attributes: { type: 'object', additionalProperties: true },
          averageRating: { type: 'number' },
          numReviews: { type: 'number' },
          sku: { type: 'string', nullable: true },
          warranty: { type: 'string', nullable: true },
          highlights: { type: 'array', items: { type: 'string' } },
          specifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
          colors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                hex: { type: 'string', nullable: true },
              },
            },
          },
          sizes: { type: 'array', items: { type: 'string' } },
          shippingReturns: { type: 'string', nullable: true },
          isFeatured: { type: 'boolean' },
          isTrending: { type: 'boolean' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          ancestors: { type: 'array', items: { type: 'string' } },
          path: { type: 'string', description: 'Materialized path e.g. /electronics/mobiles' },
          level: { type: 'integer', minimum: 0, maximum: 2, description: '0=L1, 1=L2, 2=L3' },
          sortOrder: { type: 'number' },
          isActive: { type: 'boolean' },
          isLeaf: { type: 'boolean' },
          parentId: { type: 'string', nullable: true },
          parentCategory: { type: 'string', nullable: true, description: 'Alias of parentId' },
          image: { type: 'string', nullable: true },
          metaTitle: { type: 'string', nullable: true },
          metaDescription: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CategoryAttribute: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          categoryId: { type: 'string' },
          key: { type: 'string' },
          label: { type: 'string' },
          values: { type: 'array', items: { type: 'string' } },
          sortOrder: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
      CategoryTreeNode: {
        type: 'object',
        description: 'Category fields plus optional nested children (same shape at each level)',
        additionalProperties: true,
      },
      MegaMenuLink: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          categorySlug: { type: 'string' },
          href: { type: 'string', description: 'Client route e.g. /category/{slug}' },
          badge: { type: 'string', enum: ['new', 'trending', 'sale'], nullable: true },
        },
        required: ['label', 'categorySlug', 'href'],
      },
      MegaMenuColumn: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          links: { type: 'array', items: { $ref: '#/components/schemas/MegaMenuLink' } },
        },
        required: ['title', 'links'],
      },
      MegaMenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          sortOrder: { type: 'number' },
          columns: { type: 'array', items: { $ref: '#/components/schemas/MegaMenuColumn' } },
        },
        required: ['id', 'label', 'columns'],
      },
      MegaMenuResponse: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/MegaMenuItem' } },
        },
        required: ['items'],
      },
      WishlistResponse: {
        type: 'object',
        properties: {
          productIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['productIds'],
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          product: { type: 'string' },
          rating: { type: 'number' },
          title: { type: 'string', nullable: true },
          comment: { type: 'string', nullable: true },
          isApproved: { type: 'boolean' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          name: { type: 'string' },
          qty: { type: 'number' },
          price: { type: 'number' },
          image: { type: 'string', nullable: true },
        },
        required: ['product', 'name', 'qty', 'price'],
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          orderItems: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          shippingAddress: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              city: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          paymentMethod: { type: 'string', enum: ['stripe', 'paypal', 'cod'] },
          itemsPrice: { type: 'number' },
          taxPrice: { type: 'number' },
          shippingPrice: { type: 'number' },
          totalPrice: { type: 'number' },
          isPaid: { type: 'boolean' },
          paidAt: { type: 'string', nullable: true },
          isDelivered: { type: 'boolean' },
          deliveredAt: { type: 'string', nullable: true },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          name: { type: 'string' },
          qty: { type: 'number' },
          price: { type: 'number' },
          image: { type: 'string', nullable: true },
        },
        required: ['product', 'name', 'qty', 'price'],
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          itemsPrice: { type: 'number' },
          totalPrice: { type: 'number' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Forbidden: {
        description: 'Forbidden',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string' }, message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { $ref: '#/components/responses/Unauthorized', description: 'Validation error' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (clears jwt cookie)',
        operationId: 'logoutUser',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        operationId: 'getProfile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Auth'],
        summary: 'Update current user profile',
        operationId: 'updateProfile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products (supports pagination + search)',
        operationId: 'getProducts',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'keyword', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', required: false, schema: { type: 'string' }, description: 'Includes matching category subtree' },
          { name: 'categorySlug', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'category', in: 'query', required: false, schema: { type: 'string' }, description: 'Alias of categorySlug / id' },
          { name: 'minPrice', in: 'query', required: false, schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', required: false, schema: { type: 'number' } },
          { name: 'brand', in: 'query', required: false, schema: { type: 'string' } },
          {
            name: 'sort',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['newest', 'price-asc', 'price-desc', 'name-asc', 'name-desc'] },
            description: 'Sort order for products. Defaults to newest.',
          },
          { name: 'featured', in: 'query', required: false, schema: { type: 'boolean' } },
          { name: 'trending', in: 'query', required: false, schema: { type: 'boolean' } },
          {
            name: 'attrs',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'JSON object of attribute filters, e.g. {"ram":"8GB"}',
          },
        ],
        responses: {
          '200': {
            description: 'Products page',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product (admin only)',
        operationId: 'createProduct',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'price'],
                properties: {
                  title: { type: 'string' },
                  name: { type: 'string', description: 'Alias of title' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number', description: 'List price, or sale price if using originalPrice legacy pair' },
                  discountPrice: { type: 'number', nullable: true },
                  originalPrice: { type: 'number', nullable: true, description: 'Legacy: when greater than price, price is treated as sale' },
                  images: { type: 'array', items: { type: 'string' } },
                  image: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  categoryId: { type: 'string' },
                  stock: { type: 'number' },
                  countInStock: { type: 'number' },
                  isFeatured: { type: 'boolean' },
                  isTrending: { type: 'boolean' },
                  brand: { type: 'string', nullable: true },
                  attributes: { type: 'object', additionalProperties: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/api/products/home': {
      get: {
        tags: ['Products'],
        summary: 'Homepage rails (featured + trending) in one call',
        operationId: 'getHomeProducts',
        parameters: [
          {
            name: 'featuredLimit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 24, default: 8 },
          },
          {
            name: 'trendingLimit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 24, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Homepage product rails',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    featured: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    trending: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                  },
                  required: ['featured', 'trending'],
                },
              },
            },
          },
        },
      },
    },

    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by id',
        operationId: 'getProductById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product (admin only)',
        operationId: 'updateProduct',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  discountPrice: { type: 'number', nullable: true },
                  originalPrice: { type: 'number', nullable: true },
                  images: { type: 'array', items: { type: 'string' } },
                  image: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  categoryId: { type: 'string', nullable: true },
                  stock: { type: 'number' },
                  countInStock: { type: 'number' },
                  isFeatured: { type: 'boolean' },
                  isTrending: { type: 'boolean' },
                  brand: { type: 'string', nullable: true },
                  attributes: { type: 'object', additionalProperties: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (admin only)',
        operationId: 'deleteProduct',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Removed', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/api/categories/mega-menu': {
      get: {
        tags: ['Categories'],
        summary: 'Storefront mega-menu (header navigation columns)',
        operationId: 'getMegaMenu',
        responses: {
          '200': {
            description: 'Menu tabs with columns and category links',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/MegaMenuResponse' } },
            },
          },
        },
      },
    },

    '/api/categories/tree': {
      get: {
        tags: ['Categories'],
        summary: 'Category tree (nested L1→L2→L3)',
        operationId: 'getCategoryTree',
        parameters: [
          {
            name: 'active',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false', 'all'] },
            description: 'Defaults to active categories only. Use `all` to include inactive.',
          },
        ],
        responses: {
          '200': {
            description: 'Nested roots with children',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CategoryTreeNode' } } },
            },
          },
        },
      },
    },

    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories (flat, with parent populated)',
        operationId: 'getCategories',
        parameters: [
          {
            name: 'active',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false', 'all'] },
            description: 'Defaults to active only. `false` = inactive only. `all` = every row.',
          },
        ],
        responses: {
          '200': {
            description: 'Categories',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category (admin only)',
        operationId: 'createCategory',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  isActive: { type: 'boolean' },
                  parentId: { type: 'string', nullable: true },
                  parentCategory: { type: 'string', nullable: true, description: 'Alias of parentId' },
                  sortOrder: { type: 'number' },
                  image: { type: 'string', nullable: true },
                  metaTitle: { type: 'string', nullable: true },
                  metaDescription: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/api/categories/{id}/breadcrumbs': {
      get: {
        tags: ['Categories'],
        summary: 'Breadcrumb trail for a category',
        operationId: 'getCategoryBreadcrumbs',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Mongo id or category slug',
          },
        ],
        responses: {
          '200': {
            description: 'Ordered from root → current',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object', additionalProperties: true } },
              },
            },
          },
        },
      },
    },

    '/api/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by Mongo id or slug',
        operationId: 'getCategoryById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update category (admin only)',
        operationId: 'updateCategory',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  isActive: { type: 'boolean' },
                  parentId: { type: 'string', nullable: true },
                  parentCategory: { type: 'string', nullable: true },
                  sortOrder: { type: 'number' },
                  image: { type: 'string', nullable: true },
                  metaTitle: { type: 'string', nullable: true },
                  metaDescription: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete (deactivate) category (admin only)',
        operationId: 'deleteCategory',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Deactivated',
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
          },
          '400': { description: 'Category has subcategories', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/category-attributes': {
      get: {
        tags: ['CategoryAttributes'],
        summary: 'List attribute definitions for a category',
        operationId: 'listCategoryAttributes',
        parameters: [
          { name: 'categoryId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'active', in: 'query', required: false, schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'Attributes',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CategoryAttribute' } } },
            },
          },
        },
      },
      post: {
        tags: ['CategoryAttributes'],
        summary: 'Create category attribute (admin)',
        operationId: 'createCategoryAttribute',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['categoryId', 'label'],
                properties: {
                  categoryId: { type: 'string' },
                  key: { type: 'string' },
                  label: { type: 'string' },
                  values: { type: 'array', items: { type: 'string' } },
                  sortOrder: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryAttribute' } } },
          },
        },
      },
    },

    '/api/category-attributes/{id}': {
      get: {
        tags: ['CategoryAttributes'],
        summary: 'Get category attribute by id',
        operationId: 'getCategoryAttributeById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Row', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryAttribute' } } } },
        },
      },
      put: {
        tags: ['CategoryAttributes'],
        summary: 'Update category attribute (admin)',
        operationId: 'updateCategoryAttribute',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  label: { type: 'string' },
                  values: { type: 'array', items: { type: 'string' } },
                  sortOrder: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryAttribute' } } } },
        },
      },
      delete: {
        tags: ['CategoryAttributes'],
        summary: 'Delete category attribute (admin)',
        operationId: 'deleteCategoryAttribute',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Removed', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        },
      },
    },

    '/api/reviews/products/{productId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get approved reviews for a product',
        operationId: 'getProductReviews',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 10 } },
        ],
        responses: {
          '200': {
            description: 'Reviews page',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create or update a review (authenticated)',
        operationId: 'createOrUpdateReview',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  title: { type: 'string', nullable: true, maxLength: 160 },
                  comment: { type: 'string', nullable: true, maxLength: 2000 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Saved', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create order (authenticated)',
        operationId: 'createOrder',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderItems', 'shippingAddress', 'paymentMethod', 'itemsPrice', 'totalPrice'],
                properties: {
                  orderItems: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
                  shippingAddress: {
                    type: 'object',
                    required: ['address', 'city', 'postalCode', 'country'],
                    properties: {
                      address: { type: 'string' },
                      city: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string' },
                    },
                  },
                  paymentMethod: { type: 'string', enum: ['stripe', 'paypal', 'cod'] },
                  itemsPrice: { type: 'number' },
                  taxPrice: { type: 'number', nullable: true },
                  shippingPrice: { type: 'number', nullable: true },
                  totalPrice: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get all orders (admin only)',
        operationId: 'getOrders',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
        },
      },
    },

    '/api/orders/my': {
      get: {
        tags: ['Orders'],
        summary: 'Get current user orders (authenticated)',
        operationId: 'getMyOrders',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
        },
      },
    },

    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by id (owner or admin)',
        operationId: 'getOrderById',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/api/orders/{id}/pay': {
      put: {
        tags: ['Orders'],
        summary: 'Mark order as paid (admin only)',
        operationId: 'updateOrderToPaid',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Updated order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
        },
      },
    },

    '/api/orders/{id}/deliver': {
      put: {
        tags: ['Orders'],
        summary: 'Mark order as delivered (admin only)',
        operationId: 'updateOrderToDelivered',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Updated order', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
        },
      },
    },

    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get my cart (authenticated)',
        operationId: 'getMyCart',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
        },
      },
    },

    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart (authenticated)',
        operationId: 'addItemToCart',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['qty'],
                properties: {
                  productId: { type: 'string', nullable: true, description: 'Product ObjectId' },
                  product: { type: 'string', nullable: true, description: 'Alternate product id field (used as fallback by backend)' },
                  qty: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/cart/items/{productId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity (authenticated)',
        operationId: 'updateCartItemQty',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['qty'],
                properties: {
                  qty: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart (authenticated)',
        operationId: 'removeCartItem',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
        },
      },
    },

    '/api/cart/clear': {
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart (authenticated)',
        operationId: 'clearCart',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Cart cleared', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
        },
      },
    },

    '/api/wishlist': {
      get: {
        tags: ['Wishlist'],
        summary: 'Get wishlisted product ids',
        operationId: 'getWishlist',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Wishlist',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WishlistResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/wishlist/items': {
      post: {
        tags: ['Wishlist'],
        summary: 'Add product to wishlist',
        operationId: 'addToWishlist',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: { productId: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Updated wishlist',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WishlistResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/wishlist/items/{productId}': {
      delete: {
        tags: ['Wishlist'],
        summary: 'Remove product from wishlist',
        operationId: 'removeFromWishlist',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Updated wishlist',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WishlistResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/wishlist/merge': {
      post: {
        tags: ['Wishlist'],
        summary: 'Merge guest wishlist product ids into account',
        operationId: 'mergeWishlist',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productIds'],
                properties: { productIds: { type: 'array', items: { type: 'string' } } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Merged wishlist',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/WishlistResponse' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
};

