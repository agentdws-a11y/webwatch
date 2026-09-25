import { query } from '../../database/connection.js';
import { encrypt, decrypt } from '../../utils/crypto.js';

export class CredentialsService {
  /**
   * Get all credentials or filter by website_id
   * Decrypts passwords securely for the authenticated admin user
   */
  static async getCredentials(websiteId = null) {
    let sql = `
      SELECT 
        c.id,
        c.website_id,
        c.service_type,
        c.username,
        c.encrypted_password,
        c.iv,
        c.auth_tag,
        c.login_url,
        c.notes,
        c.created_at,
        c.updated_at,
        w.website_name,
        w.website_url,
        w.technology
      FROM credentials c
      JOIN websites w ON c.website_id = w.id
    `;
    const params = [];

    if (websiteId) {
      sql += ` WHERE c.website_id = ?`;
      params.push(websiteId);
    }

    sql += ` ORDER BY w.website_name ASC, c.service_type ASC`;

    const result = await query(sql, params);

    return result.rows.map((row) => {
      let plainPassword = '';
      try {
        plainPassword = decrypt(row.encrypted_password, row.iv, row.auth_tag);
      } catch (err) {
        console.error(`[Vault] Decryption failed for credential ID ${row.id}:`, err.message);
        plainPassword = '*** Decryption Error ***';
      }

      return {
        id: row.id,
        website_id: row.website_id,
        website_name: row.website_name,
        website_url: row.website_url,
        technology: row.technology,
        service_type: row.service_type,
        username: row.username,
        password: plainPassword, // Decrypted at runtime for admin view
        login_url: row.login_url,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
  }

  /**
   * Create a new credential with AES-256-GCM encryption at rest
   */
  static async createCredential({ website_id, service_type, username, password, login_url, notes }) {
    if (!website_id || !service_type || !username || !password) {
      throw new Error('Website ID, service type, username, and password are required.');
    }

    // Encrypt password using AES-256-GCM
    const { encryptedPassword, iv, authTag } = encrypt(password);

    const insertResult = await query(
      `INSERT INTO credentials (
        website_id, service_type, username, encrypted_password, iv, auth_tag, login_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        website_id,
        service_type,
        username,
        encryptedPassword,
        iv,
        authTag,
        login_url || null,
        notes || null,
      ]
    );

    return {
      id: insertResult.insertId,
      website_id,
      service_type,
      username,
      login_url,
      notes,
    };
  }

  /**
   * Update credential with optional password re-encryption
   */
  static async updateCredential(id, payload) {
    const existing = await query(`SELECT * FROM credentials WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Credential not found.');
    }

    const { website_id, service_type, username, password, login_url, notes } = payload;

    let encryptedPassword = existing.rows[0].encrypted_password;
    let iv = existing.rows[0].iv;
    let authTag = existing.rows[0].auth_tag;

    if (password) {
      const encrypted = encrypt(password);
      encryptedPassword = encrypted.encryptedPassword;
      iv = encrypted.iv;
      authTag = encrypted.authTag;
    }

    await query(
      `UPDATE credentials
       SET
         website_id = COALESCE(?, website_id),
         service_type = COALESCE(?, service_type),
         username = COALESCE(?, username),
         encrypted_password = ?,
         iv = ?,
         auth_tag = ?,
         login_url = COALESCE(?, login_url),
         notes = COALESCE(?, notes),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        website_id,
        service_type,
        username,
        encryptedPassword,
        iv,
        authTag,
        login_url,
        notes,
        id,
      ]
    );

    return true;
  }

  /**
   * Delete credential
   */
  static async deleteCredential(id) {
    const existing = await query(`SELECT id FROM credentials WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Credential not found.');
    }
    await query(`DELETE FROM credentials WHERE id = ?`, [id]);
    return true;
  }
}

export default CredentialsService;
