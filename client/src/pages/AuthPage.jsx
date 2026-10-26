import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  useDocumentTitle(isRegister ? 'Create account' : 'Log in');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (isRegister && form.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (isRegister) {
      if (form.password.length < 8) e.password = 'Use at least 8 characters.';
      else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'Include at least one letter and one number.';
    } else if (!form.password) e.password = 'Enter your password.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    setFormError('');
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      if (isRegister) await register(form.name.trim(), form.email.trim(), form.password);
      else await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const e = apiError(err);
      setErrors(e.fields || {});
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, type, autoComplete) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input id={key} type={type} value={form[key]} onChange={set(key)} autoComplete={autoComplete} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-err` : undefined} />
      {errors[key] && <p id={`${key}-err`} className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <section className="container auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{isRegister ? 'Book seats and keep your tickets in one place.' : 'Log in to reserve seats and see your bookings.'}</p>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        {isRegister && field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', isRegister ? 'new-password' : 'current-password')}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        <p className="muted small center">
          {isRegister ? 'Already have an account?' : 'New to IMovies?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state}>{isRegister ? 'Log in' : 'Create an account'}</Link>
        </p>
      </form>
    </section>
  );
}
