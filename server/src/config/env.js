import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
};

// Fail fast: an unset or placeholder secret must never reach production.
export function assertEnv() {
  if (!env.jwtSecret || env.jwtSecret.startsWith('change-me')) {
    if (isProd) throw new Error('JWT_SECRET must be set to a strong random value in production.');
    console.warn('[warn] JWT_SECRET is missing/placeholder. Fine for local dev only.');
    env.jwtSecret = 'dev-only-insecure-secret';
  }
}
