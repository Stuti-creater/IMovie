import axios from 'axios';

export const TOKEN_KEY = 'imovies_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Turn any axios failure into a readable message (+ field errors when the API sent them). */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) return { message: err.response.data.message, fields: err.response.data.details || {}, status: err.response.status };
  if (err?.code === 'ECONNABORTED') return { message: 'The server took too long to respond. Please try again.', fields: {} };
  if (err?.request) return { message: 'Cannot reach the server. Check your connection and that the API is running.', fields: {} };
  return { message: fallback, fields: {} };
}

export default api;
