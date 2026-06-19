import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Music2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto sm:max-w-none">
        {/* Logo - visible on all screens */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Turkana</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
          
          {user ? (
            <Link to="/settings" className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              {user.username?.[0]?.toUpperCase()}
            </Link>
          ) : (
            <Link to="/login" className="px-3 py-1.5 bg-primary rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar