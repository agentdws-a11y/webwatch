# WebWatch 360 — REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Authentication:** `Authorization: Bearer <jwt_token>` (Required on all private routes)

---

## 🔐 1. Authentication Module (Phase 1)

### Login Admin
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@webwatch360.com",
    "password": "Admin@123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@webwatch360.com",
      "name": "Lead Developer"
    }
  }
  ```

### Get Current Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private
- **Response (200 OK):** Returns authenticated user profile.

---

## 🌐 2. Websites Management Module (Phase 2)

### List Websites (with Search, Filter & Sort)
- **Endpoint:** `GET /api/websites`
- **Access:** Private
- **Query Parameters:**
  - `search` (string): Search across `website_name`, `client_name`, `website_url`.
  - `technology` (string): Filter by tech stack (e.g. `WordPress`, `Shopify`, `React`).
  - `client_id` (number): Filter by client ID.
  - `is_archived` (boolean): `false` for active sites (default), `true` for archived vault.
  - `sort_by` (string): `name`, `date_built`, `created_at`.
  - `sort_order` (string): `ASC` or `DESC`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "total": 6,
    "websites": [
      {
        "id": 1,
        "website_name": "Apex Law Group",
        "website_url": "https://apexlaw.com",
        "technology": "WordPress",
        "date_built": "2023-01-15",
        "support_plan": "Monthly Retainer",
        "priority": "High",
        "is_archived": false,
        "client": {
          "id": 1,
          "name": "Apex Legal LLP"
        },
        "health": {
          "overallStatus": "safe",
          "nearestExpiry": { "service": "SSL", "daysRemaining": 85 }
        }
      }
    ]
  }
  ```

### Create Website
- **Endpoint:** `POST /api/websites`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "client_id": 1,
    "website_name": "Nordic Fitness Club",
    "website_url": "https://nordicfit.io",
    "technology": "React",
    "date_built": "2024-02-10",
    "support_plan": "Quarterly Check",
    "priority": "Medium",
    "hosting": {
      "provider": "AWS Lightsail",
      "plan": "Standard",
      "renewal_date": "2026-11-01"
    },
    "domain": {
      "registrar": "Namecheap",
      "expiry_date": "2026-09-15"
    },
    "ssl": {
      "issuer": "Let's Encrypt",
      "expiry_date": "2026-09-01"
    }
  }
  ```
- **Response (201 Created):** Returns created website object with nested IDs.

### Get Website Details
- **Endpoint:** `GET /api/websites/:id`
- **Access:** Private
- **Response (200 OK):** Returns full website record including client info, hosting, domain, SSL, email/CDN, and recent maintenance logs.

### Update Website
- **Endpoint:** `PUT /api/websites/:id`
- **Access:** Private
- **Request Body:** Partial or full website fields to update.

### Soft-Delete (Archive) Website
- **Endpoint:** `PATCH /api/websites/:id/archive`
- **Access:** Private
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Website successfully moved to Archive Vault"
  }
  ```

### Restore Archived Website
- **Endpoint:** `PATCH /api/websites/:id/restore`
- **Access:** Private
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Website successfully restored to active portfolio"
  }
  ```

### Permanent Delete
- **Endpoint:** `DELETE /api/websites/:id`
- **Access:** Private
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Website and associated records permanently deleted"
  }
  ```

---

## 👥 3. Clients Module (Phase 2)

### List Clients
- **Endpoint:** `GET /api/clients`
- **Access:** Private
- **Response (200 OK):** Returns list of clients with `websiteCount`.

### Create Client
- **Endpoint:** `POST /api/clients`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "name": "Horizon Retailers",
    "email": "contact@horizonretail.com",
    "phone": "+1 555-0199",
    "company": "Horizon LLC"
  }
  ```

---

## 📊 4. Dashboard Summary Module

### Get Portfolio KPI Summary
- **Endpoint:** `GET /api/dashboard/summary`
- **Access:** Private
- **Response (200 OK):** Aggregate numbers for total websites, archived count, safe count, expiring soon count, overdue count, and technology distribution.
