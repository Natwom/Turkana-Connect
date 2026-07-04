import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Users, Heart, Share2, Loader2 } from 'lucide-react'
import api from '../api/axios'
import SongCard from '../components/SongCard'
import SongCommentsModal from '../components/SongCommentsModal'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'

const getImageUrl = (path) => {
  if (!path) return '/default-avatar.jpg'
  if (path.startsWith('http')) return path
  return `http://localhost:8000${path}`
}

const ArtistProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { playSong } = usePlayer()
  
  const [artist, setArtist] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Comment modal state
  const [commentModalSong, setCommentModalSong] = useState(null)

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await api.get(`/api/v1/artists/${id}`)
        setArtist(res.data)
      } catch (err) {
        console.error('Failed to fetch artist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [id])

  const handleFollow = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (followLoading) return
    
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await api.delete(`/api/v1/artists/${id}/follow`)
        setIsFollowing(false)
        setArtist(prev => prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count || 1) - 1) } : prev)
      } else {
        await api.post(`/api/v1/artists/${id}/follow`)
        setIsFollowing(true)
        setArtist(prev => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : prev)
      }
    } catch (err) {
      console.error('Follow action failed:', err)
      alert(err.response?.data?.detail || 'Failed to follow/unfollow')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleOpenComments = (song) => {
    setCommentModalSong(song)
  }

  const handleCloseComments = () => {
    setCommentModalSong(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!artist) {
    return <div className="text-center py-20 text-gray-400">Artist not found</div>
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-start"
      >
        <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-primary/20">
          <img 
            src={getImageUrl(artist.image_url)} 
            alt={artist.stage_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/default-avatar.jpg' }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {artist.is_verified && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                Verified
              </span>
            )}
            {!artist.is_approved && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                Pending Approval
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{artist.stage_name}</h1>
          <p className="text-gray-400 mb-4">{artist.bio}</p>
          <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {artist.followers_count?.toLocaleString() || 0} followers
            </span>
            <span>{artist.total_streams?.toLocaleString() || 0} streams</span>
            <span>{artist.genre || 'No genre'}</span>
            <span>{artist.region || 'Turkana'}, {artist.country || 'Kenya'}</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => artist.songs?.length > 0 && playSong(artist.songs[0], artist.songs)}
              className="px-6 py-3 bg-primary rounded-xl font-semibold hover:bg-primary/80 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Play
            </button>
            <button 
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-6 py-3 border rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isFollowing 
                  ? 'border-primary text-primary hover:bg-primary/10' 
                  : 'border-white/20 hover:bg-white/5 text-white'
              }`}
            >
              {followLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${isFollowing ? 'fill-primary' : ''}`} />
              )}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="p-3 border border-white/20 hover:bg-white/5 rounded-xl transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {artist.songs?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artist.songs.map((song, i) => (
              <SongCard 
                key={song.id} 
                song={song} 
                index={i} 
                onOpenComments={handleOpenComments}
              />
            ))}
          </div>
        </section>
      )}

      {artist.albums?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artist.albums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 hover-lift cursor-pointer"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3">
                  <img 
                    src={getImageUrl(album.cover_url)} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/default-cover.jpg' }}
                  />
                </div>
                <h3 className="font-semibold text-sm truncate">{album.title}</h3>
                <p className="text-xs text-gray-400">{album.songs?.length || 0} songs</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Song Comments Modal */}
      <SongCommentsModal 
        song={commentModalSong}
        isOpen={!!commentModalSong}
        onClose={handleCloseComments}
      />
    </div>
  )
}

export default ArtistProfile