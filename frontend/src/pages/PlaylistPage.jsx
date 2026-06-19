import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Clock, 
  Music, 
  Heart, 
  MoreHorizontal, 
  Share2, 
  Plus,
  ListMusic,
  Shuffle,
  Repeat,
  Download,
  Volume2,
  ArrowLeft,
  GripVertical
} from 'lucide-react'
import axios from 'axios'
import { usePlayer } from '../context/PlayerContext'

const PlaylistPage = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [showOptionsMenu, setShowOptionsMenu] = useState(null)
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()
  const containerRef = useRef(null)
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 200], [0, 1])
  const headerY = useTransform(scrollY, [0, 200], [-60, 0])

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`/api/v1/playlists/${id}`)
        setPlaylist(res.data)
      } catch (err) {
        console.error('Failed to fetch playlist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [id])

  const handlePlayAll = () => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs)
    }
  }

  const handlePlaySong = (song, index) => {
    if (currentSong?.id === song.id && isPlaying) {
      togglePlay()
    } else {
      playSong(song, playlist?.songs)
    }
  }

  const totalDuration = playlist?.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading playlist...</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
          <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
            <ListMusic className="w-10 h-10 text-gray-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
        <p className="text-gray-500 mb-6">This playlist may have been removed or doesn't exist.</p>
        <Link to="/">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all"
          >
            Go Home
          </motion.button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20" ref={containerRef}>
      {/* Sticky Header */}
      <motion.div 
        style={{ opacity: headerOpacity, y: headerY }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-3"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Playlist</p>
            <h2 className="text-sm font-bold text-white truncate">{playlist.name}</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayAll}
            className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20"
          >
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[400px] bg-gradient-to-b from-violet-900/20 via-fuchsia-900/10 to-[#0a0a0f] pointer-events-none" />
        
        <div className="relative px-4 pt-8 pb-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row gap-6 md:gap-8 items-end"
            >
              {/* Playlist Cover */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
                  {playlist.cover_url ? (
                    <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Music className="w-20 h-20 text-white/40" />
                      <div className="w-16 h-1 bg-white/20 rounded-full" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-fuchsia-600 flex items-center justify-center shadow-xl"
                    >
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Playlist Info */}
              <div className="flex-1 pb-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-xs font-medium text-fuchsia-400">
                      {playlist.is_public ? 'Public' : 'Private'}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/[0.08] rounded-full text-xs font-medium text-gray-400">
                      {playlist.songs?.length || 0} songs
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{playlist.name}</h1>
                  
                  <p className="text-gray-400 mb-4 max-w-xl leading-relaxed">
                    {playlist.description || 'A curated collection of amazing tracks. Press play to start listening.'}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                    <Link to={`/user/${playlist.user?.username}`} className="flex items-center gap-2 hover:text-fuchsia-400 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                        {playlist.user?.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-300">{playlist.user?.username}</span>
                    </Link>
                    <span>•</span>
                    <span>{formatDuration(totalDuration)} total</span>
                    <span>•</span>
                    <span>{new Date(playlist.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayAll}
                      className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-300"
                    >
                      <Play className="w-5 h-5" fill="white" />
                      Play All
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isLiked 
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                          : 'bg-white/5 border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-4 mt-6">
        <div className="max-w-5xl mx-auto">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.08] text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-14 bg-[#0a0a0f]/95 backdrop-blur-sm z-30">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Title</span>
            <span className="w-32 hidden md:block">Artist</span>
            <span className="w-24 hidden md:block">Album</span>
            <span className="w-20 text-right">Duration</span>
            <span className="w-12"></span>
          </div>

          {/* Songs */}
          <div className="space-y-1 mt-2">
            <AnimatePresence>
              {playlist.songs?.map((song, i) => {
                const isCurrentSong = currentSong?.id === song.id
                const isHovered = hoveredRow === i

                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isCurrentSong 
                        ? 'bg-white/[0.05] border border-fuchsia-500/20' 
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                    onClick={() => handlePlaySong(song, i)}
                  >
                    {/* Number / Play Button */}
                    <div className="w-8 text-center relative">
                      <AnimatePresence mode="wait">
                        {isCurrentSong && isPlaying ? (
                          <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-0.5"
                          >
                            {[0, 1, 2].map((bar) => (
                              <motion.div
                                key={bar}
                                animate={{ height: [4, 16, 4] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: bar * 0.1 }}
                                className="w-1 bg-fuchsia-500 rounded-full"
                              />
                            ))}
                          </motion.div>
                        ) : (
                          <motion.span
                            key="number"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-sm ${isCurrentSong ? 'text-fuchsia-400' : 'text-gray-500'} group-hover:hidden`}
                          >
                            {i + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <div className={`absolute inset-0 flex items-center justify-center ${isCurrentSong && isPlaying ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        {isCurrentSong && isPlaying ? (
                          <Pause className="w-4 h-4 text-fuchsia-400" />
                        ) : (
                          <Play className="w-4 h-4 text-white" fill="white" />
                        )}
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a2e] flex-shrink-0 relative group/img">
                        <img 
                          src={song.cover_url || '/default-cover.jpg'} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-fuchsia-400' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate md:hidden">{song.artist?.stage_name}</p>
                      </div>
                    </div>

                    {/* Artist */}
                    <div className="w-32 hidden md:block text-sm text-gray-400 truncate">
                      <Link to={`/artist/${song.artist?.id}`} className="hover:text-fuchsia-400 transition-colors" onClick={e => e.stopPropagation()}>
                        {song.artist?.stage_name}
                      </Link>
                    </div>

                    {/* Album */}
                    <div className="w-32 hidden md:block text-sm text-gray-500 truncate">
                      {song.album?.title || '—'}
                    </div>

                    {/* Duration */}
                    <div className="w-20 text-right text-sm text-gray-500 flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked) }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'text-red-400 opacity-100' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <span>{formatDuration(song.duration)}</span>
                    </div>

                    {/* Options */}
                    <div className="w-12 relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowOptionsMenu(showOptionsMenu === i ? null : i) }}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      <AnimatePresence>
                        {showOptionsMenu === i && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add to Playlist
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                              <Download className="w-4 h-4" /> Download
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {(!playlist.songs || playlist.songs.length === 0) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
                <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No songs yet</h3>
              <p className="text-gray-500 mb-6">Start adding songs to build your perfect playlist.</p>
              <Link to="/search">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all"
                >
                  Discover Songs
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default PlaylistPage