# Hextron Enterprises — Full-Stack Business Management System

> **Precision Turned. Performance Assured.**  
> Complete enterprise-grade full-stack business management application for CNC turning job-work and precision-machining in Behrampura, Ahmedabad, Gujarat, India.

---

## 🏭 Company Profile & Facility Information

- **Company Name:** Hextron Enterprises
- **Core Specialization:** CNC Turning Job Work and Precision Turned Components
- **Official Website:** [https://www.hextronenterprise.com](https://www.hextronenterprise.com)
- **Email:** [hextronenterprise@gmail.com](mailto:hextronenterprise@gmail.com)
- **Direct Phone / WhatsApp:** [+91 9879964414](tel:+919879964414)
- **Works & Machining Facility Address:**  
  138, 162 Paiki Plot No-21, Mohmadi Estate,  
  Near Rehan Masjid, Opposite Excel Industries,  
  Suez Farm, Behrampura,  
  Ahmedabad - 380022, Gujarat, India.

---

## 🏗️ Architectural Overview

The application features a clean, decoupled architecture separating the **Public Client Website** and the **Secure Staff Admin Portal**, backed by a RESTful Express.js API, Prisma ORM, and PostgreSQL.

```text
hextron-enterprises/
├── docker-compose.yml           # PostgreSQL container definition for instant local dev
├── vercel.json                  # Vercel SPA routing and rewrite rules
├── package.json                 # Monorepo scripts (dev:all, client, server, test, build)
├── .env.example                 # Frontend environment variables template
├── public/                      # Static assets, branding logos, drawings, gallery
│   └── images/
│       ├── logo-dark.png        # Brand logo for dark surfaces
│       ├── logo-light.png       # Brand logo for light surfaces
│       └── gallery/             # High-resolution CNC turning manufacturing photos
├── src/                         # React Frontend (Vite 8, React Router, Lucide React)
│   ├── api/
│   │   └── client.js            # Centralized API client with JWT bearer handling & interceptors
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication & Role provider (login, logout, session restore)
│   ├── components/
│   │   ├── Header.jsx           # Public navigation bar with Products & Admin Portal jump
│   │   ├── Footer.jsx           # Corporate footer with direct links & contact info
│   │   ├── ProtectedRoute.jsx   # Role-based route guard (ADMIN, SALES, EMPLOYEE)
│   │   ├── AdminLayout.jsx      # Industrial admin sidebar, topbar, mobile drawer
│   │   └── QuoteForm.jsx        # Interactive RFQ form connected to backend + WhatsApp
│   ├── pages/
│   │   ├── HomePage.jsx         # Preserved corporate landing page (Hero, About, Services, etc.)
│   │   ├── PublicProductsPage.jsx # Public products catalog with category & material filters
│   │   ├── PublicQuotePage.jsx  # Dedicated Request a Quote page with query param pre-fills
│   │   └── admin/               # Secure Admin Portal Pages
│   │       ├── AdminLoginPage.jsx       # Auth login with rate limiting & demo credentials quick-fill
│   │       ├── AdminDashboardPage.jsx   # Live database metrics & recent activity
│   │       ├── AdminQuotationsPage.jsx  # Multi-line item creator, status workflow, printable PDF
│   │       ├── AdminEnquiriesPage.jsx   # Contact enquiry assignment, status, internal notes
│   │       ├── AdminProductsPage.jsx    # Catalog CRUD, specifications builder, active toggles
│   │       ├── AdminCategoriesPage.jsx  # Category CRUD with deletion safety constraints
│   │       ├── AdminEmployeesPage.jsx   # Employee directory & department management
│   │       ├── AdminUsersPage.jsx       # Staff accounts, roles (ADMIN/SALES/EMP), pass reset
│   │       └── AdminSettingsPage.jsx    # Commercial defaults (GST %, prefix, email status)
│   └── styles/
│       ├── global.css           # Design tokens, color palette, typography
│       └── admin.css            # High-density industrial styling & print stylesheet
└── server/                      # Node.js / Express / Prisma Backend
    ├── package.json             # Server dependencies & scripts
    ├── .env.example             # Server environment variables template
    ├── API_DOCS.md              # REST API v1 endpoint specifications
    ├── prisma/
    │   ├── schema.prisma        # Complete PostgreSQL Prisma schema
    │   ├── seed.js              # Database seed script with fictional demo data
    │   └── migrations/          # Version-controlled SQL migration scripts
    ├── src/
    │   ├── app.js               # Express application, Helmet, CORS, Rate Limiters
    │   ├── index.js             # Server listener & graceful shutdown handlers
    │   ├── config/              # Centralized environment configuration
    │   ├── lib/
    │   │   └── prisma.js        # Prisma client with resilient offline in-memory fallback
    │   ├── middleware/          # Auth, RBAC, Validation (Zod), ErrorHandler, RateLimiter
    │   ├── routes/              # Versioned REST routers (/api/v1/*)
    │   └── utils/
    │       └── calc.js          # Decimal-safe arithmetic & quotation number generator
    └── tests/                   # Automated Vitest & Supertest integration test suites
        ├── calc.test.js         # Decimal calculation precision & padding tests
        └── api.test.js          # Auth, RBAC, Quotations, Enquiries, Employees, Products tests
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 (ESM, ultra-fast HMR) |
| **Routing** | React Router (`BrowserRouter` with protected route wrappers) |
| **Iconography & UI** | Lucide React, Modular CSS3 Design Tokens, Glassmorphism, Industrial Aesthetics |
| **Backend Runtime** | Node.js (v20+ / v22+), Express.js 4 (Modular REST API) |
| **ORM & Database** | Prisma ORM 6.4+, PostgreSQL 16+ (with local Docker Compose support) |
| **Security & Auth** | Argon2/Bcrypt password hashing, JWT Bearer tokens, Helmet HTTP headers, CORS, Zod validation |
| **Rate Limiting** | `express-rate-limit` on login attempts and public form submissions |
| **Testing** | Vitest 3, Supertest 7 (20 passing automated integration tests) |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

Permissions are strictly enforced on the server via `authenticateToken` and `requireRole(...)` middleware:

| Feature / Resource | Public Website | EMPLOYEE | SALES | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Browse Home, About, Services, Facility | ✅ | ✅ | ✅ | ✅ |
| Browse Products Catalog & Specifications | ✅ | ✅ | ✅ | ✅ |
| Submit Public RFQ / Contact Enquiry | ✅ | ✅ | ✅ | ✅ |
| Access Admin Portal Login | — | ✅ | ✅ | ✅ |
| View Admin Dashboard Metrics | — | ✅ | ✅ | ✅ |
| View Quotations & Detailed Line Items | — | ✅ | ✅ | ✅ |
| Create / Edit Quotation & Financial Rates | — | — | ✅ | ✅ |
| Transition Quotation Status (`QUOTED`, `ACCEPTED`) | — | — | ✅ | ✅ |
| View & Assign Contact Enquiries | — | — | ✅ | ✅ |
| Add Internal Notes (Hidden from Customer) | — | ✅ | ✅ | ✅ |
| Print / Generate Quotation Sheet | — | ✅ | ✅ | ✅ |
| Create / Edit Products & Categories | — | — | ✅ | ✅ |
| Delete Categories (With Safety Check) | — | — | — | ✅ |
| Employee Directory Management | — | Read-Only | Read-Only | ✅ |
| User & Role Management (Create, Reset Password) | — | — | — | ✅ |
| System Settings & Tax Configurations | — | Read-Only | Read-Only | ✅ |

---

## 🔢 Quotation Financial Calculation Rules

To prevent floating-point inaccuracies inherent in IEEE 754 arithmetic (e.g., `0.1 + 0.2 !== 0.3`), all financial calculations are processed on the server in cent/paise integer units before rounding:

$$\text{Line Item Total} = \text{round}(\text{quantity} \times \text{unitPrice})$$
$$\text{Subtotal} = \sum \text{Line Item Totals}$$
$$\text{Discount Amount} = \text{round}\left(\frac{\text{Subtotal} \times \text{discountPercent}}{100}\right)$$
$$\text{Net Amount} = \text{Subtotal} - \text{Discount Amount}$$
$$\text{GST Tax Amount} = \text{round}\left(\frac{\text{Net Amount} \times \text{taxRate}}{100}\right)$$
$$\text{Grand Total (INR)} = \text{Net Amount} + \text{GST Tax Amount}$$

### Sequential Quotation Numbering
Format: `HEX-QT-YYYY-XXXX` (e.g., `HEX-QT-2026-0001`, `HEX-QT-2026-0002`).  
Generated atomically on the server to prevent duplicates.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ or v22+ recommended)
- **npm:** v9.0.0 or higher
- **PostgreSQL / Docker (Optional):** Docker Desktop for local PostgreSQL container, or cloud PostgreSQL (Neon, Supabase).

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/ajijshekh123/Hextron_Enterprise.git
cd Hextron_Enterprise

# Install root & frontend dependencies
npm install

# Install backend dependencies
npm --prefix server install
```

### 3. Configure Environment Variables
Copy the provided `.env.example` templates:

```bash
# Frontend environment
cp .env.example .env

# Backend server environment
cp server/.env.example server/.env
```

### 4. Database Setup (PostgreSQL)

#### Option A: Using Docker (One-Command Setup)
```bash
docker compose up -d
```
This spins up PostgreSQL 16 on `localhost:5432` with database `hextron_db`.

#### Option B: Using Cloud PostgreSQL (Neon, Supabase, Railway, RDS)
Paste your connection string into `server/.env`:
```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DATABASE>?schema=public"
```

#### Run Prisma Migrations and Seed Demo Data
```bash
cd server

# Run PostgreSQL database migrations
npx prisma migrate dev --name init

# Seed database with fictional demo accounts, products, and quotations
npm run prisma:seed

cd ..
```

> **Note on Resilient Local Mode:**  
> If PostgreSQL is not active when launching the application, the server automatically boots into a **resilient in-memory evaluation mode** with pre-seeded demo records so you can test all features and workflows immediately without errors.

### 5. Run the Full-Stack Application
Run both frontend and backend concurrently with one command from the project root:

```bash
npm run dev:all
```

- **Public Website:** [http://localhost:5173](http://localhost:5173)
- **Product Catalog:** [http://localhost:5173/products](http://localhost:5173/products)
- **Request a Quote:** [http://localhost:5173/quote](http://localhost:5173/quote)
- **Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend REST API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔑 Fictional Demonstration Accounts

These accounts are seeded for local demonstration and evaluation:

| Account Type | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hextron-demo.internal` | `DemoAdmin@2026!` | Full administrative access, users, categories, settings |
| **Sales Engineer** | `sales@hextron-demo.internal` | `DemoSales@2026!` | Commercial quotations, inquiries, products catalog |
| **CNC Operator** | `operator@hextron-demo.internal` | `DemoEmp@2026!` | Shop floor restricted view, component drawings |

*(The login screen also provides 1-click auto-fill buttons for instant evaluation without typing)*

---

## 🧪 Automated Testing & Quality Assurance

Run the automated test suite covering authentication, RBAC authorization, decimal calculations, public submissions, employee CRUD, product management, and category constraints:

```bash
npm test
```

Expected output:
```text
 ✓ tests/calc.test.js (5 tests)
 ✓ tests/api.test.js (15 tests)

 Test Files  2 passed (2)
      Tests  20 passed (20)
```

---

## 🚢 Production Deployment Guide

### A. Managed PostgreSQL Database
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech), [Supabase.com](https://supabase.com), or Railway.
2. Copy the pooled or direct connection string (e.g. `postgresql://...`).
3. Set `DATABASE_URL` in your hosting environment.
4. Run migrations: `npx prisma migrate deploy && node prisma/seed.js`.

### B. Deploying Frontend to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://api.hextronenterprise.com/api/v1` or `/api/v1` if using reverse proxy).
6. The included `vercel.json` ensures all client-side routes (`/products`, `/quote`, `/admin/*`) resolve without 404s.

### C. Deploying Backend API
1. Deploy the `server/` directory to **Render**, **Railway**, **Fly.io**, or any Node.js hosting platform.
2. Root Directory: `server`.
3. Build Command: `npm install && npx prisma generate`.
4. Start Command: `node src/index.js`.
5. Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL URL.
   - `JWT_SECRET`: A 32+ character random string.
   - `CORS_ORIGIN`: Your frontend Vercel URL (e.g. `https://www.hextronenterprise.com`).
   - `PORT`: 5000 (or provided by host).

---

## 📋 Remaining Production Checklist

Before going live with production customer orders:
1. **Domain & DNS:** Point `hextronenterprise.com` to Vercel and `api.hextronenterprise.com` to your backend provider.
2. **SMTP Email Configuration:** Provide live SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) in `server/.env` to enable automated outbound email notifications alongside WhatsApp.
3. **Change Administrator Passwords:** Replace fictional demo credentials with strong, unique passwords for staff members.
4. **Automated Database Backups:** Configure daily snapshot backups on your managed PostgreSQL provider.
