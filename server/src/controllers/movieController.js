import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex, dateString } from '../utils/helpers.js';

export async function listMovies(req, res) {
  const { q, genre } = req.query;
  const filter = {};
  if (q && String(q).trim()) filter.title = { $regex: escapeRegex(String(q).trim().slice(0, 80)), $options: 'i' };
  if (genre && genre !== 'All') filter.genres = String(genre);

  const movies = await Movie.find(filter).sort({ featured: -1, rating: -1, title: 1 }).limit(100);
  res.json({ movies });
}

export async function getMovie(req, res) {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new AppError(404, 'Movie not found.');
  res.json({ movie });
}

export async function getMovieShows(req, res) {
  const movie = await Movie.findById(req.params.id).select('_id');
  if (!movie) throw new AppError(404, 'Movie not found.');

  const today = dateString(0);
  const shows = await Show.find({ movie: movie._id, date: { $gte: today } }).sort({ date: 1, time: 1 });
  const nowHM = new Date().toTimeString().slice(0, 5);
  const upcoming = shows.filter((s) => s.date > today || s.time > nowHM);

  res.json({
    shows: upcoming.map((s) => ({
      ...s.toObject(),
      bookedSeats: undefined,
      bookedCount: s.bookedSeats.length,
    })),
  });
}

/** Seat map for one show (used when a showtime is selected). */
export async function getShow(req, res) {
  const show = await Show.findById(req.params.id).populate('movie', 'title posterUrl backdropUrl duration language rating');
  if (!show) throw new AppError(404, 'Show not found.');
  res.json({ show });
}
