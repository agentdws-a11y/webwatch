import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

// Initialize MySQL Connection Pool
export const pool = mysql.createPool({
  host: env.DB.host,
  port: env.DB.port,
  user: env.DB.user,
  password: env.DB.password,
  database: env.DB.database,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

/**
 * Execute a query with parameters
 * Mimics the pg-style return shape: { rows, rowCount }
 * @param {string} text - SQL Query (use ? placeholders)
 * @param {Array} params - Query parameters
 */
export const query = async (text, params = []) => {
  try {
    const [rows] = await pool.query(text, params);
    // Normalize shape so existing code using res.rows / res.rowCount keeps working
    const normalizedRows = Array.isArray(rows) ? rows : [];
    return {
      rows: normalizedRows,
      rowCount: Array.isArray(rows) ? rows.length : (rows?.affectedRows ?? 0),
      insertId: rows?.insertId,
      affectedRows: rows?.affectedRows,
    };
  } catch (error) {
    console.error(`[DB Error] Query failed: ${text}\nMessage: ${error.message}`);
    throw error;
  }
};

/**
 * Transaction helper
 * @param {Function} callback - Function receiving the client (connection)
 */
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Wrap connection.query to normalize its return shape too
    const client = {
      query: async (text, params = []) => {
        const [rows] = await connection.query(text, params);
        const normalizedRows = Array.isArray(rows) ? rows : [];
        return {
          rows: normalizedRows,
          rowCount: Array.isArray(rows) ? rows.length : (rows?.affectedRows ?? 0),
          insertId: rows?.insertId,
          affectedRows: rows?.affectedRows,
        };
      },
    };

    const result = await callback(client);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default { pool, query, transaction };
