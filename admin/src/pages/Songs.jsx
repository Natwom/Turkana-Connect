import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  Music, 
  Play, 
  Search,
  Pause,
  Clock,
  Headphones,
  MoreHorizontal,
  RefreshCw,
  Download,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye
} from 'lucide-react'
import api from '../api/axios'  // ✅ FIXED

const Songs = () => {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [playingPreview, setPlayingPreview] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/api/v1/songs?limit=100&approved_only=false')  // ✅ FIXED
      setSongs(res.data)
    } catch (err) {
      console.error('Failed to fetch songs:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/v1/admin/songs/${id}/approve`)  // ✅ FIXED
      fetchSongs()
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return
    try {
      await api.delete(`/api/v1/admin/songs/${id}`)  // ✅ FIXED
      fetchSongs()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.stage_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !song.is_approved :
      filter === 'approved' ? song.is_approved :
      true
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: songs.length,
    approved: songs.filter(s => s.is_approved).length,
    pending: songs.filter(s => !s.is_approved).length,
    totalPlays: songs.reduce((acc, s) => acc + (s.play_count || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading songs...</p>
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
          <h1 className="text-3xl font-bold text-white mb-1">Song Management</h1>
          <p className="text-gray-400 text-sm">Review, approve, and manage platform content</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSongs}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Songs', value: stats.total, icon: Music, color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
          { label: 'Pending', value: stats.pending, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
          { label: 'Total Plays', value: stats.totalPlays.toLocaleString(), icon: Headphones, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
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
            <div className="relative flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, artist, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
          >
            <option value="all">All Songs</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Songs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Song</th>
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Plays</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              <AnimatePresence>
                {filteredSongs.map((song, i) => (
                  <motion.tr
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-900 to-fuchsia-900 flex-shrink-0">
                          {song.cover_url ? (
                            <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-white/30" />
                            </div>
                          )}
                          <button
                            onClick={() => setPlayingPreview(playingPreview === song.id ? null : song.id)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            {playingPreview === song.id ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            )}
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">{song.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(song.duration)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {song.artist?.stage_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm text-gray-300">{song.artist?.stage_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">{song.category?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Headphones className="w-3.5 h-3.5 text-fuchsia-400" />
                        {song.play_count?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {song.is_approved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setSelectedSong(song); setShowDetailModal(true) }}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {!song.is_approved && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApprove(song.id)}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(song.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredSongs.length === 0 && (
          <div className="p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No songs found</h3>
            <p className="text-gray-500">
              {searchQuery || filter !== 'all' ? 'Try adjusting your filters' : 'No songs uploaded yet.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Song Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Song Details</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-violet-900 to-fuchsia-900 flex-shrink-0">
                  {selectedSong.cover_url ? (
                    <img src={selectedSong.cover_url} alt={selectedSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedSong.title}</h4>
                  <p className="text-sm text-gray-400">{selectedSong.artist?.stage_name || 'Unknown Artist'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedSong.is_approved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedSong.is_approved ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {selectedSong.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(selectedSong.duration)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-white">{selectedSong.category?.name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Plays</p>
                  <p className="text-sm font-medium text-white">{selectedSong.play_count?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Likes</p>
                  <p className="text-sm font-medium text-white">{selectedSong.like_count?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(selectedSong.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {!selectedSong.is_approved && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleApprove(selectedSong.id); setShowDetailModal(false) }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve Song
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleDelete(selectedSong.id); setShowDetailModal(false) }}
                  className="flex-1 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default Songs