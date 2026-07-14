import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ChevronDown,
  Heart,
  Share2,
  ListMusic,
  Volume2,
  VolumeX,
  MoreHorizontal,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import likesApi from '../api/likes'

const API_BASE = import.meta.env.VITE_API_URL || 'https://turkana-connect-api.onrender.com'

const normalizeUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

const getImageUrl = (path) => normalizeUrl(path) || '/default-cover.jpg'

const NowPlaying = () => {
  const navigate = useNavigate()
  const player = usePlayer() || {}
  const { isAuthenticated } = useAuth()
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    queue,
    currentIndex,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat,
    progress,
    duration,
    audioError,
    seek,
    setVolume: setAudioVolume,
  } = player

  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !currentSong?.id) {
      setIsLiked(false)
      return
    }
    const checkLikeStatus = async () => {
      try {
        const res = await likesApi.checkLike(currentSong.id)
        setIsLiked(res.data.liked)
      } catch (err) {
        setIsLiked(false)
      }
    }
    checkLikeStatus()
  }, [currentSong?.id, isAuthenticated])

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    if (!currentSong?.id || isLikeLoading) return

    setIsLikeLoading(true)
    try {
      if (isLiked) {
        await likesApi.unlikeSong(currentSong.id)
        setIsLiked(false)
      } else {
        await likesApi.likeSong(currentSong.id)
        setIsLiked(true)
      }
    } catch (err) {
      try {
        const res = await likesApi.checkLike(currentSong.id)
        setIsLiked(res.data.liked)
      } catch (_) {}
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * (duration || 0)
    seek?.(time)
  }

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    setAudioVolume?.(isMuted ? 0 : newVol)
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    setAudioVolume?.(newMuted ? 0 : volume)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayFromQueue = (song) => {
    if (player?.playSong) {
      player.playSong(song, queue)
    }
  }

  if (!currentSong) {
    navigate('/')
    return null
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0
  const artistName = currentSong.artist_name || currentSong.artist?.stage_name || 'Unknown Artist'

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] flex flex-col overflow-hidden"
    >
      {/* Background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-medium">Now Playing</p>
        </div>
        <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Album Art */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 min-h-0">
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.03, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div 
            className="absolute inset-0 rounded-3xl blur-2xl opacity-30 scale-110"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
          />
          <img
            src={getImageUrl(currentSong.cover_url)}
            alt={currentSong.title}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl shadow-2xl object-cover"
            onError={(e) => { e.target.src = '/default-cover.jpg' }}
          />
        </motion.div>
      </div>

      {/* Song Info */}
      <div className="relative z-10 px-8 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <motion.h2 
              key={currentSong.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold truncate mb-1"
            >
              {currentSong.title}
            </motion.h2>
            <motion.p 
              key={artistName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg truncate"
            >
              {artistName}
            </motion.p>
            {audioError && (
              <p className="text-sm text-red-400 mt-1">Failed to load audio</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`}
              />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <Share2 className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 px-8 py-2">
        <div 
          className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
          onClick={handleSeek}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div 
              className="h-full w-3 bg-white rounded-full shadow-lg absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-6 py-6">
        <button
          onClick={() => setIsShuffle?.(!isShuffle)}
          className={`p-3 rounded-full transition-all ${
            isShuffle ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>
        <button
          onClick={playPrevious}
          className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <SkipBack className="w-7 h-7" />
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/10"
        >
          {isPlaying ? (
            <Pause className="w-9 h-9 text-black" />
          ) : (
            <Play className="w-9 h-9 text-black ml-1" />
          )}
        </motion.button>
        <button
          onClick={playNext}
          className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <SkipForward className="w-7 h-7" />
        </button>
        <button
          onClick={() => setIsRepeat?.(!isRepeat)}
          className={`p-3 rounded-full transition-all ${
            isRepeat ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 flex items-center justify-between px-8 pb-8">
        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            showQueue ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-sm font-medium">Queue</span>
          {queue?.length > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">
              {queue.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="p-4 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 px-2">Up Next</h3>
              {queue?.length === 0 ? (
                <p className="text-sm text-gray-500 px-2">Queue is empty</p>
              ) : (
                <div className="space-y-1">
                  {queue.map((song, i) => {
                    const isActive = i === currentIndex
                    return (
                      <button
                        key={`${song.id}-${i}`}
                        onClick={() => handlePlayFromQueue(song)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-white/10' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(song.cover_url)}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/default-cover.jpg' }}
                          />
                          {isActive && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="flex gap-0.5">
                                <span className="w-0.5 h-3 bg-primary animate-pulse" />
                                <span className="w-0.5 h-3 bg-primary animate-pulse delay-75" />
                                <span className="w-0.5 h-3 bg-primary animate-pulse delay-150" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-medium truncate ${
                            isActive ? 'text-primary' : 'text-white'
                          }`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {song.artist_name || song.artist?.stage_name || 'Unknown Artist'}
                          </p>
                        </div>
                        {isActive && (
                          <span className="text-xs text-primary font-medium">Now Playing</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default NowPlaying