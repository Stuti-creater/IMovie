import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { apiError } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { ErrorState, Loading } from '../components/States.jsx';
import { formatDate, formatTime, money } from '../utils.js';

const TABS = ['Movies', 'Shows', 'Bookings'];
const blankMovie = { title: '', description: '', posterUrl: '', backdropUrl: '', genres: '', duration: 120, rating: 7, language: 'English', releaseDate: '', featured: false };
const blankShow = { movie: '', theatre: '', city: 'Indore', date: '', time: '18:00', price: 250 };

export default function Admin() {
  useDocumentTitle('Admin');
  const [tab, setTab] = useState('Movies');
  return (
    <section className="container section">
      <h1>Admin</h1>
      <div className="chips" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Movies' && <MoviesAdmin />}
      {tab === 'Shows' && <ShowsAdmin />}
      {tab === 'Bookings' && <BookingsAdmin />}
    </section>
  );
}

function useAction() {
  const [msg, setMsg] = useState({ type: '', text: '' });
  const run = async (fn, okText) => {
    try {
      await fn();
      setMsg({ type: 'ok', text: okText });
      return true;
    } catch (e) {
      const err = apiError(e);
      const detail = Object.values(err.fields || {}).join(' ');
      setMsg({ type: 'err', text: `${err.message} ${detail}`.trim() });
      return false;
    }
  };
  return [msg, run];
}

const Msg = ({ msg }) => (msg.text ? <p className={msg.type === 'ok' ? 'form-ok' : 'form-error'} role="alert">{msg.text}</p> : null);

function MoviesAdmin() {
  const { data, loading, error, reload } = useFetch('/movies');
  const [form, setForm] = useState(blankMovie);
  const [editing, setEditing] = useState(null);
  const [msg, run] = useAction();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      genres: String(form.genres).split(',').map((g) => g.trim()).filter(Boolean),
      duration: Number(form.duration),
      rating: Number(form.rating),
      releaseDate: form.releaseDate || undefined,
    };
    const ok = await run(() => (editing ? api.put(`/admin/movies/${editing}`, body) : api.post('/admin/movies', body)), editing ? 'Movie updated.' : 'Movie created.');
    if (ok) {
      setForm(blankMovie);
      setEditing(null);
      reload();
    }
  };
  const edit = (m) => {
    setEditing(m._id);
    setForm({ ...m, genres: m.genres.join(', '), releaseDate: m.releaseDate?.slice(0, 10) || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.title}" and all its shows?`)) return;
    if (await run(() => api.delete(`/admin/movies/${m._id}`), 'Movie deleted.')) reload();
  };

  return (
    <div className="admin-grid">
      <form className="panel" onSubmit={submit}>
        <h2>{editing ? 'Edit movie' : 'Add movie'}</h2>
        <Msg msg={msg} />
        <Input label="Title" value={form.title} onChange={set('title')} required />
        <div className="field"><label htmlFor="desc">Description</label><textarea id="desc" rows={3} value={form.description} onChange={set('description')} required /></div>
        <Input label="Poster URL" value={form.posterUrl} onChange={set('posterUrl')} required />
        <Input label="Backdrop URL" value={form.backdropUrl} onChange={set('backdropUrl')} />
        <Input label="Genres (comma separated)" value={form.genres} onChange={set('genres')} />
        <div className="row-2">
          <Input label="Duration (min)" type="number" value={form.duration} onChange={set('duration')} />
          <Input label="Rating (0-10)" type="number" step="0.1" value={form.rating} onChange={set('rating')} />
        </div>
        <div className="row-2">
          <Input label="Language" value={form.language} onChange={set('language')} required />
          <Input label="Release date" type="date" value={form.releaseDate} onChange={set('releaseDate')} />
        </div>
        <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on home page</label>
        <div className="hero-actions">
          <button className="btn btn-gold"><Plus size={16} aria-hidden="true" /> {editing ? 'Save changes' : 'Add movie'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blankMovie); }}>Cancel</button>}
        </div>
      </form>

      <div className="panel">
        <h2>Movies</h2>
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <ul className="admin-list">
            {data.movies.map((m) => (
              <li key={m._id}>
                <span>{m.title}{m.featured && <span className="badge">Featured</span>}</span>
                <span>
                  <button className="icon-btn" onClick={() => edit(m)} aria-label={`Edit ${m.title}`}><Pencil size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(m)} aria-label={`Delete ${m.title}`}><Trash2 size={16} /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ShowsAdmin() {
  const movies = useFetch('/movies');
  const shows = useFetch('/admin/shows');
  const [form, setForm] = useState(blankShow);
  const [msg, run] = useAction();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (await run(() => api.post('/admin/shows', { ...form, price: Number(form.price) }), 'Show created.')) shows.reload();
  };
  const remove = async (s) => {
    if (!window.confirm('Delete this show?')) return;
    if (await run(() => api.delete(`/admin/shows/${s._id}`), 'Show deleted.')) shows.reload();
  };

  return (
    <div className="admin-grid">
      <form className="panel" onSubmit={submit}>
        <h2>Add show</h2>
        <Msg msg={msg} />
        <div className="field">
          <label htmlFor="movie">Movie</label>
          <select id="movie" value={form.movie} onChange={set('movie')} required>
            <option value="">Select a movie</option>
            {(movies.data?.movies || []).map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </div>
        <Input label="Theatre" value={form.theatre} onChange={set('theatre')} required />
        <Input label="City" value={form.city} onChange={set('city')} required />
        <div className="row-2">
          <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
          <Input label="Time" type="time" value={form.time} onChange={set('time')} required />
        </div>
        <Input label="Price per seat (₹)" type="number" value={form.price} onChange={set('price')} required />
        <button className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Add show</button>
      </form>

      <div className="panel">
        <h2>Shows</h2>
        {shows.loading ? <Loading /> : shows.error ? <ErrorState message={shows.error} onRetry={shows.reload} /> : (
          <ul className="admin-list">
            {shows.data.shows.map((s) => (
              <li key={s._id}>
                <span>{s.movie?.title} <span className="muted small">{formatDate(s.date)} {formatTime(s.time)} · {s.theatre} · {money(s.price)} · {s.bookedSeats.length} booked</span></span>
                <button className="icon-btn danger" onClick={() => remove(s)} aria-label="Delete show"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BookingsAdmin() {
  const { data, loading, error, reload } = useFetch('/admin/bookings');
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="panel table-wrap">
      <table>
        <thead><tr><th>Reference</th><th>User</th><th>Movie</th><th>Show</th><th>Seats</th><th>Total</th></tr></thead>
        <tbody>
          {data.bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.bookingRef}</td>
              <td>{b.user?.name}<br /><span className="muted small">{b.user?.email}</span></td>
              <td>{b.show?.movie?.title}</td>
              <td>{b.show && `${formatDate(b.show.date)} ${formatTime(b.show.time)}`}</td>
              <td>{b.seats.join(', ')}</td>
              <td>{money(b.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.bookings.length === 0 && <p className="muted center">No bookings yet.</p>}
    </div>
  );
}

function Input({ label, ...props }) {
  const id = `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}
