import app from './app.js';
import { env } from './config/env.js';
import { pool } from './database/connection.js';

async function startServer() {
  try {
    // Verify MySQL connection
    const connection = await pool.getConnection();
    const [dbRes] = await connection.query('SELECT DATABASE() AS current_db, USER() AS current_usr, VERSION() AS ver');
    connection.release();

    console.log('----------------------------------------------------');
    console.log(`[Database] Connected successfully to MySQL!`);
    console.log(`[Database] DB Name: ${dbRes[0]?.current_db} | User: ${dbRes[0]?.current_usr} | Version: ${dbRes[0]?.ver}`);
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
    console.log('\nTip: Make sure MySQL service is running and database is migrated:');
    console.log('     node src/database/migrate_mysql.js && node src/database/seeders/seed.js\n');
    process.exit(1);
  }
}

startServer();
