import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { pick } from '../utils/helpers.js';

const MOVIE_FIELDS = ['title', 'description', 'posterUrl', 'backdropUrl', 'genres', 'duration', 'rating', 'language', 'releaseDate', 'featured'];
const SHOW_FIELDS = ['movie', 'theatre', 'city', 'date', 'time', 'price'];

export async function createMovie(req, res) {
  const movie = await Movie.create(pick(req.body, MOVIE_FIELDS));
  res.status(201).json({ movie });
}

export async function updateMovie(req, res) {
  const movie = await Movie.findByIdAndUpdate(req.params.id, pick(req.body, MOVIE_FIELDS), { new: true, runValidators: true });
  if (!movie) throw new AppError(404, 'Movie not found.');
  res.json({ movie });
}

export async function deleteMovie(req, res) {
  const shows = await Show.find({ movie: req.params.id }).select('_id');
  if (await Booking.exists({ show: { $in: shows.map((s) => s._id) }, status: 'confirmed' })) {
    throw new AppError(409, 'This movie has confirmed bookings and cannot be deleted.');
  }
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw new AppError(404, 'Movie not found.');
  await Show.deleteMany({ movie: req.params.id });
  res.json({ message: 'Movie and its shows deleted.' });
}

export async function listShows(_req, res) {
  const shows = await Show.find().populate('movie', 'title').sort({ date: -1, time: 1 }).limit(300);
  res.json({ shows });
}

export async function createShow(req, res) {
  const data = pick(req.body, SHOW_FIELDS);
  if (!(await Movie.exists({ _id: data.movie }))) throw new AppError(400, 'Selected movie does not exist.');
  const show = await Show.create(data); // bookedSeats can never be set by the client
  res.status(201).json({ show });
}

export async function updateShow(req, res) {
  const data = pick(req.body, SHOW_FIELDS);
  const show = await Show.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!show) throw new AppError(404, 'Show not found.');
  res.json({ show });
}

export async function deleteShow(req, res) {
  if (await Booking.exists({ show: req.params.id, status: 'confirmed' })) {
    throw new AppError(409, 'This show has confirmed bookings and cannot be deleted.');
  }
  const show = await Show.findByIdAndDelete(req.params.id);
  if (!show) throw new AppError(404, 'Show not found.');
  res.json({ message: 'Show deleted.' });
}

export async function listBookings(_req, res) {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate({ path: 'show', select: 'theatre city date time', populate: { path: 'movie', select: 'title' } })
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ bookings });
}
