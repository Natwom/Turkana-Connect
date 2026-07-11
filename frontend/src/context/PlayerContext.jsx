import { createContext, useState, useCallback, useContext } from 'react'
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
        playSong,
        playNext,
        playPrevious,
        togglePlay,
        addToQueue,
        clearQueue,
        setIsShuffle,
        setIsRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)