# SpendWise - Smart Expense Tracker

A full-stack expense tracker with AI auto-categorisation, charts, budgets, premium payments and secure authentication.

**Frontend:** React 19 (Vite), React Router, Recharts, Axios, Lucide icons
**Backend:** Node.js, Express 5, Sequelize, MySQL
**Integrations:** Google Gemini (AI categories), Cashfree (payments), Brevo (emails)

## Features

- Register / login with JWT, bcrypt password hashing
- **Rate limiting** on login (5 failed attempts / 15 min per IP + email) and password reset (3 emails / hour), with a friendly "try again in X min" message
- Forgot / reset password by email (single-use link, expires in 15 minutes)
- Add, edit, delete expenses; **AI picks the category** (or choose manually)
- Dashboard: stat cards, spending-by-category donut, last-6-months bar chart
- Monthly budget with progress bar and overspend warning
- Search, category / month filters, sorting, "show more"
- Premium (Cashfree): leaderboard, PDF and CSV export
- Light / dark mode, fully responsive (mobile bottom-sheet forms, card-style table)

## Run locally

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # http://localhost:3000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Create an empty MySQL database first (name = `DB_NAME` in `.env`). Tables are created automatically.

> **Existing database?** The `Education` category was added and an `Orders` model is included. Set `DB_SYNC_ALTER=true` in `.env` for one run so Sequelize updates the old tables, then set it back to `false`.

## API

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | - | |
| POST | `/api/auth/login` | - | rate limited |
| POST | `/api/password/forgetpassword` | - | rate limited, same reply whether email exists or not |
| GET / POST | `/api/password/resetpassword/:id` | - | validate link / set new password (POST rate limited) |
| GET / POST | `/api/expenses` | JWT | list / create |
| GET / PUT / DELETE | `/api/expenses/:id` | JWT | owner only |
| GET | `/api/leaderboard` | JWT + premium | |
| POST | `/api/payment/create-order`, `/api/payment/verify` | JWT | Cashfree |

## Structure

```
backend/   config/ models/ middlewares/ (auth + rateLimiter) controllers/ routes/ services/ server.js
frontend/  src/ api/ context/ utils/ components/ pages/
```
