import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { createBooking } from '../services/bookingService.js';
import mongoose from 'mongoose';

const populateBooking = (q) =>
  q.populate({ path: 'show', select: 'theatre city date time price', populate: { path: 'movie', select: 'title posterUrl language duration' } });

export async function create(req, res) {
  const { showId, seats } = req.body || {};
  if (!mongoose.isValidObjectId(showId)) throw new AppError(400, 'A valid show is required.');
  const booking = await createBooking({ userId: req.user._id, showId, seatsInput: seats });
  const full = await populateBooking(Booking.findById(booking._id));
  res.status(201).json({
    booking: full,
    notice: 'Demonstration reservation. No payment was processed.',
  });
}

export async function mine(req, res) {
  const bookings = await populateBooking(Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100));
  res.json({ bookings });
}
