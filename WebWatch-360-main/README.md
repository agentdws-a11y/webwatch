# WebWatch 360 - Website Maintenance & Expiry Tracker

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express%204.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-blue.svg)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016+-blue.svg)](https://www.postgresql.org/)
[![Milestone](https://img.shields.io/badge/Milestone-Phase%201%20%26%202%20Completed-brightgreen.svg)]()

**WebWatch 360** is a single-user developer application designed to track and manage client websites in one centralized, real-time dashboard.

> 📢 **Meeting & Sprint Review Readiness**:
> - 📄 **[Meeting Presentation Guide & Speech Script](file:///e:/webwatch-360/docs/MEETING_PRESENTATION_GUIDE.md)**
> - 🏛️ **[System Architecture](file:///e:/webwatch-360/docs/architecture.md)**
> - 📡 **[REST API Documentation](file:///e:/webwatch-360/docs/api-documentation.md)**
> - 🗄️ **[Relational Database Schema](file:///e:/webwatch-360/docs/database-schema.md)**
> - 🧪 **[Testing & QA Verification Report](file:///e:/webwatch-360/docs/testing-report.md)**

---

## 🗓️ 2-Week Sprint Progress (Day-Wise Breakdown)

### 🔹 **Phase 1: Setup & Authentication (Week 1)**
- **Day 1:** Architecture scaffolding, React 19 + Express setup, `.env` config.
- **Day 2:** PostgreSQL relational schema (10 tables, foreign keys, indexes).
- **Day 3:** Backend Auth (`POST /api/auth/login`, bcrypt password hashing, JWT signing).
- **Day 4:** Frontend Auth UI, `AuthContext`, and `<ProtectedRoute>` route guard.
- **Day 5:** Security audit (Helmet, CORS), API tests, and health endpoint.

### 🔹 **Phase 2: Website Management & Archiving (Week 2)**
- **Day 1:** Client & Website REST CRUD APIs with payload validation.
- **Day 2:** Non-destructive **Soft-Delete (Archive / Restore)** engine.
- **Day 3:** Sub-second search, multi-filter (Technology, Client), and sorting query engine.
- **Day 4:** Frontend portfolio UI (Data Table, Grid Cards, Add/Edit modals).
- **Day 5:** Dedicated **Archive Vault** screen, debounced search integration, UX polish.

---

## 🎯 The Problem & Solution

### The Problem
Freelance developers and agencies managing dozens of client websites often store renewal dates, hosting logins, and maintenance schedules scattered across memory, spreadsheets, notes, and old emails. When renewals get missed, client websites go down, SSL certificates break, and maintenance work goes unrecorded.

### The Solution
A unified dashboard to add, monitor, and maintain every client website  with automatic expiry calculations, dynamic status indicators (Safe 🟢, Warning 🟡, Expired 🔴), recurring maintenance logs, and an encrypted credentials vault.

---

## 🚀 Key Features & Modules

### 1. Website & Client Management (CRUD + Archiving)
- Full CRUD operations for websites and client profiles.
- **Soft-Delete / Archiving**: Websites can be archived (soft-deleted) to preserve historical logs without permanently deleting data, with 1-click restore.
- Real-time search, multi-filter dropdowns (Technology, Priority, Client, Status), and toggle between Table and Grid Card views.

### 2. 5-Point Renewal & Expiry Tracking Engine
Live calculation comparing current date against expiration dates:
- **Domain Expiry** (Registrar, renewal cost, auto-renew flag)
- **Hosting Expiry** (Host provider, plan name, cost)
- **SSL Certificate Expiry** (Issuer, SSL type, validity)
- **Business Email Expiry** (Google Workspace, M365, etc.)
- **CDN / WAF Expiry** (Cloudflare, Fastly, AWS CloudFront)

#### Dynamic Status Indicators:
- 🟢 **Safe**: More than 30 days remaining (`> 30 days`).
- 🟡 **Expiring Soon**: 30 days or fewer remaining (`≤ 30 days`).
- 🔴 **Expired**: Past expiry date (`< 0 days`) — Immediate action required.

### 3. Maintenance Checklist & Timestamped Logs
- Recurring checklist per site: Full Backup, Core/Plugin Updates, Malware Scan, Speed Optimization, Broken Links Check, Database Cleanup.
- Each checked action is recorded with an exact timestamp and notes.

### 4. Credentials Vault (AES-256-GCM Encrypted)
- Mandatory security module storing cPanel, CMS admin, SFTP, and Registrar logins.
- Encrypted at rest using AES-256-GCM with unique IVs and Authentication Tags.
- Passwords are never logged or exposed in plain text in database backups.
- In-dashboard reveal button with copy-to-clipboard functionality.

### 5. Overview Dashboard & Reports
- Key metrics: Total Active Sites, Safe Services, Expiring Soon, Expired/Overdue, Maintained This Month.
- Technology distribution portfolio breakdown.
- Immediate action alert banners for expired and upcoming renewals.
- One-click CSV spreadsheet export for auditing and client reporting.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS, Lucide Icons | Responsive single-page application dashboard |
| **Backend** | Node.js, Express.js | REST API, transaction handling, error middleware |
| **Database** | PostgreSQL | Relational schema with 10 tables & foreign keys |
| **Authentication**| JWT (JSON Web Tokens) & Bcrypt | Single-user Admin protected routes |
| **Cryptography** | Node.js `crypto` (AES-256-GCM) | Credentials Vault encryption at rest |

---

## 🗄️ Database Schema (10 Relational Tables)

```text
├── users                (Admin user credentials with bcrypt password hash)
├── clients              (Client contact details and organization info)
├── websites             (Core website details, tech stack, priority, tags, archive state)
├── hosting_details      (1-to-1 linked hosting provider, plan, cost, renewal date)
├── domain_details       (1-to-1 linked registrar, cost, auto-renew, expiry date)
├── ssl_details          (1-to-1 linked SSL issuer, type, expiry date)
├── email_cdn_details    (1-to-1 linked business email and CDN renewals)
├── credentials          (AES-256-GCM encrypted passwords with IV and auth tag)
├── maintenance_logs     (Timestamped checklist history per website)
└── notifications        (30/15/7-day & on-expiry reminder alerts)
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Running on port 5432)

### 1. Clone & Configure Environment
Configure your database password in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webwatch360
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/webwatch360
JWT_SECRET=your_secret_jwt_key
VAULT_SECRET_KEY=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
CORS_ORIGIN=http://localhost:5173
```

### 2. Run Database Migration & Sample Data Seeder
Inside the `backend/` directory:
```bash
cd backend
npm install
npm run db:setup
```
*(This automatically creates the `webwatch360` database, creates all 10 tables, and seeds demo client websites with Safe, Warning, and Expired statuses).*

---

## 🚀 Running the Application

### Option A: 1-Click Startup (Windows)
Double-click the **`start.bat`** file in the root directory:
```text
e:\webwatch-360\start.bat
```
*(Automatically starts Backend on Port 5000, Frontend on Port 5173, and opens your default browser).*

### Option B: Manual Startup
Open two separate terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server running at: http://localhost:5000
```

**Terminal 2 (Frontend Dashboard):**
```bash
cd frontend
npm run dev
# Dashboard running at: http://localhost:5173
```

---

## 🔑 Default Admin Login

- **URL**: [http://localhost:5173](http://localhost:5173)
- **Email**: `admin@webwatch360.com`
- **Password**: `Admin@123456`
*(Or click the "Auto-fill Demo Admin Credentials" button on the login screen).*

---

## 📡 REST API Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Service health status |
| **Auth** | `POST` | `/api/auth/login` | Single-user admin login |
| **Auth** | `GET` | `/api/auth/me` | Current profile information |
| **Websites** | `GET` | `/api/websites` | List websites with search & status filters |
| **Websites** | `GET` | `/api/websites/:id` | Full details with 5-point renewals & logs |
| **Websites** | `POST` | `/api/websites` | Transactional multi-table creation |
| **Websites** | `PUT` | `/api/websites/:id` | Update website & renewal dates |
| **Websites** | `PATCH`| `/api/websites/:id/archive` | Soft-delete / Archive website |
| **Websites** | `PATCH`| `/api/websites/:id/restore` | Restore archived website |
| **Websites** | `DELETE`| `/api/websites/:id` | Permanent delete |
| **Clients** | `GET` | `/api/clients` | List clients with site portfolio count |
| **Clients** | `POST` | `/api/clients` | Create client profile |
| **Dashboard**| `GET` | `/api/dashboard/summary` | Aggregate KPIs & overdue list |

---

## 📜 License
This project is developed as part of the GWS Digital Services  Internship Program.
