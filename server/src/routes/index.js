import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { asyncHandler as h } from '../utils/helpers.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validateId } from '../middleware/validateId.js';
import * as auth from '../controllers/authController.js';
import * as movies from '../controllers/movieController.js';
import * as bookings from '../controllers/bookingController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', time: new Date().toISOString() })
);

router.post('/auth/register', authLimiter, h(auth.register));
router.post('/auth/login', authLimiter, h(auth.login));
router.get('/auth/me', protect, auth.me);

router.get('/movies', h(movies.listMovies));
router.get('/movies/:id', validateId(), h(movies.getMovie));
router.get('/movies/:id/shows', validateId(), h(movies.getMovieShows));
router.get('/shows/:id', validateId(), h(movies.getShow));

router.post('/bookings', protect, h(bookings.create));
router.get('/bookings/my', protect, h(bookings.mine));

const adminOnly = [protect, requireRole('admin')];
router.post('/admin/movies', adminOnly, h(admin.createMovie));
router.put('/admin/movies/:id', adminOnly, validateId(), h(admin.updateMovie));
router.delete('/admin/movies/:id', adminOnly, validateId(), h(admin.deleteMovie));
router.get('/admin/shows', adminOnly, h(admin.listShows));
router.post('/admin/shows', adminOnly, h(admin.createShow));
router.put('/admin/shows/:id', adminOnly, validateId(), h(admin.updateShow));
router.delete('/admin/shows/:id', adminOnly, validateId(), h(admin.deleteShow));
router.get('/admin/bookings', adminOnly, h(admin.listBookings));

export default router;
