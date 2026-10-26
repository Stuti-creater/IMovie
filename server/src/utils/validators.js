export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SEAT_RE = /^[A-H](?:[1-9]|10)$/;
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEATS_PER_ROW = 10;
export const MAX_SEATS_PER_BOOKING = 6;

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

export function validateRegistration({ name, email, password }) {
  const errors = {};
  const n = String(name || '').trim();
  if (n.length < 2 || n.length > 60) errors.name = 'Name must be 2 to 60 characters.';
  if (!EMAIL_RE.test(normalizeEmail(email))) errors.email = 'Enter a valid email address.';
  const p = String(password || '');
  if (p.length < 8 || p.length > 72) errors.password = 'Password must be 8 to 72 characters.';
  else if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) errors.password = 'Password needs at least one letter and one number.';
  return errors;
}

/** Returns a cleaned, de-duplicated, sorted seat list or throws a message string. */
export function parseSeats(input) {
  if (!Array.isArray(input) || input.length === 0) throw 'Select at least one seat.';
  if (input.length > MAX_SEATS_PER_BOOKING) throw `You can book at most ${MAX_SEATS_PER_BOOKING} seats at a time.`;
  const seats = input.map((s) => String(s).trim().toUpperCase());
  if (seats.some((s) => !SEAT_RE.test(s))) throw 'One or more seat identifiers are invalid.';
  if (new Set(seats).size !== seats.length) throw 'Duplicate seats in request.';
  return seats.sort((a, b) => a[0].localeCompare(b[0]) || Number(a.slice(1)) - Number(b.slice(1)));
}

export function generateBookingRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `IMV-${out}`;
}
