import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Music, 
  Users, 
  Headphones, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  CheckCircle2,
  Activity
} from 'lucide-react'
import api from '../api/axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentSongs, setRecentSongs] = useState([])
  const [recentArtists, setRecentArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, songsRes, artistsRes] = await Promise.all([
        api.get('/api/v1/admin/dashboard/stats'),
        api.get('/api/v1/songs?limit=5&sort=created_at'),
        api.get('/api/v1/admin/artists?limit=5&sort=created_at')
      ])
      setStats(statsRes.data)
      setRecentSongs(songsRes.data?.items || songsRes.data || [])
      setRecentArtists(artistsRes.data?.items || artistsRes.data || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      label: 'Total Songs', 
      value: stats?.total_songs || 0, 
      icon: Music, 
      color: 'text-violet-400', 
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    { 
      label: 'Total Artists', 
      value: stats?.total_artists || 0, 
      icon: Users, 
      color: 'text-fuchsia-400', 
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/20'
    },
    { 
      label: 'Total Plays', 
      value: stats?.total_plays?.toLocaleString() || '0', 
      icon: Headphones, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      label: 'Pending Approvals', 
      value: stats?.pending_approvals || 0, 
      icon: AlertTriangle, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
  ]

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
      >
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Platform overview and recent activity</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            className={`relative bg-[#12121a] border ${stat.border} rounded-2xl p-5 hover:border-white/[0.15] transition-all`}
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
        {/* Recent Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-violet-400" />
            Recent Songs
          </h3>
          <div className="space-y-3">
            {recentSongs.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent songs</p>
            ) : (
              recentSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-xs text-gray-500">{song.artist?.stage_name || 'Unknown'}</p>
                  </div>
                  {song.is_approved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            Recent Artists
          </h3>
          <div className="space-y-3">
            {recentArtists.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent artists</p>
            ) : (
              recentArtists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {artist.stage_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{artist.stage_name}</p>
                    <p className="text-xs text-gray-500">{artist.genre || 'No genre'}</p>
                  </div>
                  {artist.is_approved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard