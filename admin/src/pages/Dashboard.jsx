import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Music, 
  Disc, 
  Activity, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Headphones,
  Heart,
  Play,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  RefreshCw,
  Calendar
} from 'lucide-react'
import api from '../api/axios'
import StatCard from '../components/StatCard'

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    total_users: 0, 
    total_artists: 0, 
    total_songs: 0, 
    total_streams: 0, 
    pending_approvals: 0, 
    recent_reports: 0 
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/api/v1/admin/dashboard')  // ← FIXED: was /admin/dashboard
      setStats(res.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mock activity data - replace with API data when available
  const recentActivity = [
    { type: 'user', action: 'New user registered', detail: 'john_doe joined', time: '2 min ago', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'song', action: 'Song uploaded', detail: 'Jerusalema by Master KG', time: '5 min ago', icon: Music, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { type: 'artist', action: 'Artist approved', detail: 'Zuchu verified', time: '12 min ago', icon: Disc, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { type: 'report', action: 'Content report', detail: 'Copyright claim on track #4521', time: '1 hr ago', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'stream', action: 'Milestone reached', detail: '100K streams on Sukari', time: '2 hr ago', icon: Headphones, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ]

  const topSongs = [
    { title: 'Jerusalema', artist: 'Master KG', plays: '2.4M', trend: '+12%', cover: 'bg-gradient-to-br from-yellow-500 to-orange-600' },
    { title: 'Sukari', artist: 'Zuchu', plays: '1.8M', trend: '+8%', cover: 'bg-gradient-to-br from-pink-500 to-rose-600' },
    { title: 'Tetema', artist: 'Diamond Platnumz', plays: '1.2M', trend: '+15%', cover: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { title: 'Amaboko', artist: 'Bruce Melodie', plays: '980K', trend: '+5%', cover: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  ]

  const chartData = [35, 55, 40, 70, 65, 85, 60, 90, 75, 100, 80, 95]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Monitor your platform's performance and activity</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Users', value: stats.total_users, icon: Users, color: 'from-blue-500 to-cyan-500', trend: '+12%', trendUp: true, subtitle: 'Active this month' },
          { title: 'Total Artists', value: stats.total_artists, icon: Disc, color: 'from-fuchsia-500 to-pink-500', trend: '+8%', trendUp: true, subtitle: 'Verified creators' },
          { title: 'Total Songs', value: stats.total_songs, icon: Music, color: 'from-violet-500 to-purple-500', trend: '+15%', trendUp: true, subtitle: 'Published tracks' },
          { title: 'Total Streams', value: stats.total_streams, icon: Headphones, color: 'from-emerald-500 to-teal-500', trend: '+23%', trendUp: true, subtitle: 'All time plays' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            className="relative group bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Platform Activity</h2>
              <p className="text-sm text-gray-500">Streams over the last 12 months</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span className="text-xs text-gray-400">Streams</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {chartData.map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                className="flex-1 relative group"
              >
                <div className={`absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-fuchsia-600/20 to-fuchsia-500/60 transition-all duration-300 group-hover:from-fuchsia-600/40 group-hover:to-fuchsia-500/80`} 
                  style={{ height: '100%' }} 
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1a2e] px-2 py-1 rounded-md border border-white/[0.08]">
                  {(height * 1000).toLocaleString()} plays
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-gray-600 px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-5"
        >
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Pending Approvals</p>
                  <p className="text-xs text-gray-500">{stats.pending_approvals} items waiting</p>
                </div>
                <span className="text-lg font-bold text-amber-400">{stats.pending_approvals}</span>
              </motion.div>

              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Recent Reports</p>
                  <p className="text-xs text-gray-500">{stats.recent_reports} new reports</p>
                </div>
                <span className="text-lg font-bold text-red-400">{stats.recent_reports}</span>
              </motion.div>

              <motion.div 
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">New Users</p>
                  <p className="text-xs text-gray-500">+24 this week</p>
                </div>
                <span className="text-lg font-bold text-blue-400">24</span>
              </motion.div>
            </div>
          </div>

          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <Play className="w-5 h-5 text-fuchsia-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">89%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                <Heart className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">4.2K</p>
                <p className="text-xs text-gray-500">Likes today</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">{activity.action}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{activity.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Top Songs</h2>
            <button className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {topSongs.map((song, i) => (
              <motion.div
                key={song.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <span className="text-sm font-bold text-gray-600 w-5">{i + 1}</span>
                <div className={`w-12 h-12 rounded-lg ${song.cover} flex items-center justify-center shadow-lg`}>
                  <Music className="w-5 h-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors truncate">{song.title}</p>
                  <p className="text-xs text-gray-500">{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{song.plays}</p>
                  <p className="text-xs text-emerald-400">{song.trend}</p>
                </div>
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
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between text-xs text-gray-600 pt-4"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <p>Turkana Music Admin Dashboard</p>
      </motion.div>
    </div>
  )
}

export default Dashboard