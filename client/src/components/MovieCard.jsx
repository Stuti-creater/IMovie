import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import Poster from './Poster.jsx';
import { runtime } from '../utils.js';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card" aria-label={`${movie.title}, rated ${movie.rating}, ${movie.language}`}>
      <div className="movie-card-art">
        <Poster src={movie.posterUrl} title={movie.title} />
        <span className="rating-pill">
          <Star size={12} fill="currentColor" aria-hidden="true" /> {Number(movie.rating).toFixed(1)}
        </span>
      </div>
      <h3>{movie.title}</h3>
      <p className="muted small">
        {movie.language} · <Clock size={12} aria-hidden="true" style={{ verticalAlign: '-1px' }} /> {runtime(movie.duration)}
      </p>
      <p className="genres small">{movie.genres.join(', ')}</p>
    </Link>
  );
}
