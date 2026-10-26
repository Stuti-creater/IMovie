import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, MapPin, Star } from 'lucide-react';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Poster from '../components/Poster.jsx';
import { EmptyState, ErrorState, Loading } from '../components/States.jsx';
import { TOTAL_SEATS, formatDate, formatTime, money, runtime } from '../utils.js';

export default function MovieDetails() {
  const { id } = useParams();
  const movieReq = useFetch(`/movies/${id}`);
  const showsReq = useFetch(`/movies/${id}/shows`);
  const movie = movieReq.data?.movie;
  useDocumentTitle(movie?.title);

  const shows = showsReq.data?.shows || [];
  const dates = useMemo(() => [...new Set(shows.map((s) => s.date))], [shows]);
  const [picked, setPicked] = useState(null);
  const date = picked && dates.includes(picked) ? picked : dates[0];

  const byTheatre = useMemo(() => {
    const map = new Map();
    shows.filter((s) => s.date === date).forEach((s) => {
      if (!map.has(s.theatre)) map.set(s.theatre, { city: s.city, shows: [] });
      map.get(s.theatre).shows.push(s);
    });
    return [...map.entries()];
  }, [shows, date]);

  if (movieReq.loading) return <Loading label="Loading movie…" />;
  if (movieReq.error) return <ErrorState message={movieReq.error} onRetry={movieReq.reload} />;

  return (
    <>
      <section className="detail-hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }} aria-hidden="true" />
        <div className="container detail-inner">
          <Link to="/" className="back"><ArrowLeft size={16} aria-hidden="true" /> All movies</Link>
          <div className="detail-grid">
            <div className="detail-poster"><Poster src={movie.posterUrl} title={movie.title} /></div>
            <div>
              <h1>{movie.title}</h1>
              <p className="hero-meta">
                <span className="rating-pill inline"><Star size={13} fill="currentColor" aria-hidden="true" /> {movie.rating.toFixed(1)}</span>
                <span><Globe size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {movie.language}</span>
                <span><Clock size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {runtime(movie.duration)}</span>
              </p>
              <ul className="tags" aria-label="Genres">{movie.genres.map((g) => <li key={g}>{g}</li>)}</ul>
              <p className="detail-desc">{movie.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Pick a showtime</h2>
        <p className="muted small">Showtimes and prices are sample data for this demonstration.</p>

        {showsReq.loading ? (
          <Loading label="Loading showtimes…" />
        ) : showsReq.error ? (
          <ErrorState message={showsReq.error} onRetry={showsReq.reload} />
        ) : shows.length === 0 ? (
          <EmptyState title="No upcoming shows" hint="There are no scheduled screenings for this movie yet." />
        ) : (
          <>
            <div className="chips" role="tablist" aria-label="Show dates">
              {dates.map((d) => (
                <button key={d} role="tab" aria-selected={d === date} className={`chip ${d === date ? 'active' : ''}`} onClick={() => setPicked(d)}>
                  {formatDate(d)}
                </button>
              ))}
            </div>

            <div className="theatres">
              {byTheatre.map(([theatre, info]) => (
                <div key={theatre} className="theatre-card">
                  <div>
                    <h3>{theatre}</h3>
                    <p className="muted small"><MapPin size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {info.city}</p>
                  </div>
                  <div className="times">
                    {info.shows.map((s) => {
                      const left = TOTAL_SEATS - s.bookedCount;
                      return (
                        <Link key={s._id} to={`/shows/${s._id}`} className={`time-btn ${left === 0 ? 'soldout' : ''}`} aria-label={`${formatTime(s.time)}, ${money(s.price)} per seat, ${left} seats left`}>
                          <strong>{formatTime(s.time)}</strong>
                          <span>{money(s.price)}</span>
                          <small>{left === 0 ? 'Sold out' : `${left} left`}</small>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
