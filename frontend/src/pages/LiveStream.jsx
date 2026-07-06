import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Radio, Users, Heart, Share2, ArrowLeft, 
  MessageSquare, Loader, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import liveApi from '../api/live'
import useWebSocket from '../hooks/useWebSocket'
import LiveChat from '../components/LiveChat'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const LiveStream = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const videoRef = useRef(null)

  const wsUrl = `${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws')}/api/v1/ws/live/${id}`

  const { isConnected, lastMessage, send } = useWebSocket(wsUrl, {
    onMessage: (data) => {
      if (data.type === 'viewer_count') {
        setViewerCount(data.count)
      }
    }
  })

  useEffect(() => {
    fetchStream()
    return () => {
      liveApi.leaveStream(id, sessionIdRef.current).catch(() => {})
    }
  }, [id])

  const fetchStream = async () => {
    try {
      setLoading(true)
      const res = await liveApi.getStream(id)
      setStream(res.data)
      setViewerCount(res.data.current_viewers || 0)
      await liveApi.joinStream(id, sessionIdRef.current)
    } catch (err) {
      setError(err.response?.data?.detail || 'Stream not found')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${stream?.title} - Live on Apiaro Music`,
        url: window.location.href
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading stream...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
        <AlertCircle className="w-16 h-16 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-300">{error}</h2>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    )
  }

  if (!stream) return null

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-black">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase">Live</span>
          </div>
        </div>

        <div className="flex-1 relative bg-black flex items-center justify-center">
          {stream.hls_url ? (
            <video
              ref={videoRef}
              src={stream.hls_url}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain"
              onError={() => setError('Failed to load stream. The artist may have ended the broadcast.')}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center">
              <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Stream URL not available</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
            <div className="pointer-events-auto">
              <h1 className="text-lg font-bold text-white drop-shadow-lg">{stream.title}</h1>
              <p className="text-sm text-gray-300 drop-shadow-lg">{stream.artist?.stage_name}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full pointer-events-auto">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">{viewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
              <img 
                src={getImageUrl(stream.artist?.image_url)} 
                alt={stream.artist?.stage_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/default-avatar.jpg' }}
              />
            </div>
            <div>
              <p className="font-medium text-sm">{stream.artist?.stage_name}</p>
              <p className="text-xs text-gray-500">{stream.artist?.followers_count?.toLocaleString()} followers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-xl transition-all ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 border-l border-white/5 flex flex-col h-64 lg:h-auto">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-sm">Live Chat</h3>
          {stream.chat_enabled === false && (
            <span className="text-xs text-gray-500 ml-auto">Disabled</span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <LiveChat 
            streamId={stream.id} 
            isEnabled={stream.chat_enabled !== false}
            wsSend={send}
            wsConnected={isConnected}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}

export default LiveStream