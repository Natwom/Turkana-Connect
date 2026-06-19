import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, Search, User, Heart, 
  Settings, Disc, LogOut, Music2, Mic2, Upload
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()

  // Base nav items for all users
  const baseNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/categories', icon: Disc, label: 'Categories' },
    { to: '/playlist/liked', icon: Heart, label: 'Liked Songs' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  // Artist-only items
  const artistNavItems = (user?.role === 'artist' || user?.role === 'admin')
    ? [{ to: '/upload-song', icon: Upload, label: 'Upload Song' }]
    : []

  // Non-artist users who want to apply
  const applyNavItems = (!user || (user?.role !== 'artist' && user?.role !== 'admin'))
    ? [{ to: '/become-artist', icon: Mic2, label: 'Become Artist' }]
    : []

  // Combine all nav items
  const navItems = [...baseNavItems, ...artistNavItems, ...applyNavItems]

  return (
    <motion.aside 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="w-64 bg-card/50 backdrop-blur-xl border-r border-white/5 flex flex-col hidden lg:flex"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Turkana</h1>
            <p className="text-xs text-gray-400">Music Hub</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="px-4 py-2 bg-primary rounded-lg text-center block text-sm font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </NavLink>
        )}
      </div>
    </motion.aside>
  )
}

export default Sidebar