import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search as SearchIcon, 
  Disc, 
  Users, 
  Music, 
  ListMusic, 
  X, 
  TrendingUp, 
  Clock,
  Play,
  Heart,
  MoreHorizontal,
  Filter
} from 'lucide-react'
import axios from 'axios'
import SongCard from '../components/SongCard'
import { usePlayer } from '../context/PlayerContext'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState({ songs: [], artists: [], albums: [], playlists: [] })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { playSong } = usePlayer()
  const inputRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const saveRecentSearch = (term) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const performSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/v1/search?q=${encodeURIComponent(q)}`)
      setResults(res.data)
      saveRecentSearch(q)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchParams({})
    setResults({ songs: [], artists: [], albums: [], playlists: [] })
    inputRef.current?.focus()
  }

  const removeRecentSearch = (term, e) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon, count: null },
    { id: 'songs', label: 'Songs', icon: Music, count: 'songs' },
    { id: 'artists', label: 'Artists', icon: Users, count: 'artists' },
    { id: 'albums', label: 'Albums', icon: Disc, count: 'albums' },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: 'playlists' },
  ]

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || 
                     results.albums.length > 0 || results.playlists.length > 0

  const totalResults = results.songs.length + results.artists.length + results.albums.length + results.playlists.length

  // Trending searches (mock data - replace with API call)
  const trendingSearches = ['Afrobeats', 'Turkana Hits', 'New Releases', 'Top Charts', 'Hip Hop', 'Gospel']

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent h-64 pointer-events-none" />
        
        <div className="relative pt-8 pb-6 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            {query ? `Results for "${query}"` : 'Discover Music'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mb-8"
          >
            {query 
              ? `${totalResults} result${totalResults !== 1 ? 's' : ''} found`
              : 'Search millions of songs, artists, and albums'
            }
          </motion.p>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="max-w-2xl relative">
            <motion.div 
              className={`relative group ${isSearchFocused ? 'scale-[1.02]' : ''} transition-transform duration-300`}
            >
              <div className={`absolute -inset-1 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-pink-500/30 rounded-2xl blur-md transition-opacity duration-300 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`} />
              <div className={`relative flex items-center bg-[#1a1a2e] border rounded-2xl transition-all duration-300 ${
                isSearchFocused 
                  ? 'border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/10' 
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}>
                <SearchIcon className={`ml-5 w-5 h-5 transition-colors duration-300 ${isSearchFocused ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="flex-1 bg-transparent py-4 px-4 text-white text-lg placeholder-gray-500 focus:outline-none"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={clearSearch}
                      className="mr-3 p-1.5 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <button 
                  type="submit"
                  disabled={!query.trim()}
                  className="mr-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
            </motion.div>

            {/* Recent Searches Dropdown */}
            <AnimatePresence>
              {isSearchFocused && !query && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a2e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                      <button 
                        onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches') }}
                        className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <motion.button
                          key={term}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => { setQuery(term); setSearchParams({ q: term }) }}
                          className="group flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200"
                        >
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          {term}
                          <X 
                            className="w-3 h-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" 
                            onClick={(e) => removeRecentSearch(term, e)}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Trending Searches */}
          {!query && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-fuchsia-400" />
                <span className="text-sm font-medium text-gray-400">Trending Now</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    onClick={() => { setQuery(term); setSearchParams({ q: term }) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/[0.05] hover:bg-gradient-to-r hover:from-violet-600/20 hover:to-fuchsia-600/20 border border-white/[0.08] hover:border-fuchsia-500/30 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200"
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4">
        {/* Tabs */}
        <AnimatePresence>
          {hasResults && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide"
            >
              <div className="flex gap-2 p-1 bg-[#1a1a2e] rounded-2xl border border-white/[0.08]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count && results[tab.count].length > 0 && (
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                          activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                          {results[tab.count].length}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-fuchsia-600/20 border-fuchsia-500/30 text-fuchsia-400' 
                    : 'bg-[#1a1a2e] border-white/[0.08] text-gray-400 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full"
            />
            <p className="text-gray-500 text-sm animate-pulse">Searching across millions of tracks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasResults && query && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-[#1a1a2e] rounded-full flex items-center justify-center border border-white/[0.08]">
                <SearchIcon className="w-10 h-10 text-gray-600" />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Music className="w-6 h-6 text-fuchsia-500/50" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400 max-w-md mb-6">
              We couldn't find anything matching "<span className="text-fuchsia-400">{query}</span>". 
              Try checking your spelling or use different keywords.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={clearSearch}
                className="px-5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Clear Search
              </button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <div className="space-y-10">
            {/* Songs Section */}
            <AnimatePresence>
              {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      Songs
                      <span className="text-sm font-normal text-gray-500 ml-1">{results.songs.length}</span>
                    </h2>
                    {activeTab === 'all' && results.songs.length > 5 && (
                      <button 
                        onClick={() => setActiveTab('songs')}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
                      >
                        See All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.songs.slice(0, activeTab === 'all' ? 5 : undefined).map((song, i) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <SongCard song={song} index={i} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Artists Section */}
            <AnimatePresence>
              {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Artists
                      <span className="text-sm font-normal text-gray-500 ml-1">{results.artists.length}</span>
                    </h2>
                    {activeTab === 'all' && results.artists.length > 6 && (
                      <button 
                        onClick={() => setActiveTab('artists')}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
                      >
                        See All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.artists.slice(0, activeTab === 'all' ? 6 : undefined).map((artist, i) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-5 text-center hover:border-fuchsia-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-white/[0.08] group-hover:ring-fuchsia-500/50 transition-all duration-300 shadow-lg">
                            <img 
                              src={artist.image_url || '/default-avatar.jpg'} 
                              alt={artist.stage_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-white mb-1 group-hover:text-fuchsia-300 transition-colors">{artist.stage_name}</h3>
                          <p className="text-xs text-gray-500">{artist.followers_count?.toLocaleString()} followers</p>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="mt-3 px-4 py-1.5 bg-white/[0.05] hover:bg-fuchsia-600 border border-white/[0.08] hover:border-transparent rounded-full text-xs font-medium text-gray-300 hover:text-white transition-all duration-200"
                          >
                            Follow
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Albums Section */}
            <AnimatePresence>
              {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <Disc className="w-4 h-4 text-white" />
                      </div>
                      Albums
                      <span className="text-sm font-normal text-gray-500 ml-1">{results.albums.length}</span>
                    </h2>
                    {activeTab === 'all' && results.albums.length > 5 && (
                      <button 
                        onClick={() => setActiveTab('albums')}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
                      >
                        See All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.albums.slice(0, activeTab === 'all' ? 5 : undefined).map((album, i) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-4 hover:border-fuchsia-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="aspect-square rounded-xl overflow-hidden mb-3 shadow-lg relative">
                            <img 
                              src={album.cover_url || '/default-cover.jpg'} 
                              alt={album.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-12 h-12 rounded-full bg-fuchsia-600 flex items-center justify-center shadow-lg"
                              >
                                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                              </motion.button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm text-white mb-1 truncate group-hover:text-fuchsia-300 transition-colors">{album.title}</h3>
                          <p className="text-xs text-gray-500">{album.artist?.stage_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{album.year || '2024'} • {album.track_count || '10'} tracks</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Playlists Section */}
            <AnimatePresence>
              {(activeTab === 'all' || activeTab === 'playlists') && results.playlists?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                        <ListMusic className="w-4 h-4 text-white" />
                      </div>
                      Playlists
                      <span className="text-sm font-normal text-gray-500 ml-1">{results.playlists.length}</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.playlists.map((playlist, i) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-[#12121a] border border-white/[0.08] rounded-2xl p-4 hover:border-fuchsia-500/30 transition-all duration-300 cursor-pointer"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center relative">
                          <ListMusic className="w-12 h-12 text-white/30" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Play className="w-10 h-10 text-white" fill="white" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm text-white mb-1 truncate group-hover:text-fuchsia-300 transition-colors">{playlist.name}</h3>
                        <p className="text-xs text-gray-500">{playlist.track_count || '0'} tracks • By {playlist.creator?.username}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search