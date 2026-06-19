import { motion } from 'framer-motion'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

const SongCard = ({ song, index = 0 }) => {
  const { playSong, currentSong, isPlaying } = usePlayer()
  const isCurrentSong = currentSong?.id === song.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative glass-card p-4 hover-lift cursor-pointer"
      onClick={() => playSong(song)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img 
          src={song.cover_url || '/default-cover.jpg'} 
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            {isCurrentSong && isPlaying ? (
              <div className="flex gap-0.5">
                <span className="w-1 h-4 bg-white animate-pulse" />
                <span className="w-1 h-4 bg-white animate-pulse delay-75" />
                <span className="w-1 h-4 bg-white animate-pulse delay-150" />
              </div>
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </div>
        </div>
      </div>
      
      <h3 className="font-semibold text-sm truncate mb-1 group-hover:text-primary transition-colors">
        {song.title}
      </h3>
      <p className="text-xs text-gray-400 truncate">{song.artist?.stage_name}</p>
      
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <Heart className="w-4 h-4 text-gray-400 hover:text-secondary" />
        </button>
        <span className="text-xs text-gray-500">{song.play_count?.toLocaleString()} plays</span>
      </div>
    </motion.div>
  )
}

export default SongCard