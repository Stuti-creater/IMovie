import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { validateRegistration, normalizeEmail } from '../utils/validators.js';

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', 10);

export async function register(req, res) {
  const { name, email, password } = req.body || {};
  const errors = validateRegistration({ name, email, password });
  if (Object.keys(errors).length) throw new AppError(400, 'Please fix the highlighted fields.', errors);

  const normalized = normalizeEmail(email);
  if (await User.exists({ email: normalized })) {
    throw new AppError(409, 'An account with this email already exists.', { email: 'Email already registered.' });
  }

  // role is NEVER taken from the request body: public sign-ups are always "user".
  const user = await User.create({
    name: String(name).trim(),
    email: normalized,
    passwordHash: await bcrypt.hash(String(password), 12),
    role: 'user',
  });
  res.status(201).json({ token: signToken(user), user });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError(400, 'Email and password are required.');

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash');
  const ok = await bcrypt.compare(String(password), user?.passwordHash || DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'Incorrect email or password.');

  res.json({ token: signToken(user), user });
}

export const me = (req, res) => res.json({ user: req.user });
