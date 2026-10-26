import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import api, { apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import SeatMap from '../components/SeatMap.jsx';
import Poster from '../components/Poster.jsx';
import { ErrorState, Loading } from '../components/States.jsx';
import { MAX_SEATS, formatDate, formatTime, money } from '../utils.js';

export default function SeatSelection() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(`/shows/${id}`);
  const show = data?.show;
  useDocumentTitle(show ? `Seats for ${show.movie.title}` : 'Select seats');

  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  // Drop any selected seat that has become booked after a refresh.
  useEffect(() => {
    if (show) setSelected((sel) => sel.filter((s) => !show.bookedSeats.includes(s)));
  }, [show]);

  if (loading && !show) return <Loading label="Loading seat map…" />;
  if (error && !show) return <ErrorState message={error} onRetry={reload} />;

  const total = show.price * selected.length;

  const toggle = (seat) => {
    setNotice('');
    setSelected((sel) => {
      if (sel.includes(seat)) return sel.filter((s) => s !== seat);
      if (sel.length >= MAX_SEATS) {
        setNotice(`You can select up to ${MAX_SEATS} seats per booking.`);
        return sel;
      }
      return [...sel, seat];
    });
  };

  const book = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setBusy(true);
    setNotice('');
    try {
      const { data: res } = await api.post('/bookings', { showId: show._id, seats: selected });
      setConfirmed(res.booking);
    } catch (err) {
      const e = apiError(err);
      setNotice(e.message);
      if (e.status === 409) reload(); // someone grabbed a seat first: refresh availability
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    const s = confirmed.show;
    return (
      <section className="container section confirm">
        <div className="ticket" role="status">
          <CheckCircle2 size={40} className="gold" aria-hidden="true" />
          <h1>Reservation confirmed</h1>
          <p className="muted">Demonstration booking. No payment was processed.</p>
          <p className="ref">{confirmed.bookingRef}</p>
          <dl>
            <div><dt>Movie</dt><dd>{s.movie.title}</dd></div>
            <div><dt>Theatre</dt><dd>{s.theatre}, {s.city}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(s.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
            <div><dt>Time</dt><dd>{formatTime(s.time)}</dd></div>
            <div><dt>Seats</dt><dd>{confirmed.seats.join(', ')}</dd></div>
            <div><dt>Total</dt><dd>{money(confirmed.totalAmount)}</dd></div>
          </dl>
          <div className="hero-actions">
            <Link to="/account" className="btn btn-gold">View my bookings</Link>
            <Link to="/" className="btn btn-ghost">Back to movies</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container section">
      <Link to={`/movies/${show.movie._id}`} className="back"><ArrowLeft size={16} aria-hidden="true" /> Showtimes</Link>
      <div className="seat-layout">
        <div>
          <SeatMap booked={show.bookedSeats} selected={selected} onToggle={toggle} disabled={busy} />
        </div>

        <aside className="summary" aria-label="Booking summary">
          <div className="summary-head">
            <div className="summary-poster"><Poster src={show.movie.posterUrl} title={show.movie.title} /></div>
            <div>
              <h2>{show.movie.title}</h2>
              <p className="muted small">{show.theatre}, {show.city}</p>
              <p className="small">{formatDate(show.date)} · {formatTime(show.time)}</p>
            </div>
          </div>

          <dl className="summary-lines">
            <div><dt>Price per seat</dt><dd>{money(show.price)}</dd></div>
            <div><dt>Seats ({selected.length}/{MAX_SEATS})</dt><dd>{selected.length ? [...selected].sort().join(', ') : 'None yet'}</dd></div>
            <div className="total"><dt>Total</dt><dd>{money(total)}</dd></div>
          </dl>

          {notice && <p className="form-error" role="alert">{notice}</p>}

          <button className="btn btn-gold btn-block" disabled={busy || selected.length === 0} onClick={book}>
            {busy ? 'Reserving…' : user ? `Reserve ${selected.length || ''} seat${selected.length === 1 ? '' : 's'}` : 'Sign in to reserve'}
          </button>
          <button className="btn btn-ghost btn-block" onClick={reload} disabled={busy}>
            <RefreshCw size={15} aria-hidden="true" /> Refresh availability
          </button>
          <p className="muted small">Demo only: no payment is taken and showtimes are sample data.</p>
        </aside>
      </div>
    </section>
  );
}
