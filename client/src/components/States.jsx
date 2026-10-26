import { AlertTriangle, Film, Loader2 } from 'lucide-react';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 className="spin" size={28} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="state">
      <Film size={28} aria-hidden="true" />
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="movie-grid" aria-busy="true" aria-label="Loading movies">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ aspectRatio: '2 / 3' }} />
          <div className="skeleton" style={{ height: 14, width: '70%', marginTop: 12 }} />
          <div className="skeleton" style={{ height: 12, width: '45%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
