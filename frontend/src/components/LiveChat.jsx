import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User } from 'lucide-react'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const LiveChat = ({ streamId, isEnabled, wsSend, wsConnected, user }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/live/streams/${streamId}`)
        const data = await res.json()
        if (data.chat_messages) {
          setMessages(data.chat_messages.map(msg => ({
            id: msg.id,
            user_id: msg.user_id,
            username: msg.user?.username || msg.user?.stage_name || 'Anonymous',
            avatar_url: msg.user?.avatar_url || msg.user?.image_url,
            message: msg.message,
            created_at: msg.created_at
          })))
        }
      } catch (err) {
        console.error('Failed to fetch chat messages:', err)
      }
    }
    fetchMessages()
  }, [streamId])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !isEnabled) return
    if (!wsConnected) {
      setError('Not connected to chat. Retrying...')
      return
    }

    setError(null)
    wsSend({
      type: 'chat',
      message: input.trim(),
      user_id: user?.id,
      username: user?.username || user?.stage_name || 'Anonymous',
      avatar_url: user?.avatar_url || user?.image_url
    })

    setInput('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                {msg.avatar_url ? (
                  <img 
                    src={getImageUrl(msg.avatar_url)} 
                    alt={msg.username}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400 m-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-primary truncate">{msg.username}</span>
                  <span className="text-[10px] text-gray-600">
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-300 break-words">{msg.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        {!isEnabled ? (
          <p className="text-xs text-gray-500 text-center py-2">Chat is disabled for this stream</p>
        ) : !user ? (
          <p className="text-xs text-gray-500 text-center py-2">Sign in to chat</p>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              maxLength={500}
              className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-xs focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || !wsConnected}
              className="p-2 bg-primary hover:bg-primary/90 rounded-lg transition-all disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
        {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
        {!wsConnected && isEnabled && (
          <p className="text-[10px] text-yellow-500 mt-1">Reconnecting to chat...</p>
        )}
      </div>
    </div>
  )
}

export default LiveChat