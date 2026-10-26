import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/** Requires a valid Bearer token. Role is always read from the database, never from the token or client. */
export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Please sign in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      throw new AppError(401, err.name === 'TokenExpiredError' ? 'Your session has expired. Please sign in again.' : 'Invalid authentication token.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, 'This account no longer exists.');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError(403, 'You do not have permission to do that.'));
