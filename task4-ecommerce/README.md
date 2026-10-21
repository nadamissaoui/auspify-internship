# Task 4 - E-Commerce Website

Full-stack e-commerce platform with product browsing and management, built
for the Auspify Technologies Full Stack Development internship.

Stack: **Node.js + Express + MongoDB + JWT** for the backend, and
**HTML + CSS + vanilla JavaScript** for the frontend.

## Features

- Product catalog with images placeholders, ratings and stock
- Search, filter by category and price range, sorting
- Shopping cart (add, update quantity, remove, clear)
- User accounts (register / login) with JWT
- Checkout with shipping form and order summary (free shipping over 500 TND)
- Order history per user with status tracking
- Admin dashboard: revenue / orders / products / users stats,
  order management (update status) and product CRUD
- Responsive design and toast notifications

## Demo accounts

- Admin: `admin@auspify.com` / `admin123`
- Customer: register one from the store, or `client@test.com` / `secret123`

## Project structure

```
task4-ecommerce/
├── client/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       └── app.js
└── server/
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── models/        # User, Product, Order
        ├── middleware/    # auth.js (JWT + adminOnly)
        ├── controllers/   # auth, product, order
        ├── routes/        # auth, product, order
        └── seed/seed.js   # 12 demo products + admin
```

## Setup

### Backend

```bash
cd server
npm install
npm start
```

Uses an **in-memory MongoDB** by default (no setup, cleared on restart) on
port 5002, and auto-seeds 12 products + an admin account.
For persistent data, set `MONGODB_URI` in `.env`.

### Frontend

Open `http://localhost:5002` (the Express server serves the client folder).

## REST API

### Auth
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Products
| GET | `/api/products` | List (`?search=&category=&minPrice=&maxPrice=&sort=&featured=`) |
| GET | `/api/products/categories` | Distinct categories |
| GET | `/api/products/:id` | Product details |
| POST/PUT/DELETE | `/api/products/:id` | Admin only |

### Shop (protected)
| GET | `/api/shop/cart` | Get cart |
| POST | `/api/shop/cart` | Add item |
| PUT | `/api/shop/cart/:productId` | Update quantity |
| DELETE | `/api/shop/cart/:productId` | Remove item |
| DELETE | `/api/shop/cart` | Clear cart |
| POST | `/api/shop/checkout` | Place order |
| GET | `/api/shop/orders` | My orders |
| GET | `/api/shop/orders/:id` | Order detail |

### Admin
| GET | `/api/shop/admin/stats` | Dashboard stats |
| GET | `/api/shop/admin/orders` | All orders |
| PUT | `/api/shop/admin/orders/:id` | Update order status |

## Submission checklist

- [ ] Backend and frontend running locally
- [ ] Screenshots (catalog, cart, checkout, orders, admin)
- [ ] Source code pushed to GitHub
- [ ] Optional: demo video
