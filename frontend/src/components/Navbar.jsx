import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Music2, Check, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../api'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const res = await notificationsApi.getNotifications()
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif.id)
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        )
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
    setShowDropdown(false)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'like': return 'bg-pink-500'
      case 'follow': return 'bg-blue-500'
      case 'comment': return 'bg-green-500'
      case 'approval': return 'bg-purple-500'
      case 'new_release': return 'bg-orange-500'
      case 'admin_alert': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto sm:max-w-none">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Apiaro</span>
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
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-secondary text-white text-[10px] font-bold rounded-full ring-2 ring-background animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Mark all read
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-gray-500">
                      <Bell className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0 ${
                          !notif.is_read ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${getTypeColor(notif.type)}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white leading-snug">
                              {notif.title}
                            </p>
                            {notif.message && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatTime(notif.created_at)}
                              {notif.is_read && (
                                <span className="ml-auto flex items-center gap-0.5 text-gray-600">
                                  <Check className="w-3 h-3" /> Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
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