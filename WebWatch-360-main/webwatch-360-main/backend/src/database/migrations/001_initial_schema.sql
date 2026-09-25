-- WebWatch 360 - Complete Relational PostgreSQL Schema

-- 1. Users Table (Single Admin User)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  company VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Websites Table (with Soft-Delete / Archive support)
CREATE TABLE IF NOT EXISTS websites (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  website_name VARCHAR(150) NOT NULL,
  website_url VARCHAR(255) NOT NULL,
  technology VARCHAR(80) NOT NULL DEFAULT 'WordPress',
  hosting_provider VARCHAR(100),
  domain_provider VARCHAR(100),
  date_built DATE,
  support_plan VARCHAR(100) DEFAULT 'Basic Monthly',
  priority VARCHAR(20) DEFAULT 'Medium',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hosting Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS hosting_details (
  id SERIAL PRIMARY KEY,
  website_id INTEGER UNIQUE NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  provider VARCHAR(100),
  plan_name VARCHAR(100),
  renewal_date DATE,
  cost NUMERIC(10, 2) DEFAULT 0.00,
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Domain Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS domain_details (
  id SERIAL PRIMARY KEY,
  website_id INTEGER UNIQUE NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  registrar VARCHAR(100),
  expiry_date DATE,
  cost NUMERIC(10, 2) DEFAULT 0.00,
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SSL Certificate Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS ssl_details (
  id SERIAL PRIMARY KEY,
  website_id INTEGER UNIQUE NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  issuer VARCHAR(100),
  expiry_date DATE,
  ssl_type VARCHAR(50) DEFAULT 'Let''s Encrypt / Auto SSL',
  auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Business Email & CDN Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS email_cdn_details (
  id SERIAL PRIMARY KEY,
  website_id INTEGER UNIQUE NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  email_provider VARCHAR(100),
  email_expiry_date DATE,
  cdn_provider VARCHAR(100),
  cdn_expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Credentials Vault Table (Encrypted at Rest with AES-256-GCM)
CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  username VARCHAR(150) NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv VARCHAR(64) NOT NULL,
  auth_tag VARCHAR(64) NOT NULL,
  login_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Maintenance Logs Table (Timestamped history)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  task_name VARCHAR(150) NOT NULL,
  notes TEXT,
  performed_by VARCHAR(100) DEFAULT 'Admin',
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications & Reminders Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target_date DATE,
  is_read BOOLEAN DEFAULT FALSE,
  delivery_status VARCHAR(50) DEFAULT 'delivered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid search and expiry filtering performance
CREATE INDEX IF NOT EXISTS idx_websites_client_id ON websites(client_id);
CREATE INDEX IF NOT EXISTS idx_websites_is_archived ON websites(is_archived);
CREATE INDEX IF NOT EXISTS idx_hosting_renewal ON hosting_details(renewal_date);
CREATE INDEX IF NOT EXISTS idx_domain_expiry ON domain_details(expiry_date);
CREATE INDEX IF NOT EXISTS idx_ssl_expiry ON ssl_details(expiry_date);
CREATE INDEX IF NOT EXISTS idx_email_expiry ON email_cdn_details(email_expiry_date);
CREATE INDEX IF NOT EXISTS idx_cdn_expiry ON email_cdn_details(cdn_expiry_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_site ON maintenance_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_notifications_site ON notifications(website_id);
