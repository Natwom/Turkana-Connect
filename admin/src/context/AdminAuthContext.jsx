import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchAdmin()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAdmin = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me')
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
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    const res = await axios.post('/api/v1/auth/login', formData)
    const { access_token } = res.data
    localStorage.setItem('admin_token', access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    await fetchAdmin()
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    delete axios.defaults.headers.common['Authorization']
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
