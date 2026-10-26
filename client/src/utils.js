export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const formatDate = (ymd, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(`${ymd}T00:00:00`).toLocaleDateString('en-IN', opts);

export const formatTime = (hm) =>
  new Date(`2000-01-01T${hm}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

export const runtime = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEATS_PER_ROW = 10;
export const TOTAL_SEATS = ROWS.length * SEATS_PER_ROW;
export const MAX_SEATS = 6;
