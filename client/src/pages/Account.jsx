import { Link } from 'react-router-dom';
import { Mail, Shield, Ticket, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Poster from '../components/Poster.jsx';
import { EmptyState, ErrorState, Loading } from '../components/States.jsx';
import { formatDate, formatTime, money } from '../utils.js';

export default function Account() {
  useDocumentTitle('My bookings');
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch('/bookings/my');
  const bookings = data?.bookings || [];

  return (
    <section className="container section">
      <div className="profile-card">
        <div className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1><User size={20} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> {user.name}</h1>
          <p className="muted"><Mail size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {user.email}</p>
          <p className="muted small">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            {user.role === 'admin' && <> · <Shield size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Admin</>}
          </p>
        </div>
      </div>

      <h2><Ticket size={20} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Booking history</h2>
      {loading ? (
        <Loading label="Loading your bookings…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" hint="Pick a movie and reserve your first seats." action={<Link to="/" className="btn btn-gold">Browse movies</Link>} />
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b._id} className="booking-item">
              <div className="booking-poster"><Poster src={b.show?.movie?.posterUrl} title={b.show?.movie?.title || 'Movie'} /></div>
              <div className="booking-main">
                <h3>{b.show?.movie?.title || 'Removed movie'}</h3>
                <p className="muted small">{b.show?.theatre}, {b.show?.city}</p>
                <p>{b.show && `${formatDate(b.show.date)} · ${formatTime(b.show.time)}`}</p>
                <p className="small">Seats: <strong>{b.seats.join(', ')}</strong></p>
              </div>
              <div className="booking-side">
                <span className="ref">{b.bookingRef}</span>
                <strong>{money(b.totalAmount)}</strong>
                <span className="badge">Demo reservation</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
