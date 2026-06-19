import { motion } from 'framer-motion'
import { Play, TrendingUp } from 'lucide-react'

const HeroBanner = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-secondary/20 border border-white/5 p-8 md:p-12"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      
      <div className="relative z-10 max-w-2xl">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending Now
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
        >
          Discover the Sound of <span className="gradient-text">Turkana</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg mb-8 max-w-lg"
        >
          Stream the best Kenyan and Turkana music. Support local artists and explore authentic African rhythms.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <button className="btn-primary flex items-center gap-2">
            <Play className="w-5 h-5" />
            Start Listening
          </button>
          <button className="px-6 py-3 border border-white/20 hover:bg-white/5 rounded-xl font-semibold transition-all">
            Explore Artists
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default HeroBanner