import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Artists from './pages/Artists'
import Songs from './pages/Songs'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!admin) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="artists" element={<Artists />} />
        <Route path="songs" element={<Songs />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App