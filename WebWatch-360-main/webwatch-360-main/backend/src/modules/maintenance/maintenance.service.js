import { query } from '../../database/connection.js';

export class MaintenanceService {
  /**
   * Get maintenance logs with optional website filtering
   */
  static async getLogs(filters = {}) {
    const { website_id, limit = 50, page = 1 } = filters;
    let sql = `
      SELECT 
        m.id,
        m.website_id,
        m.task_name,
        m.notes,
        m.performed_by,
        m.performed_at,
        m.created_at,
        w.website_name,
        w.website_url,
        w.technology,
        c.name AS client_name
      FROM maintenance_logs m
      JOIN websites w ON m.website_id = w.id
      LEFT JOIN clients c ON w.client_id = c.id
    `;
    const params = [];

    if (website_id) {
      sql += ` WHERE m.website_id = ?`;
      params.push(website_id);
    }

    sql += ` ORDER BY m.performed_at DESC LIMIT ? OFFSET ?`;
    const limitNum = parseInt(limit, 10) || 50;
    const pageNum = parseInt(page, 10) || 1;
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) AS total FROM maintenance_logs`;
    const countParams = [];
    if (website_id) {
      countSql += ` WHERE website_id = ?`;
      countParams.push(website_id);
    }
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    return {
      logs: result.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Log a new maintenance task
   */
  static async createLog({ website_id, task_name, notes, performed_by = 'Admin', performed_at }) {
    if (!website_id || !task_name) {
      throw new Error('Website ID and task name are required.');
    }

    const timestamp = performed_at ? new Date(performed_at) : new Date();

    const insertResult = await query(
      `INSERT INTO maintenance_logs (website_id, task_name, notes, performed_by, performed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [website_id, task_name, notes || null, performed_by || 'Admin', timestamp]
    );

    const created = await query(
      `SELECT m.*, w.website_name, w.technology 
       FROM maintenance_logs m 
       JOIN websites w ON m.website_id = w.id 
       WHERE m.id = ?`,
      [insertResult.insertId]
    );

    return created.rows[0];
  }

  /**
   * Delete maintenance log
   */
  static async deleteLog(id) {
    const existing = await query(`SELECT id FROM maintenance_logs WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Maintenance log not found.');
    }
    await query(`DELETE FROM maintenance_logs WHERE id = ?`, [id]);
    return true;
  }
}

export default MaintenanceService;
