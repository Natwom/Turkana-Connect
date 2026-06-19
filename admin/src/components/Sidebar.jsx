import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Music, Disc, AlertTriangle, BarChart3, Settings, Shield, LogOut } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

const Sidebar = () => {
  const { admin, logout } = useAdminAuth()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/artists', icon: Users, label: 'Artists' },
    { to: '/songs', icon: Music, label: 'Songs' },
    { to: '/users', icon: Disc, label: 'Users' },
    { to: '/reports', icon: AlertTriangle, label: 'Reports' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-card border-r border-white/5 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin</h1>
            <p className="text-xs text-gray-400">Turkana Music Hub</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
          }>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {admin?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin?.full_name || admin?.username}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
