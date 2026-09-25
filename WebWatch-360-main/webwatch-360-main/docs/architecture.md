# System Architecture & Technical Design Document

**Project:** WebWatch 360  
**Repository:** `webwatch-360`  
**Target Platform:** Web (Desktop & Mobile Responsive)

---

## 1. High-Level Architecture Overview

WebWatch 360 is built on a modern **Decoupled Client-Server Architecture** featuring a single-page React frontend, a RESTful Node.js/Express backend, and a relational PostgreSQL database.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                        │
│   React 19 SPA + Vite + TailwindCSS + Lucide Icons + React Router      │
│   • Auth Guard & Protected Routes                                      │
│   • Core Portfolio Dashboard (Phase 1 & 2 Focus)                       │
│   • Responsive Desktop / Tablet / Mobile Navigation                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER (Node.js)                        │
│   Express.js Application Server                                        │
│   ├── Middlewares (Helmet, CORS, Morgan, ErrorHandler, AuthGuard)      │
│   ├── Authentication Module (JWT + Bcrypt)                             │
│   ├── Website & Client Management Controller (CRUD + Soft-Delete)      │
│   ├── Search & Filter Query Engine                                     │
│   ├── Credentials Cryptography Engine (Node.js Crypto AES-256-GCM)     │
│   └── Expiry Status Calculator (Dynamic Date Diff Engine)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Connection Pool (pg)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER (PostgreSQL)                       │
│   Relational Schema with 10 Tables, Foreign Keys, and B-Tree Indexes   │
│   [users, clients, websites, hosting, domains, ssl, credentials, ...]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Directory Structure

### Backend Structure (`/backend`)
```text
backend/
├── src/
│   ├── config/             # Environment, DB connection pool, constants
│   ├── database/           # Migrations, table schemas, sample seeders
│   ├── middlewares/        # JWT auth guard, error handling, rate limiter
│   ├── modules/
│   │   ├── auth/           # Login, JWT issue, profile endpoints
│   │   ├── clients/        # Client profile management
│   │   ├── websites/       # Website CRUD, archiving, restore, search & filters
│   │   ├── dashboard/      # KPI metrics & aggregates
│   │   ├── credentials/    # Encrypted credentials vault
│   │   └── maintenance/    # Checklists and maintenance logs
│   ├── utils/              # Crypto helper (AES-256), date-diff calculators
│   ├── app.js              # Express app initialization & middleware stack
│   └── server.js           # Server listen & graceful shutdown
```

### Frontend Structure (`/frontend`)
```text
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # ProtectedRoute wrapper, Login card
│   │   ├── layout/         # Sidebar, MobileSidebar, Navbar, DashboardLayout
│   │   ├── websites/       # WebsiteTable, WebsiteCard, StatusBadge, AddModal
│   │   └── common/         # Modals, buttons, badges, loaders
│   ├── context/            # AuthContext (JWT state & user persistence)
│   ├── pages/              # Dashboard, Websites, Clients, Archive, Details, Login
│   ├── services/           # Axios / Fetch API service layer
│   ├── App.jsx             # Main router configuration
│   └── main.jsx            # React root mount
```

---

## 3. Security Architecture

1. **Authentication & Authorization**:
   - Single-user Admin credentials stored with **bcryptjs** (10 salt rounds).
   - Signed **JSON Web Tokens (JWT)** with 24-hour expiration.
   - Every protected route enforces `authMiddleware` checking `Bearer <token>`.
2. **Data Protection at Rest (Credentials Vault)**:
   - AES-256-GCM symmetric encryption using a 32-byte secret key and 16-byte initialization vectors (IV).
   - Authentication tags prevent tampering.
3. **Transport & Application Layer**:
   - Helmet.js for secure HTTP response headers (HSTS, XSS protection, anti-clickjacking).
   - CORS origin restriction to the frontend port (`localhost:5173`).

---

## 4. Phased Internship Roadmap (6 Weeks)

- ✅ **Phase 1 (Week 1):** Setup & Auth — Project scaffolding, database schema, single-user login guard.
- ✅ **Phase 2 (Week 2):** Website Management — Full CRUD operations, soft-delete archiving, debounced search & multi-filtering.
- 🔄 **Phase 3 (Week 3):** Renewal Tracking — 5-point expiry fields (Domain, Hosting, SSL, Email, CDN) & live status colors.
- 🔄 **Phase 4 (Week 4):** Maintenance Checklist — Recurring maintenance logs and timestamped task tracking.
- 🔄 **Phase 5 (Week 5):** Notifications & Alerts — 30/15/7-day & on-expiry reminder engine.
- 🔄 **Phase 6 (Week 6):** Credentials Vault & Reporting — AES-256 vault reveal, dashboard analytics, and CSV exports.
