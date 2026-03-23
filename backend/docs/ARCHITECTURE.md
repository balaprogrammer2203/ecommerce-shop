# Backend architecture

## Migrating from older category indexes

If the database was created with an earlier schema, MongoDB may still have a **global unique index on `slug`** (`slug_1`). The current model uses **unique compound `{ parentId, slug }`** and **unique `path`**, so the old index must be dropped or inserts will fail with duplicate keys on repeated slugs under different parents. The seed script drops `slug_1` and `parentCategory_1_slug_1` when present; you can also run:

`db.categories.dropIndex("slug_1")` in the shell.

## Catalog: snapshot + filter model

The catalog is optimized for **read-heavy** storefront traffic: product listing avoids `populate()` and deep joins by **denormalizing** category data on each product.

### Category snapshots on `Product`

Each product stores an embedded array **`categories`** with objects `{ _id, slug, path, name }` copied from the canonical `Category` documents at write time (create/update). The **primary** row is also reflected in `primaryCategoryId`, `categoryId`, and the legacy string **`category`** (display / old clients).

**Why:** Listing and filtering by category subtree use indexed fields on the product document (`categories._id`, `categories.path`, …) with a single `$in` or range query—no graph walk at read time.

**Trade-off:** If a category’s name, slug, or path changes, products that reference it should be **resynced** (batch job or controller hook) so snapshots stay accurate. New products always get fresh snapshots from the current `Category` tree.

### Category subtree filter

`GET /api/products` accepts `categoryId`, `categorySlug`, or `category`. The service resolves the category, collects **that id plus all active descendants** (via materialized `path` prefix on `Category`), then filters products with:

`categories._id ∈ { those ObjectIds }`.

So a parent category (e.g. Electronics) returns products tagged with any descendant leaf or intermediate category without recursive DB joins per request.

### Dynamic attributes + `CategoryAttribute`

**`Product.attributes`** is a flexible object (e.g. `{ ram: '8GB', storage: '256GB' }`) used for specs and **equality filters** (`attrs` JSON on the products API).

**`CategoryAttribute`** defines **per-category** filter metadata: human **`label`**, machine **`key`** (matches keys in `Product.attributes`), and allowed **`values`** (enums for UI facets). It does not enforce product values at the DB layer; validation can be added in controllers or admin tools.

### Pricing (stored vs API)

Products store **list** price in **`price`** and optional sale in **`discountPrice`**. JSON responses apply a transform so clients see **payable `price`**, optional **`originalPrice`** (list when on sale), and legacy fields like **`name`** / **`image`** / **`countInStock`** aligned with the storefront.

See also: [`CATALOG_QUERIES.md`](./CATALOG_QUERIES.md) for example REST and Mongo queries.
