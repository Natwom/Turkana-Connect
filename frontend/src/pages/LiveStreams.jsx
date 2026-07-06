import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, Users, Play, ChevronRight, Loader } from 'lucide-react'
import liveApi from '../api/live'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const LiveStreams = () => {
  const navigate = useNavigate()
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreams()
    const interval = setInterval(fetchStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStreams = async () => {
    try {
      const res = await liveApi.getActiveStreams(20)
      setStreams(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch live streams:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Finding live streams...</p>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <Radio className="w-8 h-8 text-red-500" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Live Now</h1>
          <p className="text-sm text-gray-400">{streams.length} stream{streams.length !== 1 ? 's' : ''} happening now</p>
        </div>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-20">
          <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">No one is live right now</h2>
          <p className="text-gray-500 text-sm">Check back later or discover new artists to follow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream, i) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/live/${stream.id}`)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-gray-900 to-black border border-white/[0.06] hover:border-red-500/30 transition-all"
            >
              <div className="aspect-video relative">
                <img 
                  src={getImageUrl(stream.artist?.image_url)} 
                  alt={stream.artist?.stage_name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-md">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase">Live</span>
                </div>
                
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                  <Users className="w-3 h-3 text-white" />
                  <span className="text-[10px] text-white font-medium">{(stream.current_viewers || 0).toLocaleString()}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-sm truncate group-hover:text-red-400 transition-colors">{stream.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img 
                        src={getImageUrl(stream.artist?.image_url)} 
                        alt={stream.artist?.stage_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{stream.artist?.stage_name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveStreams