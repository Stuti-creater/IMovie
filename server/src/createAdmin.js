// Usage: ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='StrongPass123' npm run create-admin
// Creates the admin or promotes an existing user. Credentials come from env vars only.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { validateRegistration, normalizeEmail } from './utils/validators.js';

const name = process.env.ADMIN_NAME || 'IMovies Admin';
const email = normalizeEmail(process.env.ADMIN_EMAIL);
const password = process.env.ADMIN_PASSWORD || '';

const errors = validateRegistration({ name, email, password });
if (Object.keys(errors).length) {
  console.error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (8+ chars, letters and numbers).', errors);
  process.exit(1);
}

await connectDB();
const existing = await User.findOne({ email });
if (existing) {
  existing.role = 'admin';
  await existing.save();
  console.log(`Promoted ${email} to admin (password unchanged).`);
} else {
  await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
  console.log(`Admin ${email} created.`);
}
await mongoose.disconnect();
void env;
