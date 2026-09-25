-- WebWatch 360 - Complete Relational MySQL Schema

-- 1. Users Table (Single Admin User)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  company VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Websites Table (with Soft-Delete / Archive support)
CREATE TABLE IF NOT EXISTS websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  website_name VARCHAR(150) NOT NULL,
  website_url VARCHAR(255) NOT NULL,
  technology VARCHAR(80) NOT NULL DEFAULT 'WordPress',
  hosting_provider VARCHAR(100),
  domain_provider VARCHAR(100),
  date_built DATE,
  support_plan VARCHAR(100) DEFAULT 'Basic Monthly',
  priority VARCHAR(20) DEFAULT 'Medium',
  tags JSON,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_websites_client_id (client_id),
  KEY idx_websites_is_archived (is_archived),
  CONSTRAINT fk_websites_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- 4. Hosting Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS hosting_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT UNIQUE NOT NULL,
  provider VARCHAR(100),
  plan_name VARCHAR(100),
  renewal_date DATE,
  cost DECIMAL(10, 2) DEFAULT 0.00,
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_hosting_renewal (renewal_date),
  CONSTRAINT fk_hosting_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 5. Domain Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS domain_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT UNIQUE NOT NULL,
  registrar VARCHAR(100),
  expiry_date DATE,
  cost DECIMAL(10, 2) DEFAULT 0.00,
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_domain_expiry (expiry_date),
  CONSTRAINT fk_domain_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 6. SSL Certificate Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS ssl_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT UNIQUE NOT NULL,
  issuer VARCHAR(100),
  expiry_date DATE,
  ssl_type VARCHAR(50) DEFAULT 'Let''s Encrypt / Auto SSL',
  auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ssl_expiry (expiry_date),
  CONSTRAINT fk_ssl_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 7. Business Email & CDN Details Table (1-to-1 with website)
CREATE TABLE IF NOT EXISTS email_cdn_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT UNIQUE NOT NULL,
  email_provider VARCHAR(100),
  email_expiry_date DATE,
  cdn_provider VARCHAR(100),
  cdn_expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email_expiry (email_expiry_date),
  KEY idx_cdn_expiry (cdn_expiry_date),
  CONSTRAINT fk_emailcdn_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 8. Credentials Vault Table (Encrypted at Rest with AES-256-GCM)
CREATE TABLE IF NOT EXISTS credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  username VARCHAR(150) NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv VARCHAR(64) NOT NULL,
  auth_tag VARCHAR(64) NOT NULL,
  login_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_credentials_website (website_id),
  CONSTRAINT fk_credentials_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 9. Maintenance Logs Table (Timestamped history)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT NOT NULL,
  task_name VARCHAR(150) NOT NULL,
  notes TEXT,
  performed_by VARCHAR(100) DEFAULT 'Admin',
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_maintenance_logs_site (website_id),
  CONSTRAINT fk_maintenance_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

-- 10. Notifications & Reminders Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT,
  service_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target_date DATE,
  is_read BOOLEAN DEFAULT FALSE,
  delivery_status VARCHAR(50) DEFAULT 'delivered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_site (website_id),
  CONSTRAINT fk_notifications_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);


