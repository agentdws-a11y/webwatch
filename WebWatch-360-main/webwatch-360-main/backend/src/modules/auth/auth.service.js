import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../database/connection.js';
import { env } from '../../config/env.js';

export class AuthService {
  /**
   * Register a new admin user
   */
  static async register({ name, email, password }) {
    const existing = await query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.rowCount > 0) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name || 'Admin Developer', email, passwordHash]
    );

    const userId = insertResult.insertId;
    const token = jwt.sign(
      { userId, email, name: name || 'Admin Developer' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: userId,
        name: name || 'Admin Developer',
        email,
      },
    };
  }

  /**
   * Authenticate admin user with email and password
   */
  static async login(email, password) {
    const result = await query(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?`,
      [email]
    );

    if (result.rowCount === 0) {
      throw new Error('Invalid email or password credentials.');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password credentials.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    };
  }

  /**
   * Get currently authenticated user profile
   */
  static async getProfile(userId) {
    const result = await query(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?`,
      [userId]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found.');
    }

    return result.rows[0];
  }

  /**
   * Change admin password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const result = await query(
      `SELECT id, password_hash FROM users WHERE id = ?`,
      [userId]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found.');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Current password does not match.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await query(
      `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newHash, userId]
    );

    return true;
  }
}

export default AuthService;
