import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import MusicPlayer from './MusicPlayer'

const Layout = () => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top navbar */}
      <Navbar />

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-36"
      >
        <Outlet />
      </motion.main>

      {/* Bottom nav - fixed at very bottom (z-40) */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>

      {/* Music player - fixed ABOVE the bottom nav (z-50) */}
      <div className="fixed bottom-[72px] left-0 right-0 z-50">
        <MusicPlayer />
      </div>
    </div>
  )
}

export default Layout