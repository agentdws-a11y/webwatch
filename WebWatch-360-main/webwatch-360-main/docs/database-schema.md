# WebWatch 360 — Relational Database Schema

**Engine:** PostgreSQL 16+  
**Architecture:** Relational with Foreign Key Constraints & Cascade Operations

---

## 🗄️ Relational Entity-Relationship Diagram

```text
  ┌──────────────┐
  │    users     │
  └──────────────┘
  
  ┌──────────────┐          1 : N         ┌────────────────────────┐
  │   clients    │ ◄──────────────────────┤        websites        │
  └──────────────┘                        └───────────┬────────────┘
                                                      │
         ┌──────────────────┬─────────────────┬───────┴──────────┬──────────────────┐
         │ 1 : 1            │ 1 : 1           │ 1 : 1            │ 1 : N            │ 1 : N
         ▼                  ▼                 ▼                  ▼                  ▼
┌─────────────────┐┌─────────────────┐┌────────────────┐┌─────────────────┐┌───────────────────┐
│ hosting_details ││ domain_details  ││  ssl_details   ││ maintenance_logs││   credentials     │
└─────────────────┘└─────────────────┘└────────────────┘└─────────────────┘│  (AES-256 Vault)   │
                                                                           └───────────────────┘
```

---

## 📋 Table Definitions

### 1. `users` (Admin Authentication)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique Admin ID |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Admin email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Salted bcrypt hash |
| `name` | `VARCHAR(100)` | `NOT NULL` | Developer name |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record timestamp |

---

### 2. `clients` (Client Contact Records)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Client ID |
| `name` | `VARCHAR(150)` | `NOT NULL` | Client / Contact Person |
| `email` | `VARCHAR(255)` | `NULL` | Email address |
| `phone` | `VARCHAR(50)` | `NULL` | Phone number |
| `company` | `VARCHAR(150)` | `NULL` | Business organization |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation timestamp |

---

### 3. `websites` (Core Portfolio Entity)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Website ID |
| `client_id` | `INTEGER` | `REFERENCES clients(id) ON DELETE SET NULL` | Linked Client |
| `website_name` | `VARCHAR(200)` | `NOT NULL` | Friendly site title |
| `website_url` | `VARCHAR(255)` | `NOT NULL` | Live website URL |
| `technology` | `VARCHAR(100)` | `NOT NULL` | WordPress, Shopify, React, Laravel, etc. |
| `date_built` | `DATE` | `NULL` | Launch date / project age |
| `support_plan` | `VARCHAR(100)` | `NULL` | Retainer / Ad-hoc / SLA |
| `priority` | `VARCHAR(50)` | `DEFAULT 'Medium'` | High, Medium, Low |
| `tags` | `TEXT[]` | `DEFAULT '{}'` | Array of custom search labels |
| `is_archived` | `BOOLEAN` | `DEFAULT FALSE` | Soft-delete state flag |
| `archived_at` | `TIMESTAMP` | `NULL` | When site was moved to archive |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Entry timestamp |

---

### 4. `hosting_details` (Hosting Expiry & Plan)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique ID |
| `website_id` | `INTEGER` | `REFERENCES websites(id) ON DELETE CASCADE` | 1-to-1 link to website |
| `provider` | `VARCHAR(150)` | `NULL` | AWS, Hostinger, DigitalOcean, SiteGround |
| `plan_name` | `VARCHAR(100)` | `NULL` | Shared, VPS, Dedicated, Cloud |
| `renewal_date` | `DATE` | `NULL` | Next hosting renewal deadline |
| `cost` | `NUMERIC(10, 2)` | `NULL` | Renewal price in local currency |

---

### 5. `domain_details` (Registrar & Domain Expiry)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique ID |
| `website_id` | `INTEGER` | `REFERENCES websites(id) ON DELETE CASCADE` | 1-to-1 link to website |
| `registrar` | `VARCHAR(150)` | `NULL` | Namecheap, GoDaddy, Cloudflare |
| `expiry_date` | `DATE` | `NULL` | Domain expiration deadline |
| `auto_renew` | `BOOLEAN` | `DEFAULT FALSE` | Auto-renewal enabled flag |

---

### 6. `ssl_details` (Certificate Authority & Expiry)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique ID |
| `website_id` | `INTEGER` | `REFERENCES websites(id) ON DELETE CASCADE` | 1-to-1 link to website |
| `issuer` | `VARCHAR(150)` | `NULL` | Let's Encrypt, Sectigo, DigiCert |
| `expiry_date` | `DATE` | `NULL` | SSL certificate expiry date |
| `ssl_type` | `VARCHAR(50)` | `DEFAULT 'DV'` | DV, OV, EV, Wildcard |

---

### 7. `credentials` (Encrypted Vault at Rest)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Vault entry ID |
| `website_id` | `INTEGER` | `REFERENCES websites(id) ON DELETE CASCADE` | Linked website |
| `service_type` | `VARCHAR(100)` | `NOT NULL` | cPanel, WordPress Admin, SFTP, DNS |
| `username` | `VARCHAR(255)` | `NOT NULL` | Plaintext login identifier |
| `encrypted_password` | `TEXT` | `NOT NULL` | AES-256-GCM cipher hex |
| `iv` | `VARCHAR(64)` | `NOT NULL` | Unique 16-byte initialization vector |
| `auth_tag` | `VARCHAR(64)` | `NOT NULL` | 16-byte GCM authentication tag |

---

## ⚡ Indexing Strategy for Fast Performance

```sql
CREATE INDEX idx_websites_is_archived ON websites(is_archived);
CREATE INDEX idx_websites_client_id ON websites(client_id);
CREATE INDEX idx_websites_technology ON websites(technology);
CREATE INDEX idx_hosting_renewal_date ON hosting_details(renewal_date);
CREATE INDEX idx_domain_expiry_date ON domain_details(expiry_date);
CREATE INDEX idx_ssl_expiry_date ON ssl_details(expiry_date);
```
*(These B-Tree indexes ensure that multi-filtering and searches over 1,000+ records execute within `< 100ms`).*
