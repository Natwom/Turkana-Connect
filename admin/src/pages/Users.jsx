import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Search, 
  Shield, 
  UserCheck, 
  UserX,
  Clock,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
  Mail,
  Calendar,
  Crown,
  Music,
  Eye,
  Edit3,
  Ban,
  CheckCircle2,
  X
} from 'lucide-react'
import api from '../api/axios'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/api/v1/admin/users')  // ← FIXED: was /admin/users
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      if (err.response?.status === 401) {
        console.error('Unauthorized - redirecting to login')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/api/v1/admin/users/${userId}`)  // ← FIXED: was /admin/users/${userId}
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    artist: users.filter(u => u.role === 'artist').length,
    listener: users.filter(u => u.role === 'user' || !u.role).length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length
  }

  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin':
        return { icon: Crown, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Admin' }
      case 'artist':
        return { icon: Music, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', label: 'Artist' }
      default:
        return { icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'User' }
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
        <p className="text-gray-500 text-sm animate-pulse">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
          <p className="text-gray-400 text-sm">Manage and monitor platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: User, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
          { label: 'Admins', value: stats.admin, icon: Crown, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
          { label: 'Artists', value: stats.artist, icon: Music, color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400' },
          { label: 'Active Now', value: stats.active, icon: UserCheck, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
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
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="artist">Artist</option>
              <option value="user">User</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </motion.div>

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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              <AnimatePresence>
                {filteredUsers.map((user, i) => {
                  const roleConfig = getRoleConfig(user.role)
                  const RoleIcon = roleConfig.icon

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.full_name || user.username}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-gray-600" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                          user.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(user.created_at).toLocaleDateString('en-US', { 
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
                            onClick={() => { setSelectedUser(user); setShowDetailModal(true) }}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                            title="Delete User"
                          >
                            <Ban className="w-4 h-4" />
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

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No users registered yet.'}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDetailModal && selectedUser && (
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
              className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">User Details</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <h4 className="text-lg font-bold text-white">{selectedUser.full_name || selectedUser.username}</h4>
                <p className="text-sm text-gray-400">@{selectedUser.username}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm text-white">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getRoleConfig(selectedUser.role).bg} ${getRoleConfig(selectedUser.role).color} ${getRoleConfig(selectedUser.role).border}`}>
                    {(() => {
                      const Icon = getRoleConfig(selectedUser.role).icon
                      return <Icon className="w-3 h-3" />
                    })()}
                    {getRoleConfig(selectedUser.role).label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`text-sm ${selectedUser.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm text-gray-500">Joined</span>
                  <span className="text-sm text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm text-gray-500">User ID</span>
                  <span className="text-sm text-gray-400 font-mono">{selectedUser.id}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleDeleteUser(selectedUser.id); setShowDetailModal(false) }}
                  className="flex-1 py-3 rounded-xl font-medium text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                >
                  Delete User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Users