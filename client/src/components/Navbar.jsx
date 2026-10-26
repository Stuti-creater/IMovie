import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Clapperboard, LogOut, Menu, Shield, Ticket, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close} aria-label="IMovies home">
          <Clapperboard size={22} aria-hidden="true" />
          <span>IMovies</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="nav-links" aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav id="nav-links" className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end onClick={close}>Now showing</NavLink>
          {user && (
            <NavLink to="/account" onClick={close}>
              <Ticket size={16} aria-hidden="true" /> My bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={close}>
              <Shield size={16} aria-hidden="true" /> Admin
            </NavLink>
          )}
          {user ? (
            <>
              <Link to="/account" className="nav-user" onClick={close}>
                <User size={16} aria-hidden="true" /> {user.name.split(' ')[0]}
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  close();
                  navigate('/');
                }}
              >
                <LogOut size={16} aria-hidden="true" /> Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn-gold btn-sm" onClick={close}>Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
