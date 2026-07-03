import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Disc, Users, Play, Heart, TrendingUp, Upload,
  Edit3, Settings, AlertCircle, BarChart3, Clock, CheckCircle2,
  XCircle, Headphones, Award, Calendar, MapPin, Share2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { getMyArtistProfile, getMyArtistStats, updateMyArtistProfile } from '../api/artists'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const ArtistDashboard = () => {
  const { user } = useAuth()
  const { playSong } = usePlayer()
  
  const [artist, setArtist] = useState(null)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('songs')
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ stage_name: '', bio: '', genre: '' })
  const [updating, setUpdating] = useState(false)

  const tabs = [
    { id: 'songs', label: 'My Songs', icon: Music },
    { id: 'albums', label: 'My Albums', icon: Disc },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [profileRes, statsRes] = await Promise.all([
        getMyArtistProfile(),
        getMyArtistStats()
      ])
      setArtist(profileRes.data)
      setStats(statsRes.data)
      setEditForm({
        stage_name: profileRes.data.stage_name || '',
        bio: profileRes.data.bio || '',
        genre: profileRes.data.genre || ''
      })
    } catch (err) {
      console.error('Failed to fetch artist dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const formData = new FormData()
      if (editForm.stage_name) formData.append('stage_name', editForm.stage_name)
      if (editForm.bio) formData.append('bio', editForm.bio)
      if (editForm.genre) formData.append('genre', editForm.genre)
      
      const res = await updateMyArtistProfile(formData)
      setArtist(prev => ({ ...prev, ...res.data }))
      setIsEditOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
      alert(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Artist Profile</h2>
          <p className="text-gray-400 mb-6">You need to create an artist profile first.</p>
          <Link to="/become-artist">
            <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium">
              Become an Artist
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Streams', value: formatNumber(artist.total_streams), icon: Play, color: 'from-violet-500 to-purple-600', sub: 'All time' },
    { label: 'Followers', value: formatNumber(artist.followers_count), icon: Users, color: 'from-fuchsia-500 to-pink-600', sub: `${formatNumber(stats?.recent_follows || 0)} this month` },
    { label: 'Monthly Listeners', value: formatNumber(artist.monthly_listeners), icon: Headphones, color: 'from-emerald-500 to-teal-600', sub: 'Last 30 days' },
    { label: 'Total Likes', value: formatNumber(artist.total_likes), icon: Heart, color: 'from-rose-500 to-red-600', sub: 'Across all songs' },
    { label: 'Songs', value: artist.total_songs, icon: Music, color: 'from-amber-500 to-orange-600', sub: `${artist.pending_songs} pending` },
    { label: 'Albums', value: artist.total_albums, icon: Disc, color: 'from-cyan-500 to-blue-600', sub: 'Released' },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative">
        <div className="h-56 w-full bg-gradient-to-r from-violet-900/60 via-fuchsia-900/40 to-pink-900/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        </div>

        <div className="px-4 -mt-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-md opacity-50" />
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-4 ring-[#0a0a0f] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-2xl">
                  <img 
                    src={getImageUrl(artist.image_url)} 
                    alt={artist.stage_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                  />
                </div>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-fuchsia-500/50 transition-all shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </motion.div>

              <div className="flex-1 pt-2 md:pt-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-medium text-violet-400">
                    Artist Account
                  </span>
                  {artist.is_verified && (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {!artist.is_approved && (
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-medium text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Pending Approval
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{artist.stage_name}</h1>
                <p className="text-gray-400 text-lg mb-3">{artist.bio || 'No bio yet'}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {artist.region || 'Turkana'}, {artist.country || 'Kenya'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Music className="w-4 h-4" />
                    {artist.genre || 'No genre'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Since {new Date(artist.created_at).getFullYear()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/upload-song">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Song
                    </motion.button>
                  </Link>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditOpen(true)}
                    className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/artist/${artist.id}`)}
                    className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pending Approval Banner */}
      {!artist.is_approved && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mt-8"
        >
          <div className="max-w-5xl mx-auto bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium">Profile Pending Approval</p>
              <p className="text-yellow-400/60 text-sm">Your artist profile is under review by admins. Some features may be limited until approved.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="px-4 mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="relative group bg-[#12121a] border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-600 mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-10">
        <div className="max-w-5xl mx-auto">
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
                    layoutId="artistTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* SONGS TAB */}
            {activeTab === 'songs' && (
              <motion.div
                key="songs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-violet-400" />
                    My Songs ({artist.total_songs})
                  </h3>
                  <Link to="/upload-song">
                    <button className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload New
                    </button>
                  </Link>
                </div>
                
                {artist.songs?.length === 0 ? (
                  <div className="text-center py-16">
                    <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No songs yet</h4>
                    <p className="text-gray-500 mb-6">Start uploading your music to build your catalog</p>
                    <Link to="/upload-song">
                      <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm">
                        Upload Your First Song
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {artist.songs.map((song, i) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        onClick={() => playSong(song)}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                          {song.cover_url ? (
                            <img src={getImageUrl(song.cover_url)} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{song.title}</p>
                            {!song.is_approved && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[10px] font-medium border border-yellow-500/20">
                                Pending
                              </span>
                            )}
                            {song.is_explicit && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] font-medium border border-red-500/20">
                                Explicit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {song.album_title || 'Single'} • {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Play className="w-3.5 h-3.5" />
                            {formatNumber(song.play_count)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {formatNumber(song.likes_count)}
                          </span>
                        </div>
                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-lg transition-all">
                          <Play className="w-5 h-5 text-violet-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ALBUMS TAB */}
            {activeTab === 'albums' && (
              <motion.div
                key="albums"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-fuchsia-400" />
                  My Albums ({artist.total_albums})
                </h3>
                
                {artist.albums?.length === 0 ? (
                  <div className="text-center py-16">
                    <Disc className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No albums yet</h4>
                    <p className="text-gray-500">Create albums to organize your music</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {artist.albums.map((album, i) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-4 hover:border-fuchsia-500/30 transition-all cursor-pointer"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                          {album.cover_url ? (
                            <img src={getImageUrl(album.cover_url)} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <Disc className="w-12 h-12 text-white/30" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-white truncate group-hover:text-fuchsia-300 transition-colors">{album.title}</h4>
                        <p className="text-xs text-gray-500">{album.songs?.length || 0} songs</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {album.release_date ? new Date(album.release_date).getFullYear() : 'Unreleased'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stream Trend Chart */}
                <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Stream Trends (Last 30 Days)
                  </h3>
                  {stats?.stream_trend?.length > 0 ? (
                    <div className="h-56 flex items-end justify-between gap-1 px-2">
                      {stats.stream_trend.map((day, i) => {
                        const maxVal = Math.max(...stats.stream_trend.map(d => d.streams), 1)
                        const height = maxVal > 0 ? (day.streams / maxVal) * 100 : 0
                        return (
                          <motion.div
                            key={day.date}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 3)}%` }}
                            transition={{ delay: i * 0.02, duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-emerald-600/20 to-emerald-600/50 rounded-t-lg hover:from-emerald-600/40 hover:to-emerald-600/70 transition-all cursor-pointer group relative min-w-[3px]"
                            title={`${day.date}: ${day.streams} streams`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {day.streams}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center text-gray-600">No stream data yet</div>
                  )}
                  <div className="flex justify-between mt-3 text-xs text-gray-600">
                    <span>30 days ago</span><span>Today</span>
                  </div>
                </div>

                {/* Top Songs Table */}
                <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Top Performing Songs
                  </h3>
                  {stats?.top_songs?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.top_songs.map((song, i) => (
                        <div key={song.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                          <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{song.title}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Play className="w-3.5 h-3.5" />
                              {formatNumber(song.plays)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              {formatNumber(song.likes)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No performance data yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-6">Edit Artist Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Stage Name</label>
                  <input
                    type="text"
                    value={editForm.stage_name}
                    onChange={(e) => setEditForm({ ...editForm, stage_name: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Genre</label>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ArtistDashboard