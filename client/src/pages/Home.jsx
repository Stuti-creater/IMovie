import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Star, X } from 'lucide-react';
import api, { apiError } from '../api/client.js';
import MovieCard from '../components/MovieCard.jsx';
import Poster from '../components/Poster.jsx';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { runtime } from '../utils.js';

export default function Home() {
  useDocumentTitle('Now showing');
  const [all, setAll] = useState(null);
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('All');
  const [reloadKey, setReloadKey] = useState(0);
  const firstLoad = useRef(true);

  // 1) full catalogue (hero + genre chips)
  useEffect(() => {
    let off = false;
    setError(null);
    api
      .get('/movies')
      .then((r) => {
        if (off) return;
        setAll(r.data.movies);
        setMovies(r.data.movies);
      })
      .catch((e) => !off && setError(apiError(e).message));
    return () => {
      off = true;
    };
  }, [reloadKey]);

  // 2) filtered list, debounced so typing doesn't hammer the API
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    let off = false;
    const t = setTimeout(() => {
      api
        .get('/movies', { params: { q: q.trim() || undefined, genre: genre === 'All' ? undefined : genre } })
        .then((r) => !off && (setMovies(r.data.movies), setError(null)))
        .catch((e) => !off && setError(apiError(e).message));
    }, 250);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, [q, genre]);

  const genres = useMemo(() => ['All', ...new Set((all || []).flatMap((m) => m.genres))], [all]);
  const featured = useMemo(() => (all || []).find((m) => m.featured) || (all || [])[0], [all]);
  const filtering = q.trim() || genre !== 'All';

  return (
    <>
      {featured && !error && (
        <section className="hero" aria-label="Featured movie">
          <div className="hero-bg" style={{ backgroundImage: `url(${featured.backdropUrl || featured.posterUrl})` }} aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="kicker">Featured tonight</p>
              <h1>{featured.title}</h1>
              <p className="hero-meta">
                <span className="rating-pill inline"><Star size={13} fill="currentColor" aria-hidden="true" /> {featured.rating.toFixed(1)}</span>
                <span>{featured.language}</span>
                <span><Clock size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {runtime(featured.duration)}</span>
                <span>{featured.genres.join(', ')}</span>
              </p>
              <p className="hero-desc">{featured.description}</p>
              <div className="hero-actions">
                <Link to={`/movies/${featured._id}`} className="btn btn-gold">Book tickets</Link>
                <a href="#now-showing" className="btn btn-ghost">Browse all</a>
              </div>
            </div>
            <Link to={`/movies/${featured._id}`} className="hero-poster" aria-label={`Open ${featured.title}`}>
              <Poster src={featured.posterUrl} title={featured.title} />
            </Link>
          </div>
        </section>
      )}

      <section id="now-showing" className="container section">
        <div className="section-head">
          <h2>Now showing</h2>
          <div className="search">
            <Search size={18} aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" aria-label="Search movies by title" maxLength={80} />
            {q && (
              <button className="icon-btn" onClick={() => setQ('')} aria-label="Clear search"><X size={16} /></button>
            )}
          </div>
        </div>

        <div className="chips" role="group" aria-label="Filter by genre">
          {genres.map((g) => (
            <button key={g} className={`chip ${genre === g ? 'active' : ''}`} aria-pressed={genre === g} onClick={() => setGenre(g)}>
              {g}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : !movies ? (
          <GridSkeleton />
        ) : movies.length === 0 ? (
          <EmptyState
            title="No movies match"
            hint={filtering ? 'Try a different title or clear the genre filter.' : 'Nothing is showing right now. Check back soon.'}
            action={filtering && <button className="btn btn-ghost" onClick={() => { setQ(''); setGenre('All'); }}>Clear filters</button>}
          />
        ) : (
          <div className="movie-grid">
            {movies.map((m) => <MovieCard key={m._id} movie={m} />)}
          </div>
        )}
      </section>
    </>
  );
}
