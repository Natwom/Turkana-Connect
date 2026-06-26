import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchAdmin()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAdmin = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res.data.role !== 'admin') {
        throw new Error('Not an admin')
      }
      setAdmin(res.data)
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)

    const res = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const { access_token } = res.data
    localStorage.setItem('admin_token', access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    await fetchAdmin()
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common['Authorization']
    setAdmin(null)
    window.location.href = '/login'
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}