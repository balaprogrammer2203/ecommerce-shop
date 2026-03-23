# Catalog — sample queries

## REST

- Flat categories: `GET /api/categories?active=true`
- Tree: `GET /api/categories/tree?active=true`
- Breadcrumbs: `GET /api/categories/electronics/breadcrumbs` (id or slug)
- Products in subtree: `GET /api/products?categorySlug=electronics&page=1&limit=20`
- Price + attribute filter: `GET /api/products?minPrice=100&maxPrice=800&attrs={"ram":"8GB"}`
- Category filter definitions: `GET /api/category-attributes?categoryId=<mongoId>`

## MongoDB (illustrative)

```js
// Subtree by materialized path prefix
db.categories.find({ path: /^\/electronics\//, isActive: true });

// Products in category subtree (by snapshot ids)
const ids = [ObjectId('...') /* + descendants */];
db.products.find({ 'categories._id': { $in: ids } });

// Effective customer price in DB (sale or list)
db.products.find({
  $expr: {
    $and: [
      { $gte: [{ $ifNull: ['$discountPrice', '$price'] }, 50] },
      { $lte: [{ $ifNull: ['$discountPrice', '$price'] }, 500] },
    ],
  },
});
```
