# Task 3 - Expense Tracker Web Application

Full-stack application to track income, expenses and financial summaries,
built for the Auspify Technologies Full Stack Development internship.

Stack: **Node.js + Express + MongoDB + JWT authentication** for the backend,
and **HTML + CSS + vanilla JavaScript + Canvas charts** for the frontend.

## Features

- User authentication (register / login) with JWT
- Add, edit and delete income / expense transactions
- Dashboard with live totals: income, expenses, balance, count
- Monthly income vs expenses bar chart (custom Canvas, no dependency)
- Expenses breakdown by category with colors
- Search, filter by type and category
- Per-user data isolation (each user sees only their own data)
- Responsive design and toast notifications

## Project structure

```
task3-expense-tracker/
├── client/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js          # Fetch wrapper + JWT handling
│       ├── charts.js       # Canvas monthly chart
│       └── app.js          # UI logic
└── server/
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── models/         # User.js, Transaction.js
        ├── middleware/     # auth.js (JWT protect)
        ├── controllers/    # authController.js, transactionController.js
        └── routes/         # authRoutes.js, transactionRoutes.js
```

## Setup

### Backend

```bash
cd server
npm install
npm start
```

By default it uses an **in-memory MongoDB** (no setup required) on port 5001.
Data is cleared on restart. For persistent data, copy `.env.example` to `.env`
and set your MongoDB Atlas connection string:

```
PORT=5001
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/expense_tracker
JWT_SECRET=your-secret-key
```

### Frontend

The Express server serves the `client` folder. Once running, open:

```
http://localhost:5001
```

## REST API

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and get a JWT |
| GET | `/api/auth/me` | Current user (protected) |

### Transactions (all protected with `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/transactions` | List (`?type=&category=&search=&from=&to=`) |
| GET | `/api/transactions/summary` | Dashboard summary |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

## Submission checklist

- [ ] Backend and frontend running locally
- [ ] Screenshots (login, dashboard, add form, chart)
- [ ] Source code pushed to GitHub
- [ ] Optional: demo video
