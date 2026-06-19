import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Music, 
  Activity,
  Headphones,
  Heart,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  Disc,
  Crown,
  Clock
} from 'lucide-react'
import axios from 'axios'

const Analytics = () => {
  const [topSongs, setTopSongs] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('songs')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, artistsRes] = await Promise.all([
          axios.get(`/api/v1/analytics/top-songs?range=${timeRange}`),
          axios.get(`/api/v1/analytics/top-artists?range=${timeRange}`)
        ])
        setTopSongs(songsRes.data)
        setTopArtists(artistsRes.data)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange])

  // Mock chart data - replace with API data
  const chartData = [
    { day: 'Mon', streams: 1200, users: 340 },
    { day: 'Tue', streams: 1900, users: 420 },
    { day: 'Wed', streams: 1600, users: 380 },
    { day: 'Thu', streams: 2400, users: 560 },
    { day: 'Fri', streams: 2800, users: 640 },
    { day: 'Sat', streams: 3200, users: 780 },
    { day: 'Sun', streams: 2100, users: 520 },
  ]

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' },
  ]

  const maxStreams = Math.max(...chartData.map(d => d.streams))

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400 text-sm">Track performance and discover trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#1a1a2e] rounded-xl border border-white/[0.08]">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === range.value ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {timeRange === range.value && (
                  <motion.div
                    layoutId="timeRange"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{range.label}</span>
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Streams', value: '15.2K', change: '+12%', up: true, icon: Headphones, color: 'from-violet-500 to-fuchsia-500' },
          { label: 'Active Users', value: '3.4K', change: '+8%', up: true, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Avg. Listen Time', value: '4:32', change: '+5%', up: true, icon: Clock, color: 'from-emerald-500 to-teal-500' },
          { label: 'Engagement Rate', value: '68%', change: '-2%', up: false, icon: Heart, color: 'from-rose-500 to-pink-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            className="relative group bg-[#12121a] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            
            <div className="relative">
              <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Stream Activity</h2>
            <p className="text-sm text-gray-500">Daily streams and active users</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span className="text-xs text-gray-400">Streams</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-400">Users</span>
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-4 px-2">
          {chartData.map((data, i) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-48">
                {/* Users bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.users / maxStreams) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="w-3 bg-blue-500/30 rounded-t-md hover:bg-blue-500/50 transition-colors relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1a2e] px-2 py-1 rounded-md border border-white/[0.08]">
                    {data.users} users
                  </div>
                </motion.div>
                {/* Streams bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.streams / maxStreams) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="w-5 bg-gradient-to-t from-fuchsia-600/20 to-fuchsia-500/60 rounded-t-md hover:from-fuchsia-600/40 hover:to-fuchsia-500/80 transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1a2e] px-2 py-1 rounded-md border border-white/[0.08]">
                    {data.streams.toLocaleString()} streams
                  </div>
                </motion.div>
              </div>
              <span className="text-xs text-gray-600">{data.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#1a1a2e] rounded-2xl border border-white/[0.08] w-fit">
        {[
          { id: 'songs', label: 'Top Songs', icon: Music },
          { id: 'artists', label: 'Top Artists', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="analyticsTab"
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

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'songs' && (
          <motion.div
            key="songs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
          >
            <div className="p-6 border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Top Songs</h2>
                  <p className="text-sm text-gray-500">Most streamed tracks this period</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </motion.button>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {topSongs.slice(0, 10).map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {i < 3 ? (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                        i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}>
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{i + 1}</span>
                    )}
                  </div>

                  {/* Cover */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-900 to-fuchsia-900 overflow-hidden flex-shrink-0">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors truncate">{song.title}</p>
                    <p className="text-xs text-gray-500">{song.artist?.stage_name || 'Unknown Artist'}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Headphones className="w-3.5 h-3.5 text-fuchsia-400" />
                        {song.play_count?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-gray-600">plays</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {song.like_count?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-gray-600">likes</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {song.growth || '+0%'}
                      </div>
                      <p className="text-xs text-gray-600">vs last period</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {topSongs.length === 0 && (
              <div className="p-12 text-center">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No song data available for this period</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'artists' && (
          <motion.div
            key="artists"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
          >
            <div className="p-6 border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Top Artists</h2>
                  <p className="text-sm text-gray-500">Most popular creators this period</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </motion.button>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {topArtists.slice(0, 10).map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {i < 3 ? (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                        i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}>
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {artist.image_url ? (
                      <img src={artist.image_url} alt={artist.stage_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      artist.stage_name?.[0]?.toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors truncate">{artist.stage_name}</p>
                    <p className="text-xs text-gray-500">{artist.genre || 'Artist'}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Headphones className="w-3.5 h-3.5 text-fuchsia-400" />
                        {artist.total_streams?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-gray-600">total streams</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {artist.followers_count?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-gray-600">followers</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {artist.growth || '+0%'}
                      </div>
                      <p className="text-xs text-gray-600">vs last period</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {topArtists.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No artist data available for this period</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Analytics