import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, 
  Repeat, Volume2, VolumeX, ListMusic, Heart 
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

const MusicPlayer = () => {
  const player = usePlayer() || {}
  const { 
    currentSong, isPlaying, togglePlay, playNext, 
    playPrevious, isShuffle, setIsShuffle, isRepeat, setIsRepeat 
  } = player
  
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audio_url
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }, [currentSong])

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause()
    }
  }, [isPlaying])

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
      className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card/95 backdrop-blur-2xl border-t border-white/10 z-50 px-6 py-4"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => playNext?.()}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <img 
            src={currentSong.cover_url || '/default-cover.jpg'} 
            alt={currentSong.title}
            className="w-14 h-14 rounded-xl object-cover shadow-lg"
            onError={(e) => { e.target.src = '/default-cover.jpg' }}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist?.stage_name}</p>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Heart className="w-4 h-4 text-gray-400" />
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