import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Trash2, User, Music } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import commentsApi from '../api/comments'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Just now'
  const date = new Date(isoString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

const SongCommentsModal = ({ song, isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth()
  const { playSong } = usePlayer()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (isOpen && song?.id) {
      fetchComments()
    }
  }, [isOpen, song?.id])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await commentsApi.getComments(song.id)
      setComments(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return
    
    setSubmitting(true)
    try {
      const res = await commentsApi.postComment(song.id, newComment.trim())
      setComments(prev => [res.data, ...prev])
      setNewComment('')
    } catch (err) {
      console.error('Failed to post comment:', err)
      alert(err.response?.data?.detail || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await commentsApi.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
      alert('Failed to delete comment')
    }
  }

  const handlePlaySong = () => {
    playSong(song)
  }

  if (!isOpen || !song) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#12121a] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Song Header */}
          <div className="p-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-violet-400" />
                Comments
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition-colors"
              onClick={handlePlaySong}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={song.cover_url || '/default-cover.jpg'} 
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{song.title}</p>
                <p className="text-xs text-gray-500">{song.artist_name || song.artist?.stage_name || 'Unknown Artist'}</p>
              </div>
              <div className="text-xs text-gray-600">{comments.length} comments</div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                    {comment.user?.avatar_url ? (
                      <img 
                        src={getImageUrl(comment.user.avatar_url)} 
                        alt={comment.user?.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{comment.user?.username || 'Unknown'}</span>
                      <span className="text-[10px] text-gray-600">{formatTimeAgo(comment.created_at)}</span>
                      {comment.user_id === user?.id && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/[0.08]">
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={getImageUrl(user.avatar_url)} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none transition-colors"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-violet-400 hover:text-violet-300 disabled:text-gray-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-2">Sign in to comment</p>
                <button 
                  onClick={() => { onClose(); window.location.href = '/login' }}
                  className="px-4 py-2 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/20 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Inline icon component to avoid import issues
const MessageCircleIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
)

export default SongCommentsModal