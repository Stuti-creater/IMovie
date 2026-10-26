import { useState } from 'react';

/** Image with a graceful typographic fallback when the URL is missing or broken. */
export default function Poster({ src, title, className = '', wide = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`poster poster-fallback ${wide ? 'wide' : ''} ${className}`} role="img" aria-label={`${title} poster unavailable`}>
        <span>{title?.slice(0, 1)}</span>
        <small>{title}</small>
      </div>
    );
  }
  return <img className={`poster ${wide ? 'wide' : ''} ${className}`} src={src} alt={`${title} poster`} loading="lazy" onError={() => setFailed(true)} />;
}
