import { createContext, useState, useCallback, useContext, useRef } from 'react'
import { recordPlay } from '../api/songs'

export const PlayerContext = createContext(null)

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [history, setHistory] = useState([]) // Track played songs for "previous"

  const playSong = useCallback((song, songQueue = []) => {
    // Build a proper queue: if songQueue provided, use it; otherwise just [song]
    const newQueue = songQueue.length > 0 ? songQueue : [song]
    
    // Find the index of the clicked song in the queue
    const index = newQueue.findIndex(s => s.id === song.id)
    const actualIndex = index >= 0 ? index : 0

    setCurrentSong(song)
    setQueue(newQueue)
    setCurrentIndex(actualIndex)
    setIsPlaying(true)
    // Add to history
    setHistory(prev => [...prev.slice(-49), song]) // Keep last 50

    // Record play
    if (song?.id) {
      recordPlay(song.id).catch((err) => {
        console.error('Failed to record play:', err)
      })
    }
  }, [])

  const playNext = useCallback(() => {
    if (queue.length === 0) return

    let nextIndex
    let nextSong

    if (isRepeat && queue.length === 1) {
      // Repeat single song: just restart it
      nextSong = queue[0]
      nextIndex = 0
    } else if (isShuffle) {
      // Shuffle: pick random different song
      const availableIndices = queue.map((_, i) => i).filter(i => i !== currentIndex)
      if (availableIndices.length === 0) {
        nextIndex = currentIndex
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      }
      nextSong = queue[nextIndex]
    } else {
      // Normal: go to next, wrap around if at end
      nextIndex = (currentIndex + 1) % queue.length
      nextSong = queue[nextIndex]
    }

    setCurrentIndex(nextIndex)
    setCurrentSong(nextSong)
    setIsPlaying(true)
    setHistory(prev => [...prev.slice(-49), nextSong])

    if (nextSong?.id) {
      recordPlay(nextSong.id).catch((err) => {
        console.error('Failed to record play (next):', err)
      })
    }
  }, [queue, currentIndex, isShuffle, isRepeat])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return

    let prevIndex
    let prevSong

    if (isShuffle && history.length > 1) {
      // In shuffle, go back through history
      const prevHistorySong = history[history.length - 2]
      const historyIndex = queue.findIndex(s => s.id === prevHistorySong?.id)
      if (historyIndex >= 0) {
        prevIndex = historyIndex
        prevSong = queue[historyIndex]
      } else {
        prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
        prevSong = queue[prevIndex]
      }
    } else {
      // Normal: go to previous, wrap to end if at start
      prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
      prevSong = queue[prevIndex]
    }

    setCurrentIndex(prevIndex)
    setCurrentSong(prevSong)
    setIsPlaying(true)

    if (prevSong?.id) {
      recordPlay(prevSong.id).catch((err) => {
        console.error('Failed to record play (prev):', err)
      })
    }
  }, [queue, currentIndex, isShuffle, history])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const addToQueue = useCallback((song) => {
    setQueue(prev => {
      // Don't add duplicates
      if (prev.find(s => s.id === song.id)) return prev
      return [...prev, song]
    })
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentIndex(0)
    setHistory([])
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, queue, currentIndex, isShuffle, isRepeat, history,
      playSong, playNext, playPrevious, togglePlay, addToQueue, clearQueue,
      setIsShuffle, setIsRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)