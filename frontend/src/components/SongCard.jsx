import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Heart, MessageCircle } from 'lucide-react'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../context/AuthContext'
import likesApi from '../api/likes'

const SongCard = ({ song, index = 0, onOpenComments, compact = false, showRank = false }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()
  const { isAuthenticated } = useAuth()
  const isCurrentSong = currentSong?.id === song.id
  
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !song?.id) return
    const checkLikeStatus = async () => {
      try {
        const res = await likesApi.checkLike(song.id)
        setIsLiked(res.data.liked)
      } catch (err) {}
    }
    checkLikeStatus()
  }, [song?.id, isAuthenticated])

  const handleLikeToggle = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (isLikeLoading) return
    setIsLikeLoading(true)
    try {
      if (isLiked) { await likesApi.unlikeSong(song.id); setIsLiked(false) }
      else { await likesApi.likeSong(song.id); setIsLiked(true) }
    } catch (err) {
      try { const res = await likesApi.checkLike(song.id); setIsLiked(res.data.liked) } catch (_) {}
    } finally { setIsLikeLoading(false) }
  }

  const handleCommentClick = (e) => {
    e.stopPropagation()
    if (onOpenComments) onOpenComments(song)
  }

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay()
    } else {
      playSong(song)
    }
  }

  const artistDisplay = song.artist_name || song.artist?.stage_name || 'Unknown Artist'

  // ============ COMPACT MODE (Home grids) ============
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlay}
        className="group cursor-pointer"
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
          <img 
            src={song.cover_url || '/default-cover.jpg'} 
            alt={song.title}
            className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${isCurrentSong ? 'brightness-75' : ''}`}
          />
          
          {/* Animated equalizer when playing */}
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex gap-[3px] items-end h-6">
                <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '40%' }} />
                <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_1.1s_infinite]" style={{ height: '80%' }} />
                <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.6s_infinite]" style={{ height: '100%' }} />
                <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.9s_infinite]" style={{ height: '60%' }} />
              </div>
            </div>
          )}
          
          {/* Hover play/pause button */}
          <AnimatePresence>
            {isHovered && !(isCurrentSong && isPlaying) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  {isCurrentSong && !isPlaying ? (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Rank badge (trending) */}
          {showRank && !isCurrentSong && (
            <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-white">{index + 1}</span>
            </div>
          )}
          
          {/* Now playing badge */}
          {isCurrentSong && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-fuchsia-600/90 backdrop-blur-sm rounded-md">
              <span className="text-[9px] font-bold text-white uppercase">Now Playing</span>
            </div>
          )}
        </div>
        
        <h3 className={`font-semibold text-sm truncate mb-0.5 transition-colors ${isCurrentSong ? 'text-fuchsia-400' : 'group-hover:text-primary'}`}>
          {song.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{artistDisplay}</p>
      </motion.div>
    )
  }

  // ============ FULL MODE (Search results) ============
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative glass-card p-4 hover-lift cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img 
          src={song.cover_url || '/default-cover.jpg'} 
          alt={song.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isCurrentSong ? 'brightness-75' : ''}`}
        />
        
        {/* Animated equalizer when playing */}
        {isCurrentSong && isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex gap-[3px] items-end h-8">
              <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '40%' }} />
              <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_1.1s_infinite]" style={{ height: '80%' }} />
              <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.6s_infinite]" style={{ height: '100%' }} />
              <span className="w-[3px] bg-fuchsia-400 rounded-full animate-[bounce_0.9s_infinite]" style={{ height: '60%' }} />
            </div>
          </div>
        )}
        
        {/* Hover play/pause overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            {isCurrentSong && isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </div>
        </div>
        
        {/* Now playing badge */}
        {isCurrentSong && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-fuchsia-600/90 backdrop-blur-sm rounded-md">
            <span className="text-[10px] font-bold text-white uppercase">Now Playing</span>
          </div>
        )}
      </div>
      
      <h3 className={`font-semibold text-sm truncate mb-1 transition-colors ${isCurrentSong ? 'text-fuchsia-400' : 'group-hover:text-primary'}`}>
        {song.title}
      </h3>
      <p className="text-xs text-gray-400 truncate">{artistDisplay}</p>
      
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
              }`} 
            />
          </button>
          <button 
            onClick={handleCommentClick}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-gray-400 hover:text-violet-400 transition-colors" />
          </button>
        </div>
        <span className="text-xs text-gray-500">{song.play_count?.toLocaleString()} plays</span>
      </div>
    </motion.div>
  )
}

export default SongCard