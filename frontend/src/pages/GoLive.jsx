import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Radio, Video, Copy, Check, AlertCircle, 
  Play, Square, Clock, Eye, MessageSquare,
  ChevronRight, Loader
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import liveApi from '../api/live'
import api from '../api/axios'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const GoLive = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [chatEnabled, setChatEnabled] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeStream, setActiveStream] = useState(null)
  const [myStreams, setMyStreams] = useState([])
  const [copied, setCopied] = useState(false)
  const [artist, setArtist] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'artist' && user.role !== 'admin')) {
      navigate('/')
      return
    }
    fetchArtistProfile()
    fetchMyStreams()
  }, [user, navigate])

  const fetchArtistProfile = async () => {
    try {
      const res = await api.get('/api/v1/artists/me')
      setArtist(res.data)
    } catch (err) {
      console.error('Failed to fetch artist profile:', err)
    }
  }

  const fetchMyStreams = async () => {
    try {
      const res = await liveApi.getMyStreams()
      setMyStreams(Array.isArray(res.data) ? res.data : [])
      const live = res.data?.find(s => s.status === 'live')
      if (live) setActiveStream(live)
    } catch (err) {
      console.error('Failed to fetch streams:', err)
    }
  }

  const handleCreateStream = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await liveApi.createStream({
        title: title.trim(),
        description: description.trim() || undefined,
        chat_enabled: chatEnabled,
        is_public: isPublic
      })
      setActiveStream(res.data)
      setTitle('')
      setDescription('')
      fetchMyStreams()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create stream')
    } finally {
      setLoading(false)
    }
  }

  const handleStartStream = async (streamId) => {
    setLoading(true)
    try {
      const res = await liveApi.startStream(streamId)
      setActiveStream(prev => ({ ...prev, ...res.data, status: 'live' }))
      fetchMyStreams()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start stream')
    } finally {
      setLoading(false)
    }
  }

  const handleEndStream = async (streamId) => {
    setLoading(true)
    try {
      await liveApi.endStream(streamId)
      setActiveStream(null)
      fetchMyStreams()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to end stream')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user || (user.role !== 'artist' && user.role !== 'admin')) {
    return null
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Go Live</h1>
          <p className="text-sm text-gray-400">Stream to your fans in real-time</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {activeStream?.status === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-br from-red-600/20 to-rose-600/10 border border-red-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-red-400 uppercase">Currently Live</span>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{activeStream.title}</h2>
          <p className="text-sm text-gray-400 mb-4">{activeStream.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-black/20 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Stream Key</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-white break-all">{activeStream.stream_key}</code>
                <button 
                  onClick={() => copyToClipboard(activeStream.stream_key)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">RTMP URL</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-white break-all">{activeStream.rtmp_url}</code>
                <button 
                  onClick={() => copyToClipboard(activeStream.rtmp_url)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEndStream(activeStream.id)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
            >
              <Square className="w-4 h-4" />
              {loading ? 'Ending...' : 'End Stream'}
            </button>
            <button
              onClick={() => copyToClipboard(activeStream.hls_url)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all"
            >
              <Copy className="w-4 h-4" />
              Copy HLS URL
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Use OBS, Streamlabs, or any RTMP broadcaster with the Stream Key and RTMP URL above.
          </p>
        </motion.div>
      )}

      {!activeStream && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Create New Stream
          </h2>
          
          <form onSubmit={handleCreateStream} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Stream Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Friday Night Live Mix"
                className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this stream about?"
                rows={3}
                className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chatEnabled}
                  onChange={(e) => setChatEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">Enable Chat</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">Public Stream</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Stream'}
            </button>
          </form>
        </motion.div>
      )}

      {activeStream?.status === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{activeStream.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{activeStream.description}</p>
            </div>
            <button
              onClick={() => handleStartStream(activeStream.id)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all"
            >
              <Radio className="w-4 h-4" />
              {loading ? 'Starting...' : 'Go Live Now'}
            </button>
          </div>
        </motion.div>
      )}

      {myStreams.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Stream History
          </h2>
          <div className="space-y-2">
            {myStreams.map((stream) => (
              <div 
                key={stream.id}
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${stream.status === 'live' ? 'bg-red-500 animate-pulse' : stream.status === 'ended' ? 'bg-gray-500' : 'bg-yellow-500'}`} />
                  <div>
                    <h4 className="font-medium text-sm">{stream.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {stream.total_viewers || 0} viewers</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {stream.chat_enabled ? 'Chat On' : 'Chat Off'}</span>
                      <span className="capitalize">{stream.status}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/live/${stream.id}`)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GoLive