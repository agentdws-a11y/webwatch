import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDatabaseExists() {
  const adminConnection = await mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
  });

  try {
    console.log(`[DB] Ensuring database "${env.DB.database}" exists...`);
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB.database}\``);
    console.log(`[DB] Database "${env.DB.database}" ready.`);
  } finally {
    await adminConnection.end();
  }
}

async function runMigrations() {
  await ensureDatabaseExists();

  const connection = await mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.database,
    multipleStatements: true,
  });

  try {
    console.log(`[Migration] Connecting to "${env.DB.database}"...`);

    const sqlPath = path.resolve(__dirname, 'migrations/001_initial_schema_mysql.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`[Migration] Executing 001_initial_schema_mysql.sql...`);
    await connection.query(sql);

    console.log(`[Migration] All tables and indexes migrated successfully!`);
  } catch (error) {
    console.error(`[Migration Error] Migration failed:`, error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
