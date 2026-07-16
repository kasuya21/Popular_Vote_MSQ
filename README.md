# StarMoon Vote 🌟🌙

StarMoon Vote is a modern, responsive, and secure web application designed for campus university events (e.g., Star, Moon, and Queen contests). It features a real-time voting system paired with a mock PromptPay QR Code payment gateway, an administrative dashboard, and role-based access control.

## Tech Stack

### Frontend
- React 19 + Vite
- React Router DOM
- Tailwind CSS v4 + daisyUI
- `@tanstack/react-query` for server state management
- Axios
- Lucide React for modern SVG icons

### Backend
- Node.js + Express
- PostgreSQL (via Prisma ORM)
- JWT (JSON Web Tokens) with `httpOnly` cookies for Admin Auth
- bcryptjs for password hashing
- Zod for payload validation
- Helmet, CORS, and Express-Rate-Limit for security

## Features

- **Public Features:**
  - View candidates by categories (Star, Moon, Queen).
  - Detailed candidate profiles and real-time score ranking.
  - Vote for candidates by selecting voting packages.
  - Mock PromptPay QR code generation and checkout process.
  - Track order and payment status.
  
- **Admin Features:**
  - Secure Login with JWT `httpOnly` cookies.
  - Role-based Dashboard (SUPER_ADMIN, EVENT_ADMIN, FINANCE_ADMIN, CONTENT_ADMIN, VIEWER).
  - Manage Candidates (Add, Edit, Toggle Active, Delete).
  - Manage Vote Packages.
  - Track Orders, Payments, and view Reconciliation and Refund logs.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `popular_vote`.

### 2. Backend Setup
```bash
cd server
npm install

# Configure your environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET, PAYMENT_SECRET, etc.

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed the database with initial Admin user and mock data
npx prisma db seed

# Start the server
npm run dev
```
By default, the backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:5173`.

### 4. Default Admin Credentials
After running the seed script, you can log in to the admin dashboard at `http://localhost:5173/admin/login` using:
- **Email:** `admin@starmoon.vote`
- **Password:** `admin123`

## Project Structure
- `/client` - React frontend
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page views (Public and Admin)
  - `/src/layouts` - Layout wrappers
  - `/src/services` - API wrappers using Axios
  - `/src/contexts` - React Contexts (e.g., AuthContext)
- `/server` - Express backend
  - `/src/controllers` - Route handlers
  - `/src/middleware` - Auth, upload, and error middlewares
  - `/src/routes` - API routes definitions
  - `/src/validators` - Zod schemas
  - `/prisma` - Database schema and seed script

## Security Practices
- **Passwords** are hashed using `bcryptjs`.
- **JWT Tokens** are stored in `httpOnly` cookies to prevent XSS attacks.
- **Idempotency Keys** are generated during order creation to prevent duplicate orders.
- **Webhook Signatures** are verified using HMAC-SHA256 to ensure data integrity from the payment provider.
- **Rate Limiting** is applied to authentication endpoints to mitigate brute force attacks.

## License
MIT License
