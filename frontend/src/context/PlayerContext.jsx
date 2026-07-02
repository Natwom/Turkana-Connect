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

  // Track which song IDs we've already recorded a play for
  // so pausing/resuming the same song doesn't spam the API
  const recordedRef = useRef(new Set())

  const playSong = useCallback((song, songQueue = []) => {
    const isNewSong = currentSong?.id !== song.id

    setCurrentSong(song)
    setQueue(songQueue.length > 0 ? songQueue : [song])
    setCurrentIndex(0)
    setIsPlaying(true)

    // Only record a play when the song actually changes
    if (isNewSong && song?.id) {
      // Fire-and-forget: don't block playback if the API is slow
      recordPlay(song.id).catch((err) => {
        console.error('Failed to record play:', err)
      })
    }
  }, [currentSong])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    let nextIndex
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }
    const nextSong = queue[nextIndex]
    setCurrentIndex(nextIndex)
    setCurrentSong(nextSong)
    setIsPlaying(true)

    // Record play for next song
    if (nextSong?.id) {
      recordPlay(nextSong.id).catch((err) => {
        console.error('Failed to record play (next):', err)
      })
    }
  }, [queue, currentIndex, isShuffle])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    const prevSong = queue[prevIndex]
    setCurrentIndex(prevIndex)
    setCurrentSong(prevSong)
    setIsPlaying(true)

    // Record play for previous song
    if (prevSong?.id) {
      recordPlay(prevSong.id).catch((err) => {
        console.error('Failed to record play (prev):', err)
      })
    }
  }, [queue, currentIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song])
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, queue, currentIndex, isShuffle, isRepeat,
      playSong, playNext, playPrevious, togglePlay, addToQueue,
      setIsShuffle, setIsRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)