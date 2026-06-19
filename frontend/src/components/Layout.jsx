import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import MusicPlayer from './MusicPlayer'

const Layout = () => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top navbar with search */}
      <Navbar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto p-4 sm:p-6 pb-40"
        >
          <Outlet />
        </motion.main>
        
        {/* Music player above bottom nav */}
        <MusicPlayer />
        
        {/* Bottom navigation bar */}
        <BottomNav />
      </div>
    </div>
  )
}

export default Layout