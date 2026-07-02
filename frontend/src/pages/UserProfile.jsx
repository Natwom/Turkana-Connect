import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Heart, Clock, Music, Settings, MapPin, Calendar, 
  Link as LinkIcon, Edit3, Share2, ExternalLink, LogOut,
  Headphones, TrendingUp, Award, Play
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import userApi from '../api/user'
import likesApi from '../api/likes'
import playlistsApi from '../api/playlists'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Recently'
  const date = new Date(isoString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

const UserProfile = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  // Real data states
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [history, setHistory] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState({
    stats: true,
    activity: true,
    history: true,
    liked: true,
    playlists: true,
    topArtists: true,
    trends: true
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: null },
    { id: 'liked', label: 'Liked Songs', icon: Heart, count: stats?.liked_songs_count },
    { id: 'recent', label: 'Recently Played', icon: Clock, count: stats?.total_hours_listened ? `${stats.total_hours_listened}h` : null },
    { id: 'playlists', label: 'Playlists', icon: Music, count: stats?.playlists_count },
  ]

  // Fetch all data on mount
  useEffect(() => {
    if (!user) return
    
    const fetchAllData = async () => {
      // Fetch stats
      try {
        const statsRes = await userApi.getStats()
        setStats(statsRes.data)
      } catch (err) {
        console.error('Stats fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, stats: false }))
      }

      // Fetch activity
      try {
        const activityRes = await userApi.getActivity(10)
        setActivity(activityRes.data || [])
      } catch (err) {
        console.error('Activity fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, activity: false }))
      }

      // Fetch history
      try {
        const historyRes = await userApi.getHistory(20)
        setHistory(historyRes.data || [])
      } catch (err) {
        console.error('History fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, history: false }))
      }

      // Fetch liked songs
      try {
        const likedRes = await likesApi.getMy()
        setLikedSongs(likedRes.data || [])
      } catch (err) {
        console.error('Liked songs fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, liked: false }))
      }

      // Fetch playlists
      try {
        const playlistsRes = await playlistsApi.getMy()
        setPlaylists(playlistsRes.data || [])
      } catch (err) {
        console.error('Playlists fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, playlists: false }))
      }

      // Fetch top artists
      try {
        const topArtistsRes = await userApi.getTopArtists(5)
        setTopArtists(topArtistsRes.data || [])
      } catch (err) {
        console.error('Top artists fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, topArtists: false }))
      }

      // Fetch trends
      try {
        const trendsRes = await userApi.getTrends(30)
        setTrends(trendsRes.data || [])
      } catch (err) {
        console.error('Trends fetch failed:', err)
      } finally {
        setLoading(prev => ({ ...prev, trends: false }))
      }
    }

    fetchAllData()
  }, [user])

  // Refresh liked songs every time the "Liked" tab is opened
  useEffect(() => {
    if (activeTab === 'liked' && user) {
      const fetchLiked = async () => {
        setLoading(prev => ({ ...prev, liked: true }))
        try {
          const likedRes = await likesApi.getMy()
          setLikedSongs(likedRes.data || [])
        } catch (err) {
          console.error('Liked songs refresh failed:', err)
        } finally {
          setLoading(prev => ({ ...prev, liked: false }))
        }
      }
      fetchLiked()
    }
  }, [activeTab, user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 to-transparent" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center px-4"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
            <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in to view your profile</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">Track your listening habits, save your favorites, and discover personalized recommendations.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-300"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-white/[0.05] border border-white/[0.08] text-gray-300 rounded-xl font-medium hover:bg-white/[0.1] hover:text-white transition-all duration-300"
              >
                Create Account
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Format stats for display
  const displayStats = stats ? [
    { 
      label: 'Minutes Listened', 
      value: stats.total_minutes_listened >= 1000 
        ? `${(stats.total_minutes_listened / 1000).toFixed(1)}K` 
        : stats.total_minutes_listened.toString(), 
      icon: Headphones, 
      color: 'from-violet-500 to-purple-600' 
    },
    { 
      label: 'Top Genre', 
      value: stats.top_genre || 'Unknown', 
      icon: TrendingUp, 
      color: 'from-fuchsia-500 to-pink-600' 
    },
    { 
      label: 'Achievements', 
      value: stats.total_minutes_listened > 0 ? Math.min(Math.floor(stats.total_minutes_listened / 1000) + 1, 20).toString() : '0', 
      icon: Award, 
      color: 'from-amber-500 to-orange-600' 
    },
  ] : []

  return (
    <div className="min-h-screen pb-20">
      {/* Profile Header / Banner */}
      <div className="relative">
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-violet-900/40 via-fuchsia-900/30 to-pink-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-fuchsia-500/20 rounded-full"
              style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <div className="px-4 -mt-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-[#0a0a0f] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                  {user.avatar_url ? (
                    <img src={getImageUrl(user.avatar_url)} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-fuchsia-500/50 transition-all shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
              </motion.div>

              <div className="flex-1 pt-2 md:pt-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-xs font-medium text-fuchsia-400">
                      {user.role === 'artist' ? 'Artist' : user.role === 'admin' ? 'Admin' : 'Premium Member'}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/[0.08] rounded-full text-xs font-medium text-gray-400">
                      Since {stats?.member_since ? new Date(stats.member_since).getFullYear() : new Date(user.created_at || Date.now()).getFullYear()}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{user.full_name || user.username}</h1>
                  <p className="text-gray-400 text-lg mb-1">@{user.username}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {user.bio ? user.bio.split(',')[0] : 'Kenya'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4" />
                      apiaro.fm/u/{user.username}
                    </span>
                  </div>

                  <p className="text-gray-400 mt-4 max-w-xl leading-relaxed">
                    {user.bio || `Music lover on Apiaro Music. ${stats?.liked_songs_count || 0} liked songs, ${stats?.playlists_count || 0} playlists.`}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="relative px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Profile
                      <AnimatePresence>
                        {showShareMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a2e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50"
                          >
                            <button 
                              onClick={() => navigator.clipboard.writeText(`https://apiaro.fm/u/${user.username}`)}
                              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" /> Copy Link
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={logout}
                      className="px-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-200 flex items-center gap-2 ml-auto md:ml-0"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 mt-10"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading.stats ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
                <div className="h-12 bg-white/5 rounded-xl" />
              </div>
            ))
          ) : (
            displayStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -3 }}
                className="relative group bg-[#12121a] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-4 mt-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1 p-1 bg-[#1a1a2e] rounded-2xl border border-white/[0.08] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="profileTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Recent Activity */}
                <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-fuchsia-400" />
                    Recent Activity
                  </h3>
                  {loading.activity ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : activity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No activity yet. Start listening!</p>
                  ) : (
                    <div className="space-y-3">
                      {activity.slice(0, 5).map((item, i) => (
                        <motion.div
                          key={`${item.type}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.type === 'liked' ? 'bg-red-500/10 text-red-400' :
                            item.type === 'playlist' ? 'bg-violet-500/10 text-violet-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {item.type === 'liked' ? <Heart className="w-5 h-5" /> :
                             item.type === 'playlist' ? <Music className="w-5 h-5" /> :
                             <Play className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">
                              {item.type === 'liked' ? 'Liked' : item.type === 'playlist' ? 'Created' : 'Played'} 
                              {' '}<span className="text-gray-300">"{item.song || item.playlist_name}"</span>
                              {item.artist && <span className="text-gray-500"> by {item.artist}</span>}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">{formatTimeAgo(item.time)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Artists & Listening Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Artists */}
                  <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Top Artists</h3>
                    {loading.topArtists ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : topArtists.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No listening data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {topArtists.map((artist, i) => (
                          <div key={artist.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group">
                            <span className="text-sm font-bold text-gray-600 w-5">{i + 1}</span>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                              {artist.image_url ? (
                                <img src={getImageUrl(artist.image_url)} alt={artist.stage_name} className="w-full h-full object-cover" />
                              ) : (
                                <Music className="w-4 h-4 text-white/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">{artist.stage_name}</p>
                              <p className="text-xs text-gray-500">{artist.play_count} plays • {artist.total_minutes} min</p>
                            </div>
                            <Play className="w-4 h-4 text-gray-600 group-hover:text-fuchsia-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Listening Trends */}
                  <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Listening Trends (30 Days)</h3>
                    {loading.trends ? (
                      <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
                    ) : trends.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No data yet</p>
                    ) : (
                      <div className="h-48 flex items-end justify-between gap-1 px-2">
                        {trends.map((day, i) => {
                          const maxVal = Math.max(...trends.map(d => d.minutes), 1)
                          const height = maxVal > 0 ? (day.minutes / maxVal) * 100 : 0
                          return (
                            <motion.div
                              key={day.date}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 5)}%` }}
                              transition={{ delay: i * 0.02, duration: 0.5 }}
                              className="flex-1 bg-gradient-to-t from-violet-600/20 to-fuchsia-600/40 rounded-t-lg hover:from-violet-600/40 hover:to-fuchsia-600/60 transition-all cursor-pointer group relative min-w-[4px]"
                              title={`${day.date}: ${day.minutes} min`}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {day.minutes}m
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex justify-between mt-3 text-xs text-gray-600">
                      <span>30 days ago</span><span>Today</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Liked Songs Tab */}
            {activeTab === 'liked' && (
              <motion.div
                key="liked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Liked Songs ({likedSongs.length})
                </h3>
                {loading.liked ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : likedSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No liked songs yet</h4>
                    <p className="text-gray-500 mb-6">Start liking songs to build your collection</p>
                    <Link to="/search">
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm"
                      >
                        Browse Songs
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {likedSongs.map((song, i) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(song.cover_url)} alt={song.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{song.title}</p>
                          <p className="text-xs text-gray-500">{song.artist_name}</p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '3:45'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Recently Played Tab */}
            {activeTab === 'recent' && (
              <motion.div
                key="recent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-fuchsia-400" />
                  Recently Played
                </h3>
                {loading.history ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No history yet</h4>
                    <p className="text-gray-500 mb-6">Your listening history will appear here</p>
                    <Link to="/search">
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm"
                      >
                        Start Listening
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(item.cover_url)} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.artist_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{formatTimeAgo(item.played_at)}</p>
                          <p className="text-[10px] text-gray-700">{Math.round(item.duration_played / 60)}m played</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <motion.div
                key="playlists"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Music className="w-5 h-5 text-violet-400" />
                  Your Playlists ({playlists.length})
                </h3>
                {loading.playlists ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No playlists yet</h4>
                    <p className="text-gray-500 mb-6">Create playlists to organize your music</p>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm"
                    >
                      Create Playlist
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {playlists.map((playlist, i) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-4 hover:border-fuchsia-500/30 transition-all cursor-pointer"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                          <Music className="w-12 h-12 text-white/30" />
                        </div>
                        <h4 className="font-semibold text-sm text-white truncate group-hover:text-fuchsia-300 transition-colors">{playlist.name}</h4>
                        <p className="text-xs text-gray-500">{playlist.song_count} songs • {playlist.is_public ? 'Public' : 'Private'}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default UserProfile