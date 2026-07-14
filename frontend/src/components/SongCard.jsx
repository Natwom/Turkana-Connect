import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import likesApi from '../api/likes'

const SongCard = ({ song, index = 0, queue = [], onOpenComments }) => {
  const navigate = useNavigate()
  const player = usePlayer()
  const { playSong, currentSong, isPlaying } = player || {}

  const { isAuthenticated } = useAuth()
  const isCurrentSong = currentSong?.id === song?.id

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
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    if (isLikeLoading) return
    setIsLikeLoading(true)
    try {
      if (isLiked) {
        await likesApi.unlikeSong(song.id)
        setIsLiked(false)
      } else {
        await likesApi.likeSong(song.id)
        setIsLiked(true)
      }
    } catch (err) {
      try {
        const res = await likesApi.checkLike(song.id)
        setIsLiked(res.data.liked)
      } catch (_) {}
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleCommentClick = (e) => {
    e.stopPropagation()
    if (onOpenComments) onOpenComments(song)
  }

  const handlePlay = () => {
    if (playSong && song) {
      playSong(song, queue.length > 0 ? queue : [song])
      navigate('/now-playing')
    }
  }

  const artistDisplay = song?.artist_name || song?.artist?.stage_name || 'Unknown Artist'

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
          src={song?.cover_url || '/default-cover.jpg'}
          alt={song?.title}
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
        {song?.title}
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
        <span className="text-xs text-gray-500">
          {song?.play_count?.toLocaleString() || 0} plays
        </span>
      </div>
    </motion.div>
  )
}

export default SongCard