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
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32"
      >
        <Outlet />
      </motion.main>
      
      {/* Bottom nav - fixed at very bottom */}
      <BottomNav />
      
      {/* Music player - fixed ABOVE the bottom nav */}
      <MusicPlayer />
    </div>
  )
}

export default Layout