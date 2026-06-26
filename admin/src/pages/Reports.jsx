import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Check, 
  X, 
  Clock, 
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  ShieldCheck,
  MessageSquare,
  Flag,
  ChevronDown,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Music,
  Users,
  ListMusic,
  User
} from 'lucide-react'
import axios from 'axios'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setRefreshing(true)
      const res = await axios.get('/api/v1/admin/reports')
      setReports(res.data)
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await axios.patch(`/api/v1/admin/reports/${reportId}`, { status: newStatus })
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r))
    } catch (err) {
      console.error('Failed to update report:', err)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.content_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
    total: reports.length
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: Clock, 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/20',
          label: 'Pending Review'
        }
      case 'resolved':
        return { 
          icon: CheckCircle2, 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/20',
          label: 'Resolved'
        }
      case 'dismissed':
        return { 
          icon: XCircle, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/10', 
          border: 'border-gray-500/20',
          label: 'Dismissed'
        }
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/10', 
          border: 'border-gray-500/20',
          label: status
        }
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'song': return Music
      case 'artist': return Users
      case 'playlist': return ListMusic
      case 'user': return User
      default: return Flag
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
        />
        <p className="text-gray-500 text-sm animate-pulse">Loading reports...</p>
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
          <h1 className="text-3xl font-bold text-white mb-1">Content Reports</h1>
          <p className="text-gray-400 text-sm">Review and manage user-submitted reports</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchReports}
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
          { label: 'Total Reports', value: stats.total, icon: Flag, color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
          { label: 'Dismissed', value: stats.dismissed, icon: XCircle, color: 'from-gray-500 to-slate-500', bg: 'bg-gray-500/10', text: 'text-gray-400' },
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
            placeholder="Search reports by reason, type, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="song">Song</option>
              <option value="artist">Artist</option>
              <option value="playlist">Playlist</option>
              <option value="user">User</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Reports Table */}
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
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              <AnimatePresence>
                {filteredReports.map((report, i) => {
                  const statusConfig = getStatusConfig(report.status)
                  const StatusIcon = statusConfig.icon
                  const TypeIcon = getTypeIcon(report.content_type)

                  return (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                            {report.reporter?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">@{report.reporter?.username || `user_${report.reporter_id}`}</p>
                            <p className="text-xs text-gray-500">ID: {report.reporter_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                            <TypeIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-300 capitalize">{report.content_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300 max-w-xs truncate" title={report.reason}>
                          {report.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(report.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedReport(report); setShowDetailModal(true) }}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {report.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all"
                                title="Resolve"
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                className="p-2 rounded-lg hover:bg-gray-500/10 text-gray-500 hover:text-gray-300 transition-all"
                                title="Dismiss"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
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
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No reports found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'All clear! No reports to review.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReport && (
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
                <h3 className="text-lg font-bold text-white">Report Details</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                    {selectedReport.reporter?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">@{selectedReport.reporter?.username || `user_${selectedReport.reporter_id}`}</p>
                    <p className="text-xs text-gray-500">Reporter ID: {selectedReport.reporter_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Content Type</p>
                    <p className="text-sm font-medium text-white capitalize">{selectedReport.content_type}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Content ID</p>
                    <p className="text-sm font-medium text-white">{selectedReport.content_id}</p>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Reason</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedReport.reason}</p>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusConfig(selectedReport.status).bg} ${getStatusConfig(selectedReport.status).color} ${getStatusConfig(selectedReport.status).border}`}>
                    {(() => {
                      const Icon = getStatusConfig(selectedReport.status).icon
                      return <Icon className="w-3.5 h-3.5" />
                    })()}
                    {getStatusConfig(selectedReport.status).label}
                  </span>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selectedReport.created_at).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleStatusUpdate(selectedReport.id, 'resolved'); setShowDetailModal(false) }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleStatusUpdate(selectedReport.id, 'dismissed'); setShowDetailModal(false) }}
                    className="flex-1 py-3 bg-white/[0.05] border border-white/[0.08] text-gray-300 rounded-xl font-medium hover:bg-white/[0.1] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
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

export default Reports