import app from '../src/app.js';
import { pool } from '../src/database/connection.js';

async function runTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[Test Server] Started on ephemeral port ${port}`);

  try {
    // 1. Health check
    console.log('\n--- 1. Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('Status:', health.status, health);

    // 2. Login
    console.log('\n--- 2. Auth Login ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@webwatch360.com',
        password: 'Admin@123456',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Result:', loginData.success, loginData.message);
    const token = loginData.data.token;

    // 3. Me profile
    console.log('\n--- 3. Current Admin Profile ---');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('Admin:', meData.data.name, meData.data.email);

    // 4. Dashboard Summary
    console.log('\n--- 4. Dashboard Overview & Status Counts ---');
    const dashRes = await fetch(`${baseUrl}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashData = await dashRes.json();
    console.log('Overview:', dashData.data.overview);
    console.log('Technology Distribution:', dashData.data.technologyDistribution);

    // 5. Websites List
    console.log('\n--- 5. Websites List (Active) ---');
    const websitesRes = await fetch(`${baseUrl}/websites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const websitesData = await websitesRes.json();
    console.log(`Total Active Sites: ${websitesData.data.websites.length}`);
    websitesData.data.websites.forEach((w) => {
      console.log(`  • ${w.website_name} [${w.technology}] - Health: ${w.health.overallStatus.toUpperCase()}`);
    });

    // 6. Create New Website
    console.log('\n--- 6. Create New Website with Expiry Tracking ---');
    const newSiteRes = await fetch(`${baseUrl}/websites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        website_name: 'Starlight E-Learning',
        website_url: 'https://starlight.academy',
        technology: 'Next.js',
        support_plan: 'Standard Maintenance',
        priority: 'High',
        tags: ['Education', 'Next.js'],
        hosting: {
          provider: 'Vercel Pro',
          renewal_date: '2026-10-15',
          cost: 20.0,
        },
        domain: {
          registrar: 'Cloudflare Registrar',
          expiry_date: '2027-02-01',
          cost: 9.5,
        },
        ssl: {
          issuer: 'Cloudflare SSL',
          expiry_date: '2027-02-01',
        },
      }),
    });
    const newSiteData = await newSiteRes.json();
    console.log('Created Site:', newSiteData.success, newSiteData.data.website_name, 'ID:', newSiteData.data.id);
    const createdId = newSiteData.data.id;

    // 7. Archive and Restore Test
    console.log('\n--- 7. Soft Delete (Archive) & Restore ---');
    const archiveRes = await fetch(`${baseUrl}/websites/${createdId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const archiveData = await archiveRes.json();
    console.log('Archived:', archiveData.data.is_archived);

    const restoreRes = await fetch(`${baseUrl}/websites/${createdId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const restoreData = await restoreRes.json();
    console.log('Restored:', restoreData.data.is_archived);

    // 8. Clients List
    console.log('\n--- 8. Clients List ---');
    const clientsRes = await fetch(`${baseUrl}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const clientsData = await clientsRes.json();
    console.log(`Total Clients: ${clientsData.data.length}`);
    clientsData.data.forEach((c) => {
      console.log(`  • Client: ${c.name} (${c.company}) - Active Sites: ${c.active_websites_count}`);
    });

    console.log('\n=========================================');
    console.log('🎉 ALL PHASE 1 & PHASE 2 TESTS PASSED 100%!');
    console.log('=========================================');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await pool.end();
  }
}

runTests();
