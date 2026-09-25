import { query } from '../../database/connection.js';

export class ClientsService {
  /**
   * Get all clients with their website counts
   */
  static async getAllClients(search = '') {
    let sql = `
      SELECT 
        c.*,
        COUNT(CASE WHEN w.is_archived = FALSE THEN 1 END) AS active_websites_count,
        COUNT(CASE WHEN w.is_archived = TRUE THEN 1 END) AS archived_websites_count
      FROM clients c
      LEFT JOIN websites w ON c.id = w.client_id
    `;
    const params = [];

    if (search) {
      sql += ` WHERE c.name ILIKE $1 OR c.company ILIKE $1 OR c.email ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.name ASC`;

    const result = await query(sql, params);
    return result.rows.map((row) => ({
      ...row,
      active_websites_count: parseInt(row.active_websites_count, 10),
      archived_websites_count: parseInt(row.archived_websites_count, 10),
    }));
  }

  /**
   * Get client by ID with list of their websites
   */
  static async getClientById(id) {
    const clientResult = await query(`SELECT * FROM clients WHERE id = $1`, [id]);
    if (clientResult.rowCount === 0) {
      throw new Error('Client not found.');
    }

    const client = clientResult.rows[0];

    const websitesResult = await query(
      `SELECT id, website_name, website_url, technology, support_plan, priority, is_archived, created_at 
       FROM websites WHERE client_id = $1 ORDER BY is_archived ASC, website_name ASC`,
      [id]
    );

    return {
      ...client,
      websites: websitesResult.rows,
    };
  }

  /**
   * Create a new client
   */
  static async createClient({ name, email, phone, company, notes }) {
    const result = await query(
      `INSERT INTO clients (name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email || null, phone || null, company || null, notes || null]
    );

    return result.rows[0];
  }

  /**
   * Update client details
   */
  static async updateClient(id, { name, email, phone, company, notes }) {
    const existing = await query(`SELECT id FROM clients WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Client not found.');
    }

    const result = await query(
      `UPDATE clients
       SET 
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         company = COALESCE($4, company),
         notes = COALESCE($5, notes),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, company, notes, id]
    );

    return result.rows[0];
  }

  /**
   * Delete client
   */
  static async deleteClient(id) {
    const result = await query(`DELETE FROM clients WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) {
      throw new Error('Client not found.');
    }
    return true;
  }
}

export default ClientsService;
