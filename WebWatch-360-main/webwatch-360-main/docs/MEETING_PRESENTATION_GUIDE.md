# WebWatch 360 — Team Lead Meeting Presentation Guide
**Project:** WebWatch 360 — Website Maintenance & Expiry Tracker  
**Internship Program:** GWS Digital Services (6-Week Internship)  
**Milestone:** Sprints 1 & 2 Review (Phase 1 & Phase 2 Completion)

---

## 🎯 Executive Overview for Meeting
This guide provides the exact **day-by-day work log**, **speech script**, and **technical Q&A cheatsheet** for presenting the first two completed phases to the Team Lead:
- **Phase 1 (Week 1):** Project Scaffolding, Database Schema Design, and Single-User Authentication Guard.
- **Phase 2 (Week 2):** Website Portfolio Management (CRUD), Soft-Delete Archiving Engine, Search, Filter & Sort.

---

## 📅 Day-Wise Sprint Breakdown (Presentation Log)

### 🔹 **WEEK 1: Phase 1 — Setup & Authentication**

| Day | Milestone / Task | Key Technical Deliverables |
| :--- | :--- | :--- |
| **Day 1** | **Project Architecture & Scaffolding** | Configured dual-layer repo (`frontend/` with React 19 + Vite + TailwindCSS, `backend/` with Node.js + Express). Initialized Git repository, `.gitignore`, and environment configuration templates (`.env`). |
| **Day 2** | **Relational Database Design** | Structured PostgreSQL relational schema with 10 tables (`users`, `clients`, `websites`, `hosting_details`, `domain_details`, `ssl_details`, `email_cdn_details`, `credentials`, `maintenance_logs`, `notifications`). Designed Primary Keys, Foreign Keys (`ON DELETE CASCADE`), and query performance indexes. |
| **Day 3** | **Backend Authentication Engine** | Developed Admin Auth controller and routes (`POST /api/auth/login`, `GET /api/auth/me`). Integrated **bcryptjs** (10 salt rounds) for password hashing and signed **JWT tokens** with configurable expiration. Built `authMiddleware` to guard all protected REST routes. |
| **Day 4** | **Frontend Auth UI & Route Protection** | Designed responsive login screen with visual validation and 1-click demo credential filler. Implemented `AuthContext`, persistent token storage, and `<ProtectedRoute>` component guard preventing unauthenticated dashboard access. |
| **Day 5** | **Security Auditing & Test Validation** | Conducted Postman integration tests for invalid tokens, expired headers, and edge cases. Added CORS configuration, Helmet security headers, and health check endpoint (`GET /api/health`). |

---

### 🔹 **WEEK 2: Phase 2 — Website Management & Archiving**

| Day | Milestone / Task | Key Technical Deliverables |
| :--- | :--- | :--- |
| **Day 1** | **Client & Website REST Endpoints** | Created `POST /api/websites` (with multi-table transaction support for 1-to-1 hosting/domain/SSL relations) and `GET /api/websites` with relational `JOIN clients`. Added `express-validator` schema rules for URLs, tech stack, and required inputs. |
| **Day 2** | **Soft-Delete (Archive / Restore) Logic** | Implemented non-destructive soft-delete via `is_archived: BOOLEAN` and `archived_at: TIMESTAMP`. Built `PATCH /api/websites/:id/archive` and `PATCH /api/websites/:id/restore` APIs so client maintenance history is never accidentally lost. |
| **Day 3** | **Search, Filter & Sort Query Engine** | Engineered dynamic SQL query builder supporting case-insensitive multi-field search (`website_name`, `client_name`, `website_url`), filtering by Technology (WordPress, Shopify, React, etc.), and sorting by Date Built and Alphabetical Name. |
| **Day 4** | **Frontend Website Portfolio UI** | Designed Table and Grid Card views for managed websites with real-time health badges (Safe 🟢, Warning 🟡, Expired 🔴). Built the "Add Website" multi-step modal form and individual Website Detail view. |
| **Day 5** | **Archive Vault & Polish** | Built dedicated **Archive Vault Page** (`/archive`) allowing 1-click restore or permanent delete. Connected debounced search inputs, verified sub-second response times, and committed milestone tag `v1.2.0-phase2`. |

---

## 🗣️ Meeting Speech Script (Step-by-Step Flow)

### 1. Opening Introduction (30–45 seconds)
> *"Good morning/afternoon Sir. Today I am excited to present the progress for the first two phases of **WebWatch 360 — Website Maintenance Tracker**.*
> 
> *As outlined in our project brief, managing multiple client websites often leads to scattered notes and missed deadlines. In these first two weeks, I focused on building a solid foundation: establishing our secure single-user authentication architecture in **Phase 1**, and developing the full Website & Client Management module with an intelligent Soft-Delete Archiving system in **Phase 2**.*
> 
> *Let me share my screen and walk you through the live demonstration."*

---

### 2. Live Demo Walkthrough (2–3 minutes)

#### Step 1: Authentication & Route Protection (Phase 1)
1. **Show the Login Screen (`http://localhost:5173/login`)**:
   > *"Notice that unauthenticated users cannot access any dashboard routes. The route guard instantly redirects them to the login screen."*
2. **Click "Auto-fill Demo Admin Credentials" & Login**:
   > *"Authentication uses salted bcrypt password hashing on the backend and issues a signed JWT token that securely authorizes subsequent API calls."*

#### Step 2: Overview Dashboard & KPI Summary (Phase 1 & 2)
1. **Show the Top Metrics Grid**:
   > *"Here at a glance, the developer sees Total Active Sites, Archived Sites, Safe Services, and any upcoming or overdue deadlines."*
2. **Show the Technology Breakdown**:
   > *"The dashboard automatically aggregates technology distribution across all active clients (WordPress, Shopify, React, Laravel, etc.)."*

#### Step 3: Website Portfolio & CRUD Operations (Phase 2)
1. **Navigate to the Websites Page (`/websites`)**:
   > *"Here is the complete website portfolio. We can switch between a detailed data table and visual cards."*
2. **Demonstrate Search & Multi-Filters**:
   > *"I've implemented a debounced search bar. If I type 'Shopify' or a client name, the list updates instantly in under 1 second thanks to database indexing."*
3. **Show Adding/Editing a Website**:
   > *"Adding a website records the client name, website URL, tech stack, date launched, and hosting/domain details."*

#### Step 4: Soft-Delete (Archive) & Restore Feature
1. **Click "Archive" on a test website**:
   > *"Instead of permanently destroying data, the system performs a Soft-Delete. The site is removed from the active view but preserved in the database."*
2. **Navigate to "Archive Vault" (`/archive`) & Click "Restore"**:
   > *"In the Archive Vault, the developer can review all archived client sites and restore them with one click with full history intact."*

---

### 3. Conclusion & Next Sprint Preview (30 seconds)
> *"With Phase 1 and Phase 2 complete, our core website management and data security foundations are fully operational. In the upcoming sprints, I will be building out **Phase 3 (5-Point Expiry Calculation Engine)**, **Phase 4 (Recurring Maintenance Checklist)**, and **Phase 5/6 (Proactive Notifications & Credentials Vault)**.*
> 
> *I would love to get your feedback or answer any questions."*

---

## ❓ Technical Q&A Cheatsheet for Team Lead Inquiries

### Q1: "Why did you choose a Soft-Delete (Archive) pattern over permanent deletion?"
* **Answer:** *"Client websites contain critical renewal timestamps, domain registrar records, and maintenance logs. If an admin deletes a site accidentally or because a client temporarily pauses their contract, permanent deletion destroys that historical data. Soft-delete sets an `is_archived: true` flag, keeping the main dashboard clean while allowing full historical preservation and 1-click restoration."*

### Q2: "How did you implement single-user security without overcomplicating role management?"
* **Answer:** *"The project brief specified a single-user developer tool, so we avoided unnecessary role-permission matrices. Instead, we focused on robust single-user security: bcrypt hashing with 10 salt rounds for password storage, JWT token verification on every private API route via Express middleware, and CORS/Helmet header protection against common web vulnerabilities."*

### Q3: "How will the system perform if the portfolio grows to 500+ or 1,000+ websites?"
* **Answer:** *"We designed the database schema with performance indexes on `is_archived`, `client_id`, `website_name`, and `technology`. Furthermore, queries utilize pagination and the frontend uses debounced inputs, ensuring search and filtering respond in under 1 second even at 1,000 records."*

### Q4: "Why did you use PostgreSQL rather than MongoDB/NoSQL?"
* **Answer:** *"The data in WebWatch 360 is inherently relational — a Client has multiple Websites, and each Website has 1-to-1 relations with Hosting, Domains, SSL, and 1-to-many relations with Maintenance Logs and Credentials. PostgreSQL provides ACID compliance, strong foreign key constraints, and relational integrity."*

---
