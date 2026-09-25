import bcrypt from 'bcryptjs';
import pg from 'pg';
import { env } from '../../config/env.js';
import { encrypt } from '../../utils/crypto.js';

const { Client } = pg;

// Helper to format date offset from today
function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function seed() {
  const client = new Client({ connectionString: env.DB.url });

  try {
    console.log(`[Seeder] Connecting to database "${env.DB.database}"...`);
    await client.connect();

    console.log('[Seeder] Cleaning existing tables for clean seed...');
    await client.query(`
      TRUNCATE TABLE 
        notifications, 
        maintenance_logs, 
        credentials, 
        email_cdn_details, 
        ssl_details, 
        domain_details, 
        hosting_details, 
        websites, 
        clients, 
        users 
      RESTART IDENTITY CASCADE
    `);

    // 1. Seed Admin User
    console.log('[Seeder] Creating Admin user...');
    const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
    const adminUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      ['Developer Admin', 'admin@webwatch360.com', adminPasswordHash]
    );
    console.log(`[Seeder] Admin created: ${adminUserRes.rows[0].email} (Password: Admin@123456)`);

    // 2. Seed Clients
    console.log('[Seeder] Creating Clients...');
    const client1 = await client.query(
      `INSERT INTO clients (name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Acme Enterprises', 'contact@acme.com', '+1 (555) 234-5678', 'Acme Corp Inc.', 'Enterprise client with 2 active retainers']
    );

    const client2 = await client.query(
      `INSERT INTO clients (name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Apex Retailers Ltd', 'support@apexretail.co.uk', '+44 20 7946 0912', 'Apex Retail UK', 'E-commerce retail fashion store']
    );

    const client3 = await client.query(
      `INSERT INTO clients (name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['TechNova Solutions', 'admin@technova.io', '+1 (415) 555-2671', 'TechNova Labs', 'SaaS platform and developer tool']
    );

    const client4 = await client.query(
      `INSERT INTO clients (name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Dr. Sarah Wellness', 'info@drsarahwellness.com', '+1 (800) 555-0144', 'Wellness Clinic', 'Medical appointment booking site']
    );

    const c1Id = client1.rows[0].id;
    const c2Id = client2.rows[0].id;
    const c3Id = client3.rows[0].id;
    const c4Id = client4.rows[0].id;

    // 3. Seed Websites
    console.log('[Seeder] Creating Websites & Expiry Details...');

    // Site 1: Safe Status (> 30 days)
    const site1Res = await client.query(
      `INSERT INTO websites (
        client_id, website_name, website_url, technology, hosting_provider, domain_provider,
        date_built, support_plan, priority, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        c1Id,
        'Acme Corporate Portal',
        'https://acme-corp.com',
        'WordPress',
        'SiteGround',
        'Namecheap',
        '2023-01-15',
        'Standard Maintenance',
        'High',
        ['Enterprise', 'B2B', 'WordPress'],
        'Main corporate website with WooCommerce portal.',
      ]
    );
    const site1Id = site1Res.rows[0].id;

    await client.query(
      `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [site1Id, 'SiteGround', 'GoGeek Managed WP', getDateOffset(90), 240.0, true]
    );
    await client.query(
      `INSERT INTO domain_details (website_id, registrar, expiry_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site1Id, 'Namecheap', getDateOffset(120), 18.0, true]
    );
    await client.query(
      `INSERT INTO ssl_details (website_id, issuer, expiry_date, ssl_type, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site1Id, "Let's Encrypt", getDateOffset(60), 'Wildcard SSL', true]
    );
    await client.query(
      `INSERT INTO email_cdn_details (website_id, email_provider, email_expiry_date, cdn_provider, cdn_expiry_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [site1Id, 'Google Workspace', getDateOffset(180), 'Cloudflare Pro', getDateOffset(90)]
    );

    // Site 2: Expiring Soon (Warning, <= 30 days)
    const site2Res = await client.query(
      `INSERT INTO websites (
        client_id, website_name, website_url, technology, hosting_provider, domain_provider,
        date_built, support_plan, priority, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        c2Id,
        'Apex Luxury Fashion',
        'https://apexretail.co.uk',
        'Shopify',
        'Shopify Plus',
        'GoDaddy',
        '2024-03-10',
        'Premium 24/7',
        'Critical',
        ['E-Commerce', 'Shopify', 'High Revenue'],
        'Flagship UK luxury store. Needs immediate renewal reminder.',
      ]
    );
    const site2Id = site2Res.rows[0].id;

    await client.query(
      `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [site2Id, 'Shopify Plus', 'Annual Shopify Plus', getDateOffset(15), 2000.0, false]
    );
    await client.query(
      `INSERT INTO domain_details (website_id, registrar, expiry_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site2Id, 'GoDaddy', getDateOffset(20), 45.0, false]
    );
    await client.query(
      `INSERT INTO ssl_details (website_id, issuer, expiry_date, ssl_type, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site2Id, 'Cloudflare SSL', getDateOffset(15), 'Managed SSL', true]
    );
    await client.query(
      `INSERT INTO email_cdn_details (website_id, email_provider, email_expiry_date, cdn_provider, cdn_expiry_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [site2Id, 'Microsoft 365', getDateOffset(15), 'Fastly', getDateOffset(15)]
    );

    // Site 3: Expired SSL (Critical / Expired Status)
    const site3Res = await client.query(
      `INSERT INTO websites (
        client_id, website_name, website_url, technology, hosting_provider, domain_provider,
        date_built, support_plan, priority, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        c3Id,
        'TechNova SaaS Platform',
        'https://technova.io',
        'React',
        'AWS EC2 / RDS',
        'AWS Route53',
        '2022-08-01',
        'Premium 24/7',
        'Critical',
        ['SaaS', 'React', 'Node.js', 'AWS'],
        'Custom web application. SSL expired 3 days ago!',
      ]
    );
    const site3Id = site3Res.rows[0].id;

    await client.query(
      `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [site3Id, 'AWS EC2', 't3.xlarge Instance', getDateOffset(120), 350.0, true]
    );
    await client.query(
      `INSERT INTO domain_details (website_id, registrar, expiry_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site3Id, 'AWS Route53', getDateOffset(200), 14.0, true]
    );
    await client.query(
      `INSERT INTO ssl_details (website_id, issuer, expiry_date, ssl_type, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site3Id, 'DigiCert EV', getDateOffset(-3), 'EV SSL', false] // Expired 3 days ago
    );
    await client.query(
      `INSERT INTO email_cdn_details (website_id, email_provider, email_expiry_date, cdn_provider, cdn_expiry_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [site3Id, 'SendGrid / GSuite', getDateOffset(90), 'AWS CloudFront', getDateOffset(120)]
    );

    // Site 4: Safe Hosting & Custom Tech
    const site4Res = await client.query(
      `INSERT INTO websites (
        client_id, website_name, website_url, technology, hosting_provider, domain_provider,
        date_built, support_plan, priority, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        c4Id,
        'Dr. Sarah Clinic & Appointments',
        'https://drsarahwellness.com',
        'Laravel',
        'DigitalOcean',
        'Porkbun',
        '2023-11-20',
        'Basic Monthly',
        'Medium',
        ['Healthcare', 'Laravel', 'Bookings'],
        'Patient booking portal with HIPAA compliant records.',
      ]
    );
    const site4Id = site4Res.rows[0].id;

    await client.query(
      `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [site4Id, 'DigitalOcean', 'Standard Droplet 4GB', getDateOffset(45), 24.0, true]
    );
    await client.query(
      `INSERT INTO domain_details (website_id, registrar, expiry_date, cost, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site4Id, 'Porkbun', getDateOffset(180), 10.5, true]
    );
    await client.query(
      `INSERT INTO ssl_details (website_id, issuer, expiry_date, ssl_type, auto_renew)
       VALUES ($1, $2, $3, $4, $5)`,
      [site4Id, "Let's Encrypt", getDateOffset(40), 'Auto SSL', true]
    );

    // Site 5: Archived Website (Soft-Deleted)
    const site5Res = await client.query(
      `INSERT INTO websites (
        client_id, website_name, website_url, technology, hosting_provider, domain_provider,
        date_built, support_plan, priority, tags, notes, is_archived, archived_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, CURRENT_TIMESTAMP) RETURNING id`,
      [
        c1Id,
        'Acme Black Friday 2024 Campaign',
        'https://promo2024.acme-corp.com',
        'HTML/Static',
        'Vercel',
        'Namecheap Subdomain',
        '2024-11-01',
        'None',
        'Low',
        ['Campaign', 'Seasonal'],
        'Archived past promo campaign site. Kept for historical records.',
      ]
    );
    const site5Id = site5Res.rows[0].id;

    await client.query(
      `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date)
       VALUES ($1, $2, $3, $4)`,
      [site5Id, 'Vercel', 'Hobby Static', getDateOffset(300)]
    );

    // 4. Seed Credentials (AES-256 Encrypted Vault)
    console.log('[Seeder] Creating AES-256 Encrypted Vault Credentials...');
    const cred1 = encrypt('Acme@SiteGround#2026!');
    await client.query(
      `INSERT INTO credentials (
        website_id, service_type, username, encrypted_password, iv, auth_tag, login_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        site1Id,
        'Hosting cPanel/DirectAdmin',
        'acme_admin_sg',
        cred1.encryptedPassword,
        cred1.iv,
        cred1.authTag,
        'https://my.siteground.com',
        'Main SiteGround server management console',
      ]
    );

    const cred2 = encrypt('Wp#AcmeSecureMaster99');
    await client.query(
      `INSERT INTO credentials (
        website_id, service_type, username, encrypted_password, iv, auth_tag, login_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        site1Id,
        'WordPress / CMS Admin',
        'superadmin',
        cred2.encryptedPassword,
        cred2.iv,
        cred2.authTag,
        'https://acme-corp.com/wp-admin',
        'Primary WordPress administrator account',
      ]
    );

    const cred3 = encrypt('ShopifyApex#Secret2026');
    await client.query(
      `INSERT INTO credentials (
        website_id, service_type, username, encrypted_password, iv, auth_tag, login_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        site2Id,
        'WordPress / CMS Admin',
        'lead_dev@apexretail.co.uk',
        cred3.encryptedPassword,
        cred3.iv,
        cred3.authTag,
        'https://apexretail.myshopify.com/admin',
        'Shopify Plus staff developer account',
      ]
    );

    // 5. Seed Maintenance Logs
    console.log('[Seeder] Creating Maintenance Logs...');
    await client.query(
      `INSERT INTO maintenance_logs (website_id, task_name, notes, performed_by, performed_at)
       VALUES 
        ($1, 'Full Site Backup Completed', 'Backup stored in secure offsite AWS S3 bucket (2.4 GB).', 'Admin', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        ($1, 'Core, Themes & Plugins Updated', 'Updated WooCommerce 8.6 -> 8.8, Elementor Pro, and Yoast SEO.', 'Admin', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        ($1, 'Malware & Security Scan Completed', 'Wordfence scan clean: 0 vulnerabilities found.', 'Admin', CURRENT_TIMESTAMP - INTERVAL '5 days'),
        ($2, 'Speed & Performance Optimized', 'Converted product hero banners to WebP; PageSpeed score improved to 94.', 'Admin', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        ($3, 'Full Site Backup Completed', 'PostgreSQL database snapshot taken prior to scheduled SSL maintenance.', 'Admin', CURRENT_TIMESTAMP - INTERVAL '4 hours')`,
      [site1Id, site2Id, site3Id]
    );

    // 6. Seed Notifications
    console.log('[Seeder] Creating Reminder Notifications...');
    await client.query(
      `INSERT INTO notifications (website_id, service_type, title, message, target_date, is_read, delivery_status)
       VALUES 
        ($1, 'ssl', 'SSL Expired Alert', 'DigiCert EV SSL certificate for TechNova SaaS Platform expired 3 days ago!', CURRENT_DATE - 3, FALSE, 'delivered'),
        ($2, 'hosting', 'Hosting Expiring Soon (15 Days)', 'Shopify Plus hosting renewal for Apex Luxury Fashion is due in 15 days.', CURRENT_DATE + 15, FALSE, 'delivered'),
        ($2, 'domain', 'Domain Expiring Soon (20 Days)', 'GoDaddy domain apexretail.co.uk is due for renewal in 20 days.', CURRENT_DATE + 20, TRUE, 'delivered')`,
      [site3Id, site2Id]
    );

    console.log('----------------------------------------------------');
    console.log('✅ Database Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Login Credentials:');
    console.log('  Email:    admin@webwatch360.com');
    console.log('  Password: Admin@123456');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
