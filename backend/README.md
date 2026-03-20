## Backend API (Node/Express/MongoDB)

This folder contains the server-side API for the ecommerce MERN app. It is built with **Express**, **MongoDB (Mongoose)**, and **JWT-based authentication**.

### 1. Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create your `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in:

- **`PORT`**: Port for the API (default `5000`)
- **`MONGO_URI`**: MongoDB connection string
- **`MONGO_DB_NAME`**: Database name (default `ecommerce`)
- **`JWT_SECRET`**: Strong secret string for signing tokens
- **`JWT_EXPIRES_IN`**: Token lifetime (e.g. `7d`)
- **`CLIENT_URL`**: Frontend origin (e.g. `http://localhost:5173`)
- **`NODE_ENV`**: `development` or `production`

3. Run the server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (or the port you configured).

### 2. Main Endpoints

All routes are prefixed with `/api`.

- **Health check**
  - `GET /api/health`

- **Auth**
  - `POST /api/auth/register` – register a new user
  - `POST /api/auth/login` – login, returns user + JWT (also sets `jwt` cookie)
  - `POST /api/auth/logout` – logout (protected)
  - `GET /api/auth/me` – get current user profile (protected)
  - `PUT /api/auth/me` – update profile (protected)

- **Products**
  - `GET /api/products` – list products (supports `?page=1&limit=20&keyword=term`)
  - `GET /api/products/:id` – get single product
  - `POST /api/products` – create product (admin)
  - `PUT /api/products/:id` – update product (admin)
  - `DELETE /api/products/:id` – delete product (admin)

- **Orders**
  - `POST /api/orders` – create order (protected)
  - `GET /api/orders/my` – get current user orders (protected)
  - `GET /api/orders/:id` – get specific order (owner or admin)
  - `GET /api/orders` – get all orders (admin)
  - `PUT /api/orders/:id/pay` – mark order as paid (admin)
  - `PUT /api/orders/:id/deliver` – mark order as delivered (admin)

### 3. Auth & Roles

- Users are stored in the `User` collection with a `role` field (`customer` or `admin`).
- JWTs are sent as:
  - **HTTP-only cookie** (`jwt`) and
  - Returned in the JSON response body for convenience.
- Use the `Authorization: Bearer <token>` header or rely on the cookie from the browser.

