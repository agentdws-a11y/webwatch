import { query, transaction } from '../../database/connection.js';
import { computeWebsiteHealth, calculateExpiry } from '../../utils/expiryCalculator.js';

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export class WebsitesService {
  /**
   * List websites with filters, search, and health calculation
   */
  static async getAllWebsites(filters = {}) {
    const {
      search = '',
      client_id,
      technology,
      priority,
      status, // 'safe' | 'warning' | 'expired' | 'all'
      is_archived = false,
      tag,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 50,
    } = filters;

    let sql = `
      SELECT 
        w.*,
        c.name AS client_name,
        c.email AS client_email,
        c.company AS client_company,
        h.provider AS hosting_provider_detail,
        h.plan_name AS hosting_plan,
        h.renewal_date AS hosting_renewal_date,
        h.cost AS hosting_cost,
        h.auto_renew AS hosting_auto_renew,
        d.registrar AS domain_registrar,
        d.expiry_date AS domain_expiry_date,
        d.cost AS domain_cost,
        d.auto_renew AS domain_auto_renew,
        s.issuer AS ssl_issuer,
        s.expiry_date AS ssl_expiry_date,
        s.ssl_type,
        s.auto_renew AS ssl_auto_renew,
        e.email_provider,
        e.email_expiry_date,
        e.cdn_provider,
        e.cdn_expiry_date
      FROM websites w
      LEFT JOIN clients c ON w.client_id = c.id
      LEFT JOIN hosting_details h ON w.id = h.website_id
      LEFT JOIN domain_details d ON w.id = d.website_id
      LEFT JOIN ssl_details s ON w.id = s.website_id
      LEFT JOIN email_cdn_details e ON w.id = e.website_id
      WHERE w.is_archived = ?
    `;

    const params = [is_archived === 'true' || is_archived === true];

    if (search) {
      sql += ` AND (w.website_name LIKE ? OR w.website_url LIKE ? OR c.name LIKE ? OR c.company LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (client_id) {
      sql += ` AND w.client_id = ?`;
      params.push(client_id);
    }

    if (technology) {
      sql += ` AND w.technology = ?`;
      params.push(technology);
    }

    if (priority) {
      sql += ` AND w.priority = ?`;
      params.push(priority);
    }

    if (tag) {
      sql += ` AND JSON_CONTAINS(w.tags, JSON_QUOTE(?))`;
      params.push(tag);
    }

    // Default sorting
    const allowedSortCols = ['website_name', 'created_at', 'date_built', 'priority'];
    const cleanSortBy = allowedSortCols.includes(sort_by) ? `w.${sort_by}` : 'w.created_at';
    const cleanSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${cleanSortBy} ${cleanSortOrder}`;

    const result = await query(sql, params);

    // Compute health and expiry details for each website
    let websites = result.rows.map((row) => {
      const health = computeWebsiteHealth({
        domain_expiry_date: row.domain_expiry_date,
        hosting_renewal_date: row.hosting_renewal_date,
        ssl_expiry_date: row.ssl_expiry_date,
        email_expiry_date: row.email_expiry_date,
        cdn_expiry_date: row.cdn_expiry_date,
      });

      return {
        id: row.id,
        website_name: row.website_name,
        website_url: row.website_url,
        technology: row.technology,
        hosting_provider: row.hosting_provider || row.hosting_provider_detail,
        domain_provider: row.domain_provider || row.domain_registrar,
        date_built: row.date_built,
        support_plan: row.support_plan,
        priority: row.priority,
        tags: parseTags(row.tags),
        notes: row.notes,
        is_archived: !!row.is_archived,
        archived_at: row.archived_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_id
          ? {
              id: row.client_id,
              name: row.client_name,
              email: row.client_email,
              company: row.client_company,
            }
          : null,
        hosting: {
          provider: row.hosting_provider_detail,
          plan_name: row.hosting_plan,
          renewal_date: row.hosting_renewal_date,
          cost: parseFloat(row.hosting_cost || 0),
          auto_renew: !!row.hosting_auto_renew,
          ...health.services.hosting,
        },
        domain: {
          registrar: row.domain_registrar,
          expiry_date: row.domain_expiry_date,
          cost: parseFloat(row.domain_cost || 0),
          auto_renew: !!row.domain_auto_renew,
          ...health.services.domain,
        },
        ssl: {
          issuer: row.ssl_issuer,
          expiry_date: row.ssl_expiry_date,
          ssl_type: row.ssl_type,
          auto_renew: !!row.ssl_auto_renew,
          ...health.services.ssl,
        },
        email_cdn: {
          email_provider: row.email_provider,
          email_expiry_date: row.email_expiry_date,
          cdn_provider: row.cdn_provider,
          cdn_expiry_date: row.cdn_expiry_date,
          email_status: health.services.email,
          cdn_status: health.services.cdn,
        },
        health: {
          overallStatus: health.overallStatus,
          nearestExpiry: health.nearestExpiry,
        },
      };
    });

    // Filter by calculated overall status if requested
    if (status && status !== 'all') {
      websites = websites.filter((w) => w.health.overallStatus === status);
    }

    const totalRecords = websites.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedWebsites = websites.slice(startIndex, startIndex + limitNum);

    return {
      websites: paginatedWebsites,
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    };
  }

  /**
   * Get single website by ID with all relational data and recent logs
   */
  static async getWebsiteById(id) {
    const sql = `
      SELECT 
        w.*,
        c.name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        c.company AS client_company,
        h.provider AS hosting_provider_detail,
        h.plan_name AS hosting_plan,
        h.renewal_date AS hosting_renewal_date,
        h.cost AS hosting_cost,
        h.auto_renew AS hosting_auto_renew,
        h.notes AS hosting_notes,
        d.registrar AS domain_registrar,
        d.expiry_date AS domain_expiry_date,
        d.cost AS domain_cost,
        d.auto_renew AS domain_auto_renew,
        d.notes AS domain_notes,
        s.issuer AS ssl_issuer,
        s.expiry_date AS ssl_expiry_date,
        s.ssl_type,
        s.auto_renew AS ssl_auto_renew,
        s.notes AS ssl_notes,
        e.email_provider,
        e.email_expiry_date,
        e.cdn_provider,
        e.cdn_expiry_date,
        e.notes AS email_cdn_notes
      FROM websites w
      LEFT JOIN clients c ON w.client_id = c.id
      LEFT JOIN hosting_details h ON w.id = h.website_id
      LEFT JOIN domain_details d ON w.id = d.website_id
      LEFT JOIN ssl_details s ON w.id = s.website_id
      LEFT JOIN email_cdn_details e ON w.id = e.website_id
      WHERE w.id = ?
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      throw new Error('Website not found.');
    }

    const row = result.rows[0];
    const health = computeWebsiteHealth({
      domain_expiry_date: row.domain_expiry_date,
      hosting_renewal_date: row.hosting_renewal_date,
      ssl_expiry_date: row.ssl_expiry_date,
      email_expiry_date: row.email_expiry_date,
      cdn_expiry_date: row.cdn_expiry_date,
    });

    // Fetch recent maintenance logs
    const logsResult = await query(
      `SELECT * FROM maintenance_logs WHERE website_id = ? ORDER BY performed_at DESC LIMIT 10`,
      [id]
    );

    return {
      id: row.id,
      website_name: row.website_name,
      website_url: row.website_url,
      technology: row.technology,
      hosting_provider: row.hosting_provider || row.hosting_provider_detail,
      domain_provider: row.domain_provider || row.domain_registrar,
      date_built: row.date_built,
      support_plan: row.support_plan,
      priority: row.priority,
      tags: parseTags(row.tags),
      notes: row.notes,
      is_archived: !!row.is_archived,
      archived_at: row.archived_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client: row.client_id
        ? {
            id: row.client_id,
            name: row.client_name,
            email: row.client_email,
            phone: row.client_phone,
            company: row.client_company,
          }
        : null,
      hosting: {
        provider: row.hosting_provider_detail,
        plan_name: row.hosting_plan,
        renewal_date: row.hosting_renewal_date,
        cost: parseFloat(row.hosting_cost || 0),
        auto_renew: !!row.hosting_auto_renew,
        notes: row.hosting_notes,
        ...health.services.hosting,
      },
      domain: {
        registrar: row.domain_registrar,
        expiry_date: row.domain_expiry_date,
        cost: parseFloat(row.domain_cost || 0),
        auto_renew: !!row.domain_auto_renew,
        notes: row.domain_notes,
        ...health.services.domain,
      },
      ssl: {
        issuer: row.ssl_issuer,
        expiry_date: row.ssl_expiry_date,
        ssl_type: row.ssl_type,
        auto_renew: !!row.ssl_auto_renew,
        notes: row.ssl_notes,
        ...health.services.ssl,
      },
      email_cdn: {
        email_provider: row.email_provider,
        email_expiry_date: row.email_expiry_date,
        cdn_provider: row.cdn_provider,
        cdn_expiry_date: row.cdn_expiry_date,
        notes: row.email_cdn_notes,
        email_status: health.services.email,
        cdn_status: health.services.cdn,
      },
      health: {
        overallStatus: health.overallStatus,
        nearestExpiry: health.nearestExpiry,
      },
      recent_maintenance_logs: logsResult.rows,
    };
  }

  /**
   * Create website with relational details in a single transaction
   */
  static async createWebsite(payload) {
    return transaction(async (client) => {
      const {
        client_id,
        website_name,
        website_url,
        technology = 'WordPress',
        hosting_provider,
        domain_provider,
        date_built,
        support_plan = 'Basic Monthly',
        priority = 'Medium',
        tags = [],
        notes,
        hosting = {},
        domain = {},
        ssl = {},
        email_cdn = {},
      } = payload;

      // 1. Insert core website
      const websiteResult = await client.query(
        `INSERT INTO websites (
          client_id, website_name, website_url, technology,
          hosting_provider, domain_provider, date_built,
          support_plan, priority, tags, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          client_id || null,
          website_name,
          website_url,
          technology,
          hosting_provider || hosting.provider || null,
          domain_provider || domain.registrar || null,
          date_built || null,
          support_plan,
          priority,
          JSON.stringify(tags || []),
          notes || null,
        ]
      );

      const websiteId = websiteResult.insertId;
      const websiteRow = await client.query(`SELECT * FROM websites WHERE id = ?`, [websiteId]);
      const website = websiteRow.rows[0];

      // 2. Insert hosting details
      await client.query(
        `INSERT INTO hosting_details (
          website_id, provider, plan_name, renewal_date, cost, auto_renew, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          websiteId,
          hosting.provider || hosting_provider || null,
          hosting.plan_name || null,
          hosting.renewal_date || null,
          hosting.cost || 0.0,
          hosting.auto_renew || false,
          hosting.notes || null,
        ]
      );

      // 3. Insert domain details
      await client.query(
        `INSERT INTO domain_details (
          website_id, registrar, expiry_date, cost, auto_renew, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          websiteId,
          domain.registrar || domain_provider || null,
          domain.expiry_date || null,
          domain.cost || 0.0,
          domain.auto_renew || false,
          domain.notes || null,
        ]
      );

      // 4. Insert SSL details
      await client.query(
        `INSERT INTO ssl_details (
          website_id, issuer, expiry_date, ssl_type, auto_renew, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          websiteId,
          ssl.issuer || null,
          ssl.expiry_date || null,
          ssl.ssl_type || "Let's Encrypt / Auto SSL",
          ssl.auto_renew ?? true,
          ssl.notes || null,
        ]
      );

      // 5. Insert Email & CDN details
      await client.query(
        `INSERT INTO email_cdn_details (
          website_id, email_provider, email_expiry_date, cdn_provider, cdn_expiry_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          websiteId,
          email_cdn.email_provider || null,
          email_cdn.email_expiry_date || null,
          email_cdn.cdn_provider || null,
          email_cdn.cdn_expiry_date || null,
          email_cdn.notes || null,
        ]
      );

      return website;
    });
  }

  /**
   * Update website and related details in a transaction
   */
  static async updateWebsite(id, payload) {
    return transaction(async (client) => {
      const existing = await client.query(`SELECT id FROM websites WHERE id = ?`, [id]);
      if (existing.rowCount === 0) {
        throw new Error('Website not found.');
      }

      const {
        client_id,
        website_name,
        website_url,
        technology,
        hosting_provider,
        domain_provider,
        date_built,
        support_plan,
        priority,
        tags,
        notes,
        hosting,
        domain,
        ssl,
        email_cdn,
      } = payload;

      // 1. Update Core Website
      await client.query(
        `UPDATE websites
         SET 
           client_id = COALESCE(?, client_id),
           website_name = COALESCE(?, website_name),
           website_url = COALESCE(?, website_url),
           technology = COALESCE(?, technology),
           hosting_provider = COALESCE(?, hosting_provider),
           domain_provider = COALESCE(?, domain_provider),
           date_built = COALESCE(?, date_built),
           support_plan = COALESCE(?, support_plan),
           priority = COALESCE(?, priority),
           tags = COALESCE(?, tags),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          client_id,
          website_name,
          website_url,
          technology,
          hosting_provider,
          domain_provider,
          date_built,
          support_plan,
          priority,
          tags ? JSON.stringify(tags) : null,
          notes,
          id,
        ]
      );

      // 2. Upsert Hosting Details
      if (hosting) {
        await client.query(
          `INSERT INTO hosting_details (website_id, provider, plan_name, renewal_date, cost, auto_renew, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             provider = COALESCE(VALUES(provider), provider),
             plan_name = COALESCE(VALUES(plan_name), plan_name),
             renewal_date = COALESCE(VALUES(renewal_date), renewal_date),
             cost = COALESCE(VALUES(cost), cost),
             auto_renew = COALESCE(VALUES(auto_renew), auto_renew),
             notes = COALESCE(VALUES(notes), notes),
             updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            hosting.provider,
            hosting.plan_name,
            hosting.renewal_date,
            hosting.cost,
            hosting.auto_renew,
            hosting.notes,
          ]
        );
      }

      // 3. Upsert Domain Details
      if (domain) {
        await client.query(
          `INSERT INTO domain_details (website_id, registrar, expiry_date, cost, auto_renew, notes)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             registrar = COALESCE(VALUES(registrar), registrar),
             expiry_date = COALESCE(VALUES(expiry_date), expiry_date),
             cost = COALESCE(VALUES(cost), cost),
             auto_renew = COALESCE(VALUES(auto_renew), auto_renew),
             notes = COALESCE(VALUES(notes), notes),
             updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            domain.registrar,
            domain.expiry_date,
            domain.cost,
            domain.auto_renew,
            domain.notes,
          ]
        );
      }

      // 4. Upsert SSL Details
      if (ssl) {
        await client.query(
          `INSERT INTO ssl_details (website_id, issuer, expiry_date, ssl_type, auto_renew, notes)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             issuer = COALESCE(VALUES(issuer), issuer),
             expiry_date = COALESCE(VALUES(expiry_date), expiry_date),
             ssl_type = COALESCE(VALUES(ssl_type), ssl_type),
             auto_renew = COALESCE(VALUES(auto_renew), auto_renew),
             notes = COALESCE(VALUES(notes), notes),
             updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            ssl.issuer,
            ssl.expiry_date,
            ssl.ssl_type,
            ssl.auto_renew,
            ssl.notes,
          ]
        );
      }

      // 5. Upsert Email & CDN Details
      if (email_cdn) {
        await client.query(
          `INSERT INTO email_cdn_details (website_id, email_provider, email_expiry_date, cdn_provider, cdn_expiry_date, notes)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             email_provider = COALESCE(VALUES(email_provider), email_provider),
             email_expiry_date = COALESCE(VALUES(email_expiry_date), email_expiry_date),
             cdn_provider = COALESCE(VALUES(cdn_provider), cdn_provider),
             cdn_expiry_date = COALESCE(VALUES(cdn_expiry_date), cdn_expiry_date),
             notes = COALESCE(VALUES(notes), notes),
             updated_at = CURRENT_TIMESTAMP`,
          [
            id,
            email_cdn.email_provider,
            email_cdn.email_expiry_date,
            email_cdn.cdn_provider,
            email_cdn.cdn_expiry_date,
            email_cdn.notes,
          ]
        );
      }

      return this.getWebsiteById(id);
    });
  }

  /**
   * Soft-delete / Archive website
   */
  static async archiveWebsite(id) {
    const existing = await query(`SELECT id FROM websites WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Website not found.');
    }
    await query(
      `UPDATE websites SET is_archived = TRUE, archived_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    const result = await query(`SELECT id, website_name, is_archived FROM websites WHERE id = ?`, [id]);
    return result.rows[0];
  }

  /**
   * Restore website from archive
   */
  static async restoreWebsite(id) {
    const existing = await query(`SELECT id FROM websites WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Website not found.');
    }
    await query(
      `UPDATE websites SET is_archived = FALSE, archived_at = NULL WHERE id = ?`,
      [id]
    );
    const result = await query(`SELECT id, website_name, is_archived FROM websites WHERE id = ?`, [id]);
    return result.rows[0];
  }

  /**
   * Permanent Delete website
   */
  static async deleteWebsite(id) {
    const existing = await query(`SELECT id FROM websites WHERE id = ?`, [id]);
    if (existing.rowCount === 0) {
      throw new Error('Website not found.');
    }
    await query(`DELETE FROM websites WHERE id = ?`, [id]);
    return true;
  }
}

export default WebsitesService;
