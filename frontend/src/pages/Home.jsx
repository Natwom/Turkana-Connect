import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { usePlayer } from '../hooks/usePlayer'
import { 
  TrendingUp, Disc, Users, Sparkles, Play, ChevronRight, 
  Headphones, Flame, Clock, Star, ArrowRight, Music, Mic2,
  Radio, Award, Heart, Share2, BarChart3
} from 'lucide-react'

const getImageUrl = (path) => {
  if (!path) return '/default-cover.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const Home = () => {
  const navigate = useNavigate()
  const player = usePlayer() || {}
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  const [trending, setTrending] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [artists, setArtists] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredSong, setFeaturedSong] = useState(null)
  const [stats, setStats] = useState({ songs: 0, artists: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo('Starting fetches...')
        
        // Fetch each endpoint individually with error isolation
        let songsData = []
        let artistsData = []
        let catsData = []
        let errors = []

        // Fetch songs
        try {
          console.log('Fetching songs from:', api.defaults.baseURL + '/api/v1/songs?limit=12')
          const songsRes = await api.get('/api/v1/songs?limit=12')
          console.log('Songs response:', songsRes.status, songsRes.data)
          songsData = Array.isArray(songsRes.data) ? songsRes.data : []
          setDebugInfo(prev => prev + `\n✅ Songs: ${songsData.length} items`)
        } catch (e) {
          console.error('Songs fetch FAILED:', e.message, e.response?.status, e.response?.data)
          errors.push(`Songs: ${e.message} (status: ${e.response?.status || 'network'})`)
          setDebugInfo(prev => prev + `\n❌ Songs failed: ${e.message}`)
        }

        // Fetch artists
        try {
          console.log('Fetching artists from:', api.defaults.baseURL + '/api/v1/artists?limit=8')
          const artistsRes = await api.get('/api/v1/artists?limit=8')
          console.log('Artists response:', artistsRes.status, artistsRes.data)
          artistsData = Array.isArray(artistsRes.data) ? artistsRes.data : []
          setDebugInfo(prev => prev + `\n✅ Artists: ${artistsData.length} items`)
        } catch (e) {
          console.error('Artists fetch FAILED:', e.message, e.response?.status, e.response?.data)
          errors.push(`Artists: ${e.message} (status: ${e.response?.status || 'network'})`)
          setDebugInfo(prev => prev + `\n❌ Artists failed: ${e.message}`)
        }

        // Fetch categories
        try {
          console.log('Fetching categories from:', api.defaults.baseURL + '/api/v1/categories')
          const catsRes = await api.get('/api/v1/categories')
          console.log('Categories response:', catsRes.status, catsRes.data)
          catsData = Array.isArray(catsRes.data) ? catsRes.data : []
          setDebugInfo(prev => prev + `\n✅ Categories: ${catsData.length} items`)
        } catch (e) {
          console.error('Categories fetch FAILED:', e.message, e.response?.status, e.response?.data)
          errors.push(`Categories: ${e.message} (status: ${e.response?.status || 'network'})`)
          setDebugInfo(prev => prev + `\n❌ Categories failed: ${e.message}`)
        }

        // Set data even if some fetches failed
        setTrending(songsData.slice(0, 6))
        setNewReleases(songsData.slice(6, 12))
        setFeaturedSong(songsData[0] || null)
        setArtists(artistsData)
        setCategories(catsData.slice(0, 6))
        setStats({
          songs: songsData.length,
          artists: artistsData.length,
          users: artistsData.reduce((acc, a) => acc + (a.followers_count || 0), 0)
        })

        // Only show error if ALL fetches failed
        if (errors.length === 3) {
          setError('All API requests failed. Check console for details.\n' + errors.join('\n'))
        } else if (errors.length > 0) {
          // Some succeeded, show partial data
          console.warn('Partial load - some endpoints failed:', errors)
        }
      } catch (err) {
        console.error('Unexpected error in fetchData:', err)
        setError(err.message || 'Unexpected error. Check console.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePlaySong = (song) => {
    if (player?.playSong) player.playSong(song)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse">Loading your music...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4 gap-4">
        <Headphones className="w-16 h-16 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-300">Something went wrong</h2>
        <p className="text-gray-500 max-w-md whitespace-pre-line">{error}</p>
        <div className="text-xs text-gray-600 text-left max-w-md bg-gray-900 p-4 rounded-lg">
          <p className="font-bold mb-2">Debug Info:</p>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-medium transition-all">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-0 pb-10">
      
      {/* Debug banner - remove after fixing */}
      {debugInfo && (
        <div className="px-4 md:px-8 pt-2">
          <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-2 text-xs text-yellow-400 font-mono">
            <p className="font-bold">Debug:</p>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-400">Live Now</span>
            </div>
            <span className="text-xs text-gray-500">1,234 listeners online</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {stats.songs} songs</span>
            <span className="flex items-center gap-1"><Mic2 className="w-3 h-3" /> {stats.artists} artists</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative mx-4 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0">
          <img 
            src={getImageUrl(featuredSong?.cover_url)} 
            alt="Featured" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/default-cover.jpg' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
        </div>
        
        <div className="relative z-10 flex items-center gap-6 p-6 md:p-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ring-2 ring-primary/30">
            <img 
              src={getImageUrl(featuredSong?.cover_url)} 
              alt="Featured" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/default-cover.jpg' }}
            />
            <button onClick={() => handlePlaySong(featuredSong)} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-12 h-12 fill-current text-white" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-bold uppercase">Featured</span>
              <span className="flex items-center gap-1 text-yellow-400 text-xs"><Flame className="w-3 h-3" /> Trending</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 truncate">{featuredSong?.title || 'Discover Turkana Music'}</h1>
            <p className="text-gray-400 text-sm mb-3">{featuredSong?.artist?.stage_name || 'Various Artists'}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => handlePlaySong(featuredSong)} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all hover:scale-105">
                <Play className="w-4 h-4 fill-current" /> Play Now
              </button>
              <button onClick={() => featuredSong && navigate(`/artist/${featuredSong.artist_id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-sm transition-all">
                <Users className="w-4 h-4" /> Artist
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Heart className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* QUICK ACCESS ROW */}
      <section className="px-4 md:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Radio, label: 'Live Radio', color: 'text-red-400', bg: 'bg-red-500/10', desc: 'Streaming now' },
            { icon: TrendingUp, label: 'Top 50', color: 'text-primary', bg: 'bg-primary/10', desc: 'This week' },
            { icon: Award, label: 'New Artists', color: 'text-yellow-400', bg: 'bg-yellow-500/10', desc: 'Fresh talent' },
            { icon: BarChart3, label: 'Charts', color: 'text-green-400', bg: 'bg-green-500/10', desc: 'Rankings' },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('/search')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/30 hover:bg-surface transition-all text-left"
            >
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section className="px-4 md:px-8 py-4">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <button onClick={() => navigate('/search?sort=trending')} className="group flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {trending.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No trending songs yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {trending.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHoveredSong(song.id)}
                onMouseLeave={() => setHoveredSong(null)}
                onClick={() => handlePlaySong(song)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <img 
                    src={getImageUrl(song.cover_url)} 
                    alt={song.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/default-cover.jpg' }}
                  />
                  <AnimatePresence>
                    {hoveredSong === song.id && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{song.title}</h3>
                <p className="text-xs text-gray-500 truncate">{song.artist?.stage_name || 'Unknown'}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED ARTISTS */}
      <section className="px-4 md:px-8 py-4">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold">Featured Artists</h2>
          </div>
          <button onClick={() => navigate('/search?type=artists')} className="group flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            Discover <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No artists yet</div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="group text-center cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 ring-2 ring-transparent group-hover:ring-primary/40 transition-all">
                  <img 
                    src={getImageUrl(artist.image_url)} 
                    alt={artist.stage_name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                  />
                </div>
                <h3 className="font-semibold text-xs truncate group-hover:text-primary transition-colors">{artist.stage_name}</h3>
                <p className="text-[10px] text-gray-500">{(artist.followers_count ?? 0).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* NEW RELEASES */}
      <section className="px-4 md:px-8 py-4">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">New Releases</h2>
          </div>
          <button onClick={() => navigate('/search?sort=newest')} className="group flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            See All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {newReleases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No new releases yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {newReleases.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handlePlaySong(song)}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface/80 cursor-pointer transition-all"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={getImageUrl(song.cover_url)} 
                    alt={song.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/default-cover.jpg' }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{song.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{song.artist?.stage_name || 'Unknown'}</p>
                </div>
                <span className="text-xs text-gray-600 font-medium">{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '3:45'}</span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="px-4 md:px-8 py-4">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-bold">Browse by Mood</h2>
          </div>
          <button onClick={() => navigate('/categories')} className="group flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            See All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No categories yet</div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/categories?genre=${encodeURIComponent(cat.slug || cat.name)}`)}
                className="relative h-28 rounded-xl overflow-hidden cursor-pointer group"
                style={{ backgroundColor: cat.color || '#7C3AED' }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                  <h3 className="font-bold text-sm text-center">{cat.name}</h3>
                  {cat.description && <p className="text-[10px] text-white/70 text-center mt-1 line-clamp-2">{cat.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className="px-4 md:px-8 pt-4 pb-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary text-xs font-bold uppercase tracking-wider">For Artists</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Share Your Sound With The World</h2>
              <p className="text-gray-400 text-sm max-w-md">
                Join {stats.artists}+ artists on Turkana Music Hub. Upload, share, and grow your audience.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/become-artist')}
                className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-bold text-sm transition-all hover:scale-105 whitespace-nowrap"
              >
                Become an Artist
              </button>
              <button 
                onClick={() => navigate('/upload-song')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-sm transition-all whitespace-nowrap"
              >
                Upload Song
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { label: 'Songs', value: stats.songs, icon: Music },
              { label: 'Artists', value: stats.artists, icon: Mic2 },
              { label: 'Listeners', value: `${(stats.users / 1000).toFixed(1)}K+`, icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER MINI */}
      <div className="px-4 md:px-8 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-white/5 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>© 2026 Turkana Music Hub</span>
            <button onClick={() => navigate('/categories')} className="hover:text-gray-400 transition-colors">Categories</button>
            <button onClick={() => navigate('/search')} className="hover:text-gray-400 transition-colors">Search</button>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home