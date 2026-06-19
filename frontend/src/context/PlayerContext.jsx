import { createContext, useState, useCallback, useContext } from 'react'

export const PlayerContext = createContext(null)

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const playSong = useCallback((song, songQueue = []) => {
    setCurrentSong(song)
    setQueue(songQueue.length > 0 ? songQueue : [song])
    setCurrentIndex(0)
    setIsPlaying(true)
  }, [])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    let nextIndex
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }
    setCurrentIndex(nextIndex)
    setCurrentSong(queue[nextIndex])
  }, [queue, currentIndex, isShuffle])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    setCurrentIndex(prevIndex)
    setCurrentSong(queue[prevIndex])
  }, [queue, currentIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song])
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, queue, isShuffle, isRepeat,
      playSong, playNext, playPrevious, togglePlay, addToQueue,
      setIsShuffle, setIsRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

// Re-export usePlayer so components can import it from context directly
export const usePlayer = () => useContext(PlayerContext)