/**
 * Central Axios instance for all Flask REST API calls.
 * Automatically attaches the JWT token from localStorage
 * and handles 401 (expired token) globally.
 */
import axios from 'axios'

export const BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle expired token ───────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login/donor'
      }
    }
    return Promise.reject(err)
  },
)

export default api
