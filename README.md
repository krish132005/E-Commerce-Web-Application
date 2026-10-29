# NEXORA

**Everything you want. One place.**

NEXORA is a responsive, editorial-style e-commerce college project with a React + Vite storefront, an Express REST API, and PostgreSQL managed with Prisma. Prices are displayed in INR. The storefront has a local demo catalog so the UI can be explored before PostgreSQL is configured; connecting the API enables persistent catalog data, accounts, cart, checkout orders, newsletter signups, and admin analytics.

## What is included

- Responsive homepage, collection edits, product cards, product detail pages, search, filters, sorting, wishlist, and a persistent shopping bag.
- Sign-up and sign-in using bcrypt-hashed passwords and JWT sessions.
- Product catalog, customer cart, newsletter, order placement, stock updates, and admin endpoints in the REST API.
- Role-protected admin analytics at `/admin`, including real sales and order data after an administrator signs in.
- Seed catalog with 12 believable products, INR pricing, brands, descriptions, reviews, stock, and photography.
- Product options: clothing and footwear have size choices, watches have strap choices, and products with listed colourways have colour choices.
- PostgreSQL schema for accounts, products, cart items, orders, order lines, and newsletter subscriptions.

> **Payments:** Checkout creates an order in the database; it does not collect card details or charge a payment method. Connect a payment provider such as Razorpay or Stripe before using this as a real shop.

## Folder map

```text
E-Commerce Web Application/
├── client/                         # React, Vite, TypeScript storefront
│   ├── src/
│   │   ├── api.ts                  # Axios client and catalog API helpers
│   │   ├── data.ts                 # Demo catalog, collections, INR helpers
│   │   ├── App.tsx                 # Routes, pages, cart, search, dashboard
│   │   ├── index.css               # Responsive design system and page styles
│   │   └── main.tsx                # React Router application entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                         # Express, TypeScript, REST API
│   ├── prisma/
│   │   ├── schema.prisma           # PostgreSQL data model
│   │   └── seed.ts                 # Sample products and local admin account
│   ├── src/
│   │   ├── auth.ts                 # JWT and role authorization middleware
│   │   ├── db.ts                   # Prisma client
│   │   └── index.ts                # REST endpoints and error handling
│   ├── .env.example                # Server environment variable template
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── package.json                    # Convenience scripts for both apps
└── README.md
```

## Requirements

- Node.js 20.19+ (Node.js 22 LTS is a good choice) and npm.
- PostgreSQL 14+ running locally or a PostgreSQL connection URL.
- VS Code (recommended).

## Run locally on Windows

Open the project folder in VS Code. In a PowerShell terminal, install the two apps:

```powershell
npm --prefix client install
npm --prefix server install
```

Create a PostgreSQL database named `nexora` (for example, in pgAdmin: **Databases → Create → Database**). Then create the server's environment file:

```powershell
Copy-Item server\.env.example server\.env
```

Edit `server\.env` and set your PostgreSQL username/password, a private JWT secret (at least 32 characters), and an admin password:

```env
DATABASE_URL="postgresql://postgres:YOUR_URL_ENCODED_PASSWORD@localhost:5432/nexora?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret-of-at-least-32-characters"
PORT=4000
CLIENT_URL="http://localhost:5173"
ADMIN_EMAIL="admin@nexora.local"
ADMIN_PASSWORD="choose-a-strong-local-admin-password"
```

If your database password contains URL-reserved characters (such as `@`, `#`, `/` or `:`), URL-encode the password portion of `DATABASE_URL`. Never commit `server/.env`.

In the project root, generate Prisma Client, create the database tables, and add the sample catalog:

```powershell
npm --prefix server run db:generate
npm --prefix server run db:migrate -- --name init
npm --prefix server run db:seed
```

Start the API and storefront in **two separate VS Code terminals**:

```powershell
npm run server
```

```powershell
npm run client
```

Open **http://localhost:5173**. The API health check is **http://localhost:4000/api/health**. Sign in to the local admin account using the email and password configured in `server/.env`; then open **http://localhost:5173/admin** to see database-backed analytics.

If PostgreSQL is not configured yet, the storefront still runs with the demo catalog. Account, order, and live analytics features need the API and database running.

## Useful commands

Run these from the project root:

```powershell
npm run build:client
npm run build:server
npm --prefix server run db:studio
```

The Prisma Studio command opens a local database browser. To add or change a database field, edit `server/prisma/schema.prisma`, create a migration with `npm --prefix server run db:migrate -- --name describe_change`, and then update the related API/frontend code.

## Main API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API health check |
| GET | `/api/products` | Public | Search and filter catalog |
| GET | `/api/products/:id` | Public | Product detail |
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Sign in and receive JWT |
| GET | `/api/auth/me` | Signed in | Read current account |
| GET / PUT | `/api/cart`, `/api/cart/:productId` | Signed in | Read and update customer cart |
| POST | `/api/orders` | Signed in | Create order and decrement stock |
| POST | `/api/newsletter` | Public | Subscribe to newsletter |
| GET | `/api/admin/overview` | Admin | Store analytics and latest orders |
| POST | `/api/admin/products` | Admin | Add a product |

## Publish the project to GitHub

1. Create a **new empty repository** on [GitHub](https://github.com/new). Do not add a README or `.gitignore` there because this project already contains them.
2. In VS Code, open **Terminal → New Terminal** in the project root. Confirm `server/.env` is not being staged; `.env` files are intentionally ignored.
3. Run the following, replacing `YOUR-USERNAME` with your GitHub username and `YOUR-REPOSITORY` with the repository name:

```powershell
git init
git add .
git status
git commit -m "Build NEXORA e-commerce application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Review the output of `git status` before committing. **Never add or upload `server/.env`, database credentials, admin passwords, or JWT secrets.** If asked to authenticate, use GitHub's browser sign-in or a GitHub Personal Access Token as the password (not your GitHub account password).
