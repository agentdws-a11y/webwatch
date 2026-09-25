import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: 'postgres', // connect to default postgres db first
  });

  try {
    await adminClient.connect();
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [env.DB.database]
    );

    if (checkDb.rowCount === 0) {
      console.log(`[DB] Database "${env.DB.database}" does not exist. Creating...`);
      // Escape identifier safely
      await adminClient.query(`CREATE DATABASE "${env.DB.database}"`);
      console.log(`[DB] Database "${env.DB.database}" created successfully.`);
    } else {
      console.log(`[DB] Database "${env.DB.database}" already exists.`);
    }
  } catch (error) {
    console.error(`[DB Setup Warning] Could not verify/create DB via admin connection:`, error.message);
  } finally {
    await adminClient.end();
  }
}

async function runMigrations() {
  await ensureDatabaseExists();

  const appClient = new Client({
    connectionString: env.DB.url,
  });

  try {
    console.log(`[Migration] Connecting to "${env.DB.database}"...`);
    await appClient.connect();

    const sqlPath = path.resolve(__dirname, 'migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`[Migration] Executing 001_initial_schema.sql...`);
    await appClient.query(sql);

    console.log(`[Migration] All tables and indexes migrated successfully!`);
  } catch (error) {
    console.error(`[Migration Error] Migration failed:`, error);
    process.exit(1);
  } finally {
    await appClient.end();
  }
}

runMigrations();
