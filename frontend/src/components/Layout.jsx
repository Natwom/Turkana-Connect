import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import MusicPlayer from './MusicPlayer'

const Layout = () => {
  const location = useLocation()
  const isNowPlaying = location.pathname === '/now-playing'

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top navbar - hidden when Now Playing is open */}
      {!isNowPlaying && <Navbar />}

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isNowPlaying ? 'pb-0' : 'pb-36'}`}
      >
        <Outlet />
      </motion.main>

      {/* Bottom nav - hidden when Now Playing is open */}
      {!isNowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNav />
        </div>
      )}

      {/* Music player - ALWAYS mounted so audio persists, but hidden visually when Now Playing */}
      <div className={`fixed left-0 right-0 z-50 ${isNowPlaying ? 'bottom-0' : 'bottom-[72px]'}`}>
        <MusicPlayer />
      </div>
    </div>
  )
}

export default Layout