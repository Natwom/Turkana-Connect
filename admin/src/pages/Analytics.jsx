import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Music, 
  Headphones, 
  Calendar,
  BarChart3
} from 'lucide-react'
import api from '../api/axios'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [topSongs, setTopSongs] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [analyticsRes, songsRes, artistsRes] = await Promise.all([
        api.get(`/api/v1/admin/analytics?range=${timeRange}`),
        api.get('/api/v1/songs?limit=10&sort=play_count'),
        api.get('/api/v1/admin/artists?limit=10&sort=followers_count')
      ])
      setAnalytics(analyticsRes.data)
      setTopSongs(songsRes.data?.items || songsRes.data || [])
      setTopArtists(artistsRes.data?.items || artistsRes.data || [])
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400 text-sm">Platform performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/[0.08] rounded-xl p-1">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-fuchsia-500/20 text-fuchsia-300' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Users', value: analytics?.new_users || 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'New Songs', value: analytics?.new_songs || 0, icon: Music, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
          { label: 'Total Plays', value: analytics?.plays?.toLocaleString() || '0', icon: Headphones, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Growth', value: `+${analytics?.growth_rate || 0}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Top Songs
          </h3>
          <div className="space-y-3">
            {topSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                <span className="text-sm font-bold text-gray-600 w-6">#{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                  <Music className="w-4 h-4 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-xs text-gray-500">{song.artist?.stage_name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{song.play_count?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500">plays</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            Top Artists
          </h3>
          <div className="space-y-3">
            {topArtists.map((artist, i) => (
              <div key={artist.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                <span className="text-sm font-bold text-gray-600 w-6">#{i + 1}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {artist.stage_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{artist.stage_name}</p>
                  <p className="text-xs text-gray-500">{artist.genre || 'No genre'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{(artist.followers_count || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">followers</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics