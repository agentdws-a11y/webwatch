import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// Initialize PostgreSQL Pool
export const pool = new Pool({
  connectionString: env.DB.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL Query
 * @param {Array} params - Query parameters
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
      // Query logged without sensitive parameters
      // console.log(`[DB] Executed query in ${duration}ms, rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Error] Query failed: ${text}\nMessage: ${error.message}`);
    throw error;
  }
};

/**
 * Transaction helper
 * @param {Function} callback - Function receiving the client
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { pool, query, transaction };
