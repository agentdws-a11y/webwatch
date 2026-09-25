export const EXPIRY_STATUS = {
  SAFE: 'safe',         // > 30 days
  WARNING: 'warning',   // <= 30 days and >= 0 days (Expiring Soon)
  EXPIRED: 'expired',   // < 0 days
};

export const EXPIRY_THRESHOLDS = {
  WARNING_DAYS: 30,
  ALERT_INTERVALS: [30, 15, 7, 0],
};

export const SUPPORT_PLANS = {
  NONE: 'None',
  BASIC: 'Basic Monthly',
  STANDARD: 'Standard Maintenance',
  PREMIUM: 'Premium 24/7',
  CUSTOM: 'Custom Retainer',
};

export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const TECHNOLOGIES = [
  'WordPress',
  'Shopify',
  'React',
  'Next.js',
  'Laravel',
  'ASP.NET',
  'Vue.js',
  'Node.js',
  'Django',
  'PHP Custom',
  'HTML/Static',
  'Other',
];

export const SERVICE_TYPES = {
  DOMAIN: 'domain',
  HOSTING: 'hosting',
  SSL: 'ssl',
  EMAIL: 'business_email',
  CDN: 'cdn',
};

export const CREDENTIAL_TYPES = [
  'Hosting cPanel/DirectAdmin',
  'Domain Registrar',
  'WordPress / CMS Admin',
  'Database / phpMyAdmin',
  'FTP / SFTP',
  'SSH / Server Root',
  'CDN / Cloudflare',
  'Transactional Email',
  'Other',
];

export const DEFAULT_MAINTENANCE_TASKS = [
  'Full Site Backup Completed',
  'Core, Themes & Plugins Updated',
  'Malware & Security Scan Completed',
  'Speed & Performance Optimized',
  'Broken Links Checked & Fixed',
  'Database Tables Cleaned & Optimized',
  'Forms & Checkout Flow Verified',
  'SSL Certificate & HTTPS Checked',
];
