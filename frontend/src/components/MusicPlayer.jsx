import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, 
  Repeat, Volume2, VolumeX, ListMusic, Heart 
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import likesApi from '../api/likes'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getAudioUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

const getImageUrl = (path) => {
  if (!path) return '/default-cover.jpg'
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

const MusicPlayer = () => {
  const player = usePlayer() || {}
  const { isAuthenticated } = useAuth()
  const { settings } = useSettings()
  const { 
    currentSong, isPlaying, togglePlay, playNext, 
    playPrevious, isShuffle, setIsShuffle, isRepeat, setIsRepeat 
  } = player
  
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (settings.normalize_volume) {
      setVolume(0.7)
    }
  }, [settings.normalize_volume])

  const handleEnded = () => {
    if (settings.autoplay) {
      playNext?.()
    } else {
      togglePlay?.()
    }
  }

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

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audioUrl = getAudioUrl(currentSong.audio_url)
      console.log('Loading audio:', audioUrl)
      setAudioError(false)
      audioRef.current.src = audioUrl
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play failed:', err)
          setAudioError(true)
        })
      }
    }
  }, [currentSong])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play failed:', err)
          setAudioError(true)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const handleAudioError = (e) => {
    console.error('Audio element error:', e)
    setAudioError(true)
  }

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
      console.error('Like toggle failed:', err)
      try {
        const res = await likesApi.checkLike(currentSong.id)
        setIsLiked(res.data.liked)
      } catch (_) {}
    } finally {
      setIsLikeLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentSong) return null

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-[72px] left-0 right-0 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/10 z-50 px-4 py-3 md:px-6 md:py-4"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onError={handleAudioError}
        crossOrigin="anonymous"
      />

      <div className="flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <img 
            src={getImageUrl(currentSong.cover_url)} 
            alt={currentSong.title}
            className="w-14 h-14 rounded-xl object-cover shadow-lg"
            onError={(e) => { e.target.src = '/default-cover.jpg' }}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
            {/* FIX: Use artist_name first, then artist?.stage_name, then fallback */}
            <p className="text-xs text-gray-400 truncate">
              {currentSong.artist_name || currentSong.artist?.stage_name || 'Unknown Artist'}
            </p>
            {audioError && (
              <p className="text-xs text-red-400">Failed to load audio</p>
            )}
          </div>
          <button 
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isLiked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-400 hover:text-red-400'
              }`} 
            />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsShuffle?.(!isShuffle)}
              className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={() => playPrevious?.()} className="p-2 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => togglePlay?.()}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-background" />
              ) : (
                <Play className="w-5 h-5 text-background ml-0.5" />
              )}
            </button>
            <button onClick={() => playNext?.()} className="p-2 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsRepeat?.(!isRepeat)}
              className={`p-2 rounded-lg transition-colors ${isRepeat ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full max-w-md flex items-center gap-3">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-surface rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div 
                className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Queue */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ListMusic className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
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
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-surface rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MusicPlayer