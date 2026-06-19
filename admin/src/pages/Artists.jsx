import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  User, 
  Search, 
  Loader2,
  RefreshCw,
  Download,
  ChevronDown,
  Crown,
  Music,
  MapPin,
  Users as UsersIcon,
  Clock,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Mail
} from 'lucide-react'
import api from '../api/axios'

const Artists = () => {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/api/v1/admin/artists?limit=500')
      console.log('API Response:', res.data) // Debug log
      setArtists(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch artists:', err)
      alert(err.response?.data?.detail || 'Failed to load artists')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`)
    try {
      await api.post(`/api/v1/admin/artists/${id}/approve`)
      setArtists(prev => prev.map(a => 
        a.id === id ? { ...a, is_approved: true } : a
      ))
    } catch (err) {
      console.error('Failed to approve:', err)
      alert(err.response?.data?.detail || 'Failed to approve artist')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this artist? This will delete their profile.')) return
    
    setActionLoading(`reject-${id}`)
    try {
      await api.delete(`/api/v1/admin/artists/${id}/reject`)
      setArtists(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to reject:', err)
      alert(err.response?.data?.detail || 'Failed to reject artist')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredArtists = artists.filter(artist => {
    if (filter === 'pending') return !artist.is_approved
    if (filter === 'approved') return artist.is_approved
    return true
  }).filter(artist => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      artist.stage_name?.toLowerCase().includes(q) ||
      artist.genre?.toLowerCase().includes(q) ||
      artist.user?.email?.toLowerCase().includes(q) ||
      artist.user?.username?.toLowerCase().includes(q)
    )
  })

  // ✅ FIXED: Changed "artist" to "a" in the approved count
  const stats = {
    total: artists.length,
    pending: artists.filter(a => !a.is_approved).length,
    approved: artists.filter(a => a.is_approved).length,  // ✅ FIXED
    totalFollowers: artists.reduce((acc, a) => acc + (a.followers_count || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading artists...</p>
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
          <h1 className="text-3xl font-bold text-white mb-1">Artist Management</h1>
          <p className="text-gray-400 text-sm">
            {stats.pending > 0 ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {stats.pending} pending approval{stats.pending !== 1 ? 's' : ''}
              </span>
            ) : (
              'All artists approved'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchArtists}
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
          { label: 'Total Artists', value: stats.total, icon: Music, color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
          { label: 'Pending', value: stats.pending, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
          { label: 'Total Followers', value: stats.totalFollowers.toLocaleString(), icon: UsersIcon, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
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
            placeholder="Search by name, genre, email..."
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
            <option value="all">All Artists ({artists.length})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="approved">Approved ({stats.approved})</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Artists Table */}
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
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Followers</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredArtists.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
                      <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No artists found</h3>
                    <p className="text-gray-500 text-sm">
                      {filter === 'pending' ? 'No pending artist applications' : 'Try adjusting your filters'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredArtists.map((artist, i) => (
                  <motion.tr 
                    key={artist.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-white/[0.03] transition-colors group ${!artist.is_approved ? 'bg-amber-500/[0.02]' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {artist.image_url ? (
                            <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white/70" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">{artist.stage_name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            {artist.user?.email || artist.user?.username || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{artist.genre || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-600" />
                        {artist.region || 'Turkana'}, {artist.country || 'Kenya'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <UsersIcon className="w-3.5 h-3.5 text-fuchsia-400" />
                        {(artist.followers_count ?? 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {artist.is_approved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {artist.created_at ? new Date(artist.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setSelectedArtist(artist); setShowDetailModal(true) }}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {!artist.is_approved && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApprove(artist.id)} 
                            disabled={actionLoading === `approve-${artist.id}`}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all disabled:opacity-50"
                            title="Approve Artist"
                          >
                            {actionLoading === `approve-${artist.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(artist.id)}
                          disabled={actionLoading === `reject-${artist.id}`}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                          title="Reject / Delete Artist"
                        >
                          {actionLoading === `reject-${artist.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedArtist && (
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
                <h3 className="text-lg font-bold text-white">Artist Details</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center overflow-hidden">
                  {selectedArtist.image_url ? (
                    <img src={selectedArtist.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white/70" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedArtist.stage_name}</h4>
                  <p className="text-sm text-gray-400">{selectedArtist.genre || 'No genre'}</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${
                    selectedArtist.is_approved 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedArtist.is_approved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {selectedArtist.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-white">{selectedArtist.region || 'Turkana'}, {selectedArtist.country || 'Kenya'}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Followers</p>
                    <p className="text-sm font-medium text-white">{(selectedArtist.followers_count ?? 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedArtist.bio || 'No bio provided.'}</p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Applied On</p>
                  <p className="text-sm text-gray-300">
                    {selectedArtist.created_at ? new Date(selectedArtist.created_at).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {!selectedArtist.is_approved && (
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleApprove(selectedArtist.id); setShowDetailModal(false) }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve Artist
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleReject(selectedArtist.id); setShowDetailModal(false) }}
                    className="flex-1 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Artists