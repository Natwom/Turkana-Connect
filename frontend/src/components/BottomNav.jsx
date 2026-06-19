import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

// ═══════════════════════════════════════════════════════════════
// UNIQUE CUSTOM SVG ICONS — Not from any icon library
// ═══════════════════════════════════════════════════════════════

const HomeIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5" />
    <path d="M19 10v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9" />
    <circle cx="12" cy="14" r="2" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
  </svg>
)

const SearchIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
    {isActive && <circle cx="11" cy="11" r="3" fill="currentColor" opacity="0.3" />}
  </svg>
)

const CategoriesIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
  </svg>
)

const HeartIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    {isActive && <path d="M12 8l-1 2h2l-1 2" stroke="none" fill="white" opacity="0.5" />}
  </svg>
)

const ProfileIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    {isActive && <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.4" />}
  </svg>
)

const UploadIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V3" />
    <path d="M7 8l5-5 5 5" />
    <rect x="3" y="14" width="18" height="7" rx="2" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.2 : 0} />
    <path d="M8 17h8" strokeWidth="1.5" opacity={isActive ? 0.5 : 0} />
  </svg>
)

const MicIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
    {isActive && <circle cx="12" cy="9" r="1.5" fill="currentColor" opacity="0.5" />}
  </svg>
)

const SettingsIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 0} />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

// ═══════════════════════════════════════════════════════════════
// BOTTOM NAV COMPONENT
// ═══════════════════════════════════════════════════════════════

const BottomNav = () => {
  const { user } = useAuth()
  const location = useLocation()

  // Base nav items for all users (max 5 for mobile)
  const baseNavItems = [
    { to: '/', icon: HomeIcon, label: 'Home' },
    { to: '/search', icon: SearchIcon, label: 'Search' },
    { to: '/categories', icon: CategoriesIcon, label: 'Browse' },
    { to: '/playlist/liked', icon: HeartIcon, label: 'Liked' },
    { to: '/profile', icon: ProfileIcon, label: 'Profile' },
  ]

  // Artist-only items (replace "Liked" with "Upload" for artists)
  const artistNavItems = (user?.role === 'artist' || user?.role === 'admin')
    ? [
        { to: '/', icon: HomeIcon, label: 'Home' },
        { to: '/search', icon: SearchIcon, label: 'Search' },
        { to: '/categories', icon: CategoriesIcon, label: 'Browse' },
        { to: '/upload-song', icon: UploadIcon, label: 'Upload' },
        { to: '/profile', icon: ProfileIcon, label: 'Profile' },
      ]
    : baseNavItems

  // Non-artist: add "Become Artist" in a secondary menu or keep as-is
  // For bottom nav, we keep it clean with 5 items max
  const navItems = artistNavItems

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/5 safe-area-pb"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to))
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]"
            >
              {({ isActive: navActive }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`transition-colors duration-200 ${
                      navActive ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    <item.icon isActive={navActive} />
                  </motion.div>
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${
                    navActive ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                  {navActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
      
      {/* Active indicator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.nav>
  )
}

export default BottomNav