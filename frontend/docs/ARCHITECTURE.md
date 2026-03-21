# Frontend architecture (ShopSphere)

This app follows a **feature-based** layout suited for eCommerce growth: each domain area owns its API layer, state, hooks, UI pieces, and **route screens** where it makes sense.

## Top-level `src/`

| Folder | Role |
|--------|------|
| `app/` | Application shell: Redux store, typed hooks, providers, **router** (`router.tsx`). |
| `features/` | Vertical slices: `auth`, `cart`, `catalog`, `checkout`, `orders`, `reviews`, `admin`. Each feature typically has `api/`, `slices/`, `hooks/`, `components/`, and **`pages/`** for screens tied to that domain. |
| `shared/` | Cross-cutting UI and utilities reused by multiple features. |
| `shared/ui/` | Presentational / composite components (Header, ProductCard, CategoryMenu). |
| `shared/layouts/` | Route layouts (public, account, admin). |
| `shared/lib/` | Pure helpers (formatting, feature flags). |
| `config/` | Runtime config (env mapping). |
| `services/` | Cross-feature infrastructure: RTK Query `baseQuery`, analytics, payments, legacy auth helpers. |
| `theme/` | MUI theme tokens. |
| `tests/` | Test setup and mocks. |

## Rules of thumb (enterprise / scalable)

1. **Prefer importing “down” the stack**  
   Features may use `shared/*` and `app/*` (store). Avoid features importing each other’s internals; use `services/` or explicit shared contracts when two features must integrate.

2. **Colocate screens**  
   Put pages under `features/<name>/pages/` so a team can own a feature folder end-to-end.

3. **Single route composition root**  
   `app/router.tsx` is the only place that wires paths → layouts → pages. That keeps navigation discoverable as the app grows.

4. **Public API (optional pattern)**  
   You can add `features/<name>/index.ts` to re-export only what other layers should use (hooks, types). Start doing this when a feature’s internal tree gets large.

## Adding a new feature (e.g. `wishlist`)

```
src/features/wishlist/
  api/wishlistApi.ts
  slices/wishlistSlice.ts
  pages/WishlistPage.tsx
  components/...
```

(Use a real feature name instead of a glob pattern in folder names.)

Then register reducers / RTK APIs in `app/store.ts` and add routes in `app/router.tsx`.
