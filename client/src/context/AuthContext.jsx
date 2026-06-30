import { createContext, useContext, useEffect, useState } from 'react'
import api, { API_BASE_URL } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    // Full URL — the OAuth redirect must land on the backend origin directly.
    window.location.href = `${API_BASE_URL}/api/auth/github`
  }

  const logout = async () => {
    await api.get('/auth/logout')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
