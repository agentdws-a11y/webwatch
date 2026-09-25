import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM

/**
 * Get 32-byte key buffer from configuration
 */
function getKeyBuffer() {
  const secret = env.VAULT_SECRET_KEY;
  if (!secret) {
    throw new Error('VAULT_SECRET_KEY is missing in environment configuration.');
  }

  // If provided as 64-char hex string (32 bytes), parse it; else SHA-256 hash it to 32 bytes
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {{ encryptedPassword: string, iv: string, authTag: string }}
 */
export function encrypt(text) {
  if (!text) {
    throw new Error('Cannot encrypt empty text.');
  }

  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedPassword: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag,
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} encryptedPassword - Hex ciphertext
 * @param {string} ivHex - Hex IV
 * @param {string} authTagHex - Hex Auth Tag
 * @returns {string} - Decrypted plaintext
 */
export function decrypt(encryptedPassword, ivHex, authTagHex) {
  if (!encryptedPassword || !ivHex || !authTagHex) {
    throw new Error('Encrypted payload, IV, and auth tag are all required for decryption.');
  }

  const key = getKeyBuffer();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export default { encrypt, decrypt };
