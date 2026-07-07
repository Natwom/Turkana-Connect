import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Heart } from 'lucide-react'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../context/AuthContext'
import likesApi from '../api/likes'

const SongListItem = ({ song, index = 0, showAlbum = false }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()
  const { isAuthenticated } = useAuth()
  const isCurrentSong = currentSong?.id === song.id
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

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

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay()
    } else {
      playSong(song)
    }
  }

  const artistDisplay = song.artist_name || song.artist?.stage_name || 'Unknown Artist'
  const duration = song.duration 
    ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` 
    : '3:45'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
        isCurrentSong 
          ? 'bg-fuchsia-500/10 border border-fuchsia-500/20' 
          : 'hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      {/* Rank / Play indicator / Equalizer */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {isCurrentSong && isPlaying ? (
          <div className="flex gap-[2px] items-end h-4">
            <span className="w-[2px] bg-fuchsia-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '40%' }} />
            <span className="w-[2px] bg-fuchsia-400 rounded-full animate-[bounce_1.1s_infinite]" style={{ height: '80%' }} />
            <span className="w-[2px] bg-fuchsia-400 rounded-full animate-[bounce_0.6s_infinite]" style={{ height: '100%' }} />
            <span className="w-[2px] bg-fuchsia-400 rounded-full animate-[bounce_0.9s_infinite]" style={{ height: '60%' }} />
          </div>
        ) : isHovered ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            {isCurrentSong && !isPlaying ? (
              <Play className="w-4 h-4 text-fuchsia-400" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 text-white" fill="white" />
            )}
          </motion.div>
        ) : (
          <span className={`text-sm font-medium ${isCurrentSong ? 'text-fuchsia-400' : 'text-gray-500'}`}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={song.cover_url || '/default-cover.jpg'} 
          alt={song.title} 
          className={`w-full h-full object-cover transition-all ${isCurrentSong ? 'brightness-75' : ''}`}
        />
        {isHovered && !isCurrentSong && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm truncate transition-colors ${isCurrentSong ? 'text-fuchsia-400' : 'group-hover:text-white'}`}>
          {song.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{artistDisplay}</p>
      </div>

      {/* Album (optional) */}
      {showAlbum && song.album?.title && (
        <span className="hidden md:block text-xs text-gray-600 truncate max-w-[120px]">
          {song.album.title}
        </span>
      )}

      {/* Like */}
      <button 
        onClick={handleLikeToggle}
        disabled={isLikeLoading}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-400'
          }`} 
        />
      </button>

      {/* Duration */}
      <span className="text-xs text-gray-600 font-medium w-10 text-right">{duration}</span>
    </motion.div>
  )
}

export default SongListItem