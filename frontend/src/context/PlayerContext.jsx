import { createContext, useState, useCallback, useContext, useRef, useEffect } from 'react'
import { recordPlay } from '../api/songs'

export const PlayerContext = createContext(null)

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [history, setHistory] = useState([])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState(false)

  // Audio ref lives HERE in context so it persists across route changes
  const audioRef = useRef(null)

  // Only record play if user is authenticated (token exists)
  const safeRecordPlay = useCallback((songId) => {
    if (songId && localStorage.getItem('token')) {
      recordPlay(songId).catch(() => {
        // Silently fail — don't break playback if analytics fail
      })
    }
  }, [])

  const playSong = useCallback((song, songQueue = []) => {
    if (!song) return

    const newQueue = songQueue.length > 0 ? songQueue : [song]
    const index = newQueue.findIndex((s) => s.id === song.id)
    const actualIndex = index >= 0 ? index : 0

    setCurrentSong(song)
    setQueue(newQueue)
    setCurrentIndex(actualIndex)
    setIsPlaying(true)
    setAudioError(false)
    setProgress(0)
    setDuration(0)
    setHistory((prev) => [...prev.slice(-49), song])

    safeRecordPlay(song.id)
  }, [safeRecordPlay])

  const playNext = useCallback(() => {
    if (queue.length === 0) return

    let nextIndex
    let nextSong

    if (isRepeat && queue.length === 1) {
      nextSong = queue[0]
      nextIndex = 0
    } else if (isShuffle) {
      const availableIndices = queue
        .map((_, i) => i)
        .filter((i) => i !== currentIndex)
      if (availableIndices.length === 0) {
        nextIndex = currentIndex
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      }
      nextSong = queue[nextIndex]
    } else {
      nextIndex = (currentIndex + 1) % queue.length
      nextSong = queue[nextIndex]
    }

    setCurrentIndex(nextIndex)
    setCurrentSong(nextSong)
    setIsPlaying(true)
    setAudioError(false)
    setProgress(0)
    setDuration(0)
    setHistory((prev) => [...prev.slice(-49), nextSong])

    safeRecordPlay(nextSong?.id)
  }, [queue, currentIndex, isShuffle, isRepeat, safeRecordPlay])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return

    let prevIndex
    let prevSong

    if (isShuffle && history.length > 1) {
      const prevHistorySong = history[history.length - 2]
      const historyIndex = queue.findIndex((s) => s.id === prevHistorySong?.id)
      if (historyIndex >= 0) {
        prevIndex = historyIndex
        prevSong = queue[historyIndex]
      } else {
        prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
        prevSong = queue[prevIndex]
      }
    } else {
      prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
      prevSong = queue[prevIndex]
    }

    setCurrentIndex(prevIndex)
    setCurrentSong(prevSong)
    setIsPlaying(true)
    setAudioError(false)
    setProgress(0)
    setDuration(0)

    safeRecordPlay(prevSong?.id)
  }, [queue, currentIndex, isShuffle, history, safeRecordPlay])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const addToQueue = useCallback((song) => {
    if (!song) return
    setQueue((prev) => {
      if (prev.find((s) => s.id === song.id)) return prev
      return [...prev, song]
    })
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentIndex(0)
    setHistory([])
  }, [])

  // Audio element effect — loads new song when currentSong changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return

    const API_BASE = import.meta.env.VITE_API_URL || 'https://turkana-connect-api.onrender.com'
    const normalizeUrl = (path) => {
      if (!path) return ''
      if (path.startsWith('http')) return path
      const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      return `${base}${cleanPath}`
    }

    const audioUrl = normalizeUrl(currentSong.audio_url)
    console.log('Loading audio:', audioUrl)

    audioRef.current.src = audioUrl
    audioRef.current.load()

    if (isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Audio play failed:', err)
          setAudioError(true)
        })
      }
    }
  }, [currentSong])

  // Play/pause effect
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Audio play failed:', err)
          setAudioError(true)
        })
      }
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }, [])

  // Ended handler
  const handleEnded = useCallback(() => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.error('Repeat play failed:', err)
        })
      }
    } else {
      playNext()
    }
  }, [isRepeat, playNext])

  // Error handler
  const handleAudioError = useCallback(() => {
    console.error('Audio element error')
    setAudioError(true)
  }, [])

  // Seek function
  const seek = useCallback((time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }, [])

  // Volume function
  const setVolume = useCallback((vol) => {
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        isShuffle,
        isRepeat,
        history,
        progress,
        duration,
        audioError,
        audioRef,
        playSong,
        playNext,
        playPrevious,
        togglePlay,
        addToQueue,
        clearQueue,
        setIsShuffle,
        setIsRepeat,
        handleTimeUpdate,
        handleEnded,
        handleAudioError,
        seek,
        setVolume,
      }}
    >
      {/* Hidden audio element that persists across all routes */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onError={handleAudioError}
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: 'none' }}
      />
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)