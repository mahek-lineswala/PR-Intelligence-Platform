import axios from 'axios'

// In dev, this is empty so requests go through Vite's proxy to localhost:3000.
// In production, set VITE_API_URL on Vercel to the Render backend URL,
// e.g. https://pr-intelligence-api.onrender.com
const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
})

export const API_BASE_URL = API_BASE

export default api
