import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Database
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'webwatch360',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER || 'postgres'}:${encodeURIComponent(
        process.env.DB_PASSWORD || 'postgres'
      )}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${
        process.env.DB_NAME || 'webwatch360'
      }`,
  },

  // Auth & Security
  JWT_SECRET: process.env.JWT_SECRET || 'webwatch360_default_jwt_secret_dev_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  VAULT_SECRET_KEY: process.env.VAULT_SECRET_KEY || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
