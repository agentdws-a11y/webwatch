import app from './app.js';
import { env } from './config/env.js';
import { pool } from './database/connection.js';

async function startServer() {
  try {
    // Verify PostgreSQL connection
    const client = await pool.connect();
    const dbRes = await client.query('SELECT current_database(), current_user, version()');
    client.release();

    console.log('----------------------------------------------------');
    console.log(`[Database] Connected successfully to PostgreSQL!`);
    console.log(`[Database] DB Name: ${dbRes.rows[0].current_database} | User: ${dbRes.rows[0].current_user}`);
    console.log('----------------------------------------------------');

    app.listen(env.PORT, () => {
      console.log(`🚀 WebWatch 360 Backend is running on: http://localhost:${env.PORT}`);
      console.log(`📡 API Base: http://localhost:${env.PORT}/api`);
      console.log(`🩺 Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`🛡️  Environment: ${env.NODE_ENV}`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Failed to connect to database or start server:');
    console.error(error.message);
    console.log('\nTip: Make sure PostgreSQL service is running and database is migrated:');
    console.log('     npm run db:migrate && npm run db:seed\n');
    process.exit(1);
  }
}

startServer();
