import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Clock, Music } from 'lucide-react'
import axios from 'axios'
import { usePlayer } from '../context/PlayerContext'

const AlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playSong } = usePlayer()

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await axios.get(`/api/v1/albums/${id}`)
        setAlbum(res.data)
      } catch (err) {
        console.error('Failed to fetch album:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbum()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!album) {
    return <div className="text-center py-20 text-gray-400">Album not found</div>
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-start"
      >
        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
          <img 
            src={album.cover_url || '/default-cover.jpg'} 
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-primary font-medium mb-2">Album</p>
          <h1 className="text-4xl font-bold mb-4">{album.title}</h1>
          <p className="text-gray-400 mb-4">{album.artist?.stage_name}</p>
          <p className="text-sm text-gray-500 mb-6">{album.description}</p>
          <button 
            onClick={() => album.songs?.length > 0 && playSong(album.songs[0], album.songs)}
            className="btn-primary flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Play All
          </button>
        </div>
      </motion.div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-gray-400 uppercase">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Plays</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {album.songs?.map((song, i) => (
              <motion.tr 
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                onClick={() => playSong(song)}
              >
                <td className="px-6 py-4 text-gray-500 group-hover:text-white">
                  <span className="group-hover:hidden">{i + 1}</span>
                  <Play className="w-4 h-4 hidden group-hover:block" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={song.cover_url || '/default-cover.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-xs text-gray-400">{album.artist?.stage_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{song.play_count?.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(song.duration)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default AlbumPage
