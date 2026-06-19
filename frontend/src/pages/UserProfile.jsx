import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Heart, 
  Clock, 
  Music, 
  Settings, 
  MapPin, 
  Calendar, 
  Link as LinkIcon,
  Edit3,
  Share2,
  MoreHorizontal,
  Headphones,
  TrendingUp,
  Award,
  Play,
  ExternalLink,
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const UserProfile = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: null },
    { id: 'liked', label: 'Liked Songs', icon: Heart, count: 247 },
    { id: 'recent', label: 'Recently Played', icon: Clock, count: 56 },
    { id: 'playlists', label: 'Playlists', icon: Music, count: 12 },
  ]

  // Mock stats - replace with real data
  const stats = [
    { label: 'Minutes Listened', value: '12.4K', icon: Headphones, color: 'from-violet-500 to-purple-600' },
    { label: 'Top Genre', value: 'Afrobeats', icon: TrendingUp, color: 'from-fuchsia-500 to-pink-600' },
    { label: 'Achievements', value: '8', icon: Award, color: 'from-amber-500 to-orange-600' },
  ]

  // Mock activity data
  const recentActivity = [
    { type: 'liked', song: 'Jerusalema', artist: 'Master KG', time: '2 hours ago' },
    { type: 'playlist', song: 'Created "Turkana Vibes"', artist: '', time: '5 hours ago' },
    { type: 'played', song: 'Sukari', artist: 'Zuchu', time: '1 day ago' },
  ]

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

  return (
    <div className="min-h-screen pb-20">
      {/* Profile Header / Banner */}
      <div className="relative">
        {/* Banner Background */}
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-violet-900/40 via-fuchsia-900/30 to-pink-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          
          {/* Floating particles */}
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

        {/* Profile Info Card */}
        <div className="px-4 -mt-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-[#0a0a0f] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
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

              {/* User Info */}
              <div className="flex-1 pt-2 md:pt-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-xs font-medium text-fuchsia-400">
                      Premium Member
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/[0.08] rounded-full text-xs font-medium text-gray-400">
                      Since {new Date(user.created_at || Date.now()).getFullYear()}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{user.full_name || user.username}</h1>
                  <p className="text-gray-400 text-lg mb-1">@{user.username}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      Turkana, Kenya
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4" />
                      turkana.fm/u/{user.username}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-400 mt-4 max-w-xl leading-relaxed">
                    Music lover exploring the sounds of Turkana. Curating the best local and international hits. 
                  </p>

                  {/* Action Buttons */}
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
                            <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" /> Copy Link
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                              <Share2 className="w-4 h-4" /> Share to Twitter
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
          {stats.map((stat, i) => (
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
          ))}
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
                  <div className="space-y-4">
                    {recentActivity.map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.type === 'liked' ? 'bg-red-500/10 text-red-400' :
                          activity.type === 'playlist' ? 'bg-violet-500/10 text-violet-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {activity.type === 'liked' ? <Heart className="w-5 h-5" /> :
                           activity.type === 'playlist' ? <Music className="w-5 h-5" /> :
                           <Play className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">
                            {activity.type === 'liked' ? 'Liked' : activity.type === 'playlist' ? 'Created' : 'Played'} 
                            {' '}<span className="text-gray-300">"{activity.song}"</span>
                            {activity.artist && <span className="text-gray-500"> by {activity.artist}</span>}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Top Artists & Listening Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Top Artists</h3>
                    <div className="space-y-3">
                      {['Diamond Platnumz', 'Sauti Sol', 'Zuchu', 'Ali Kiba'].map((artist, i) => (
                        <div key={artist} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group">
                          <span className="text-sm font-bold text-gray-600 w-5">{i + 1}</span>
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-900 to-fuchsia-900 flex items-center justify-center">
                            <Music className="w-4 h-4 text-white/50" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">{artist}</p>
                            <p className="text-xs text-gray-500">{1240 - i * 200} plays</p>
                          </div>
                          <Play className="w-4 h-4 text-gray-600 group-hover:text-fuchsia-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Listening Trends</h3>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-violet-600/20 to-fuchsia-600/40 rounded-t-lg hover:from-violet-600/40 hover:to-fuchsia-600/60 transition-all cursor-pointer group relative"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {height * 10}m
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-gray-600">
                      <span>Jan</span><span>Dec</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'overview' && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-12 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
                  <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                    {activeTab === 'liked' && <Heart className="w-8 h-8 text-gray-600" />}
                    {activeTab === 'recent' && <Clock className="w-8 h-8 text-gray-600" />}
                    {activeTab === 'playlists' && <Music className="w-8 h-8 text-gray-600" />}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} yet
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  {activeTab === 'liked' && "Start liking songs to build your personal collection of favorites."}
                  {activeTab === 'recent' && "Your listening history will appear here once you start playing music."}
                  {activeTab === 'playlists' && "Create playlists to organize your favorite tracks and share with friends."}
                </p>
                <Link to="/search">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-300"
                  >
                    {activeTab === 'liked' ? 'Browse Songs' : activeTab === 'recent' ? 'Start Listening' : 'Create Playlist'}
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default UserProfile