import { env } from '../config/env.js';

export const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// Central handler. Only AppError messages and known validation problems reach the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.expose ? err.message : 'Something went wrong on our side. Please try again.';
  let details = err.details;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Some fields are invalid.';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier or value.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That record already exists.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  }

  if (status >= 500) console.error('[error]', req.method, req.originalUrl, env.isProd ? err.message : err);
  res.status(status).json({ message, ...(details ? { details } : {}) });
}
