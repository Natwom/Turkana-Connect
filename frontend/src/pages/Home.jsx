import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import songsApi from '../api/songs'
import artistsApi from '../api/artists'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../context/AuthContext'
import {
  TrendingUp, Disc, Users, Sparkles, Play, ChevronRight,
  Headphones, Flame, Clock, Star, ArrowRight, Music, Mic2,
  Award, Heart, Share2, Eye, X,
  Trophy, Zap, History, Compass, UserCheck, Mic, Bell, Plus
} from 'lucide-react'

const getImageUrl = (path) => {
  if (!path) return '/default-cover.jpg'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Recently'
  const date = new Date(isoString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

const Home = () => {
  const navigate = useNavigate()
  const player = usePlayer() || {}
  const { user } = useAuth()

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  const [trending, setTrending] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredSong, setFeaturedSong] = useState(null)
  const [stats, setStats] = useState({ songs: 0, artists: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [hoveredArtist, setHoveredArtist] = useState(null)

  const [activeFeedTab, setActiveFeedTab] = useState('forYou')
  const [forYouSongs, setForYouSongs] = useState([])
  const [followingSongs, setFollowingSongs] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)

  const [activeModal, setActiveModal] = useState(null)
  const [modalData, setModalData] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        let trendingData = []
        let newReleasesData = []
        let featuredArtistsData = []
        let catsData = []
        let errors = []

        try {
          const trendingRes = await songsApi.getTrendingSongs(12)
          trendingData = Array.isArray(trendingRes.data) ? trendingRes.data : []
        } catch (e) {
          console.error('Trending fetch failed:', e.message)
          errors.push('trending')
        }

        try {
          const newReleasesRes = await songsApi.getNewReleases(12)
          newReleasesData = Array.isArray(newReleasesRes.data) ? newReleasesRes.data : []
        } catch (e) {
          console.error('New releases fetch failed:', e.message)
          errors.push('newReleases')
        }

        try {
          const featuredRes = await artistsApi.getFeaturedArtists(12)
          featuredArtistsData = Array.isArray(featuredRes.data) ? featuredRes.data : []
        } catch (e) {
          console.error('Featured artists fetch failed:', e.message)
          errors.push('featuredArtists')
        }

        try {
          const catsRes = await api.get('/api/v1/categories')
          catsData = Array.isArray(catsRes.data) ? catsRes.data : []
        } catch (e) {
          console.error('Categories fetch failed:', e.message)
          errors.push('categories')
        }

        setTrending(trendingData)
        setNewReleases(newReleasesData)
        setFeaturedSong(trendingData[0] || newReleasesData[0] || null)
        setFeaturedArtists(featuredArtistsData)
        setCategories(catsData.slice(0, 6))
        setStats({
          songs: (trendingData.length + newReleasesData.length),
          artists: featuredArtistsData.length,
          users: featuredArtistsData.reduce((acc, a) => acc + (a.followers_count || 0), 0)
        })

        const mixed = [...trendingData, ...newReleasesData].filter((song, index, self) =>
          index === self.findIndex((s) => s.id === song.id)
        )
        setForYouSongs(mixed.slice(0, 12))

        if (errors.length >= 3) {
          setError('Unable to load content. Please try again.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Unable to load content. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (activeFeedTab === 'following' && user) {
      fetchFollowingFeed()
    }
  }, [activeFeedTab, user])

  const fetchFollowingFeed = async () => {
    setFeedLoading(true)
    try {
      const [feedRes, listRes] = await Promise.all([
        artistsApi.getFollowingFeed(12).catch(() => ({ data: [] })),
        artistsApi.getFollowingList().catch(() => ({ data: [] }))
      ])
      setFollowingSongs(Array.isArray(feedRes.data) ? feedRes.data : [])
      setFollowingList(Array.isArray(listRes.data) ? listRes.data : [])
    } catch (err) {
      console.error('Following feed failed:', err)
    } finally {
      setFeedLoading(false)
    }
  }

  const openModal = async (type) => {
    setActiveModal(type)
    setModalLoading(true)
    setModalData([])

    try {
      if (type === 'recent') {
        if (!user) {
          setModalData([])
          setModalLoading(false)
          return
        }
        const res = await api.get('/api/v1/users/me/history?limit=8')
        setModalData(Array.isArray(res.data) ? res.data : [])
      } else if (type === 'fresh') {
        const res = await songsApi.getNewReleases(8)
        setModalData(Array.isArray(res.data) ? res.data : [])
      } else if (type === 'artists') {
        const res = await artistsApi.getFeaturedArtists(8)
        setModalData(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err) {
      console.error('Modal fetch failed:', err)
      setModalData([])
    } finally {
      setModalLoading(false)
    }
  }

  const handlePlayTrending = (song) => {
    if (player?.playSong) {
      player.playSong(song, trending)
    }
  }

  const handlePlayNewRelease = (song) => {
    if (player?.playSong) {
      player.playSong(song, newReleases)
    }
  }

  const handlePlayFeatured = () => {
    if (player?.playSong && featuredSong) {
      player.playSong(featuredSong, trending)
    }
  }

  const handlePlayForYou = (song) => {
    if (player?.playSong) {
      player.playSong(song, forYouSongs)
    }
  }

  const handlePlayFollowing = (song) => {
    if (player?.playSong) {
      player.playSong(song, followingSongs)
    }
  }

  const getArtistName = (song) => {
    if (!song) return 'Unknown Artist'
    return song.artist_name || song.artist?.stage_name || 'Unknown Artist'
  }

  const getModalTitle = () => {
    switch (activeModal) {
      case 'recent': return 'Continue Listening'
      case 'fresh': return 'Fresh Drops'
      case 'artists': return 'Top Artists'
      default: return ''
    }
  }

  const getModalIcon = () => {
    switch (activeModal) {
      case 'recent': return History
      case 'fresh': return Zap
      case 'artists': return Trophy
      default: return Star
    }
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
        <p className="text-gray-500 max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-medium transition-all">
          Try Again
        </button>
      </div>
    )
  }

  const ModalIcon = getModalIcon()

  const feedTabs = [
    { id: 'forYou', label: 'For You', icon: Compass },
    { id: 'following', label: 'Following', icon: UserCheck },
  ]

  return (
    <div className="space-y-0 pb-10">

      <div className="px-4 md:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">{stats.songs} songs online</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {stats.songs} songs</span>
            <span className="flex items-center gap-1"><Mic2 className="w-3 h-3" /> {stats.artists} artists</span>
          </div>
        </div>
      </div>

      <motion.section
        ref={heroRef}
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
            <button onClick={handlePlayFeatured} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-12 h-12 fill-current text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-bold uppercase">Featured</span>
              <span className="flex items-center gap-1 text-yellow-400 text-xs"><Flame className="w-3 h-3" /> Trending</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 truncate">{featuredSong?.title || 'Discover Apiaro Music'}</h1>
            <p className="text-gray-400 text-sm mb-3">{getArtistName(featuredSong)}</p>
            <div className="flex items-center gap-3">
              <button onClick={handlePlayFeatured} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all hover:scale-105">
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

      <section className="px-4 md:px-8 py-4">
        <div className="flex items-center gap-2 mb-4">
          {feedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFeedTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeFeedTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeFeedTab === tab.id && (
                <motion.div
                  layoutId="feedTab"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {activeFeedTab === 'forYou' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {forYouSongs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No songs available yet</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {forYouSongs.map((song, i) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onMouseEnter={() => setHoveredSong(song.id)}
                    onMouseLeave={() => setHoveredSong(null)}
                    onClick={() => handlePlayForYou(song)}
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
                    </div>
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{song.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{getArtistName(song)}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeFeedTab === 'following' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!user ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Sign in to see updates</h3>
                <p className="text-gray-500 text-sm mb-4">Follow your favorite artists and never miss a new release.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-medium text-sm transition-all"
                >
                  Sign In
                </button>
              </div>
            ) : feedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : followingList.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">You're not following anyone yet</h3>
                <p className="text-gray-500 text-sm mb-4">Discover and follow artists to see their latest songs here.</p>
                <button
                  onClick={() => navigate('/search?type=artists')}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-medium text-sm transition-all"
                >
                  Discover Artists
                </button>
              </div>
            ) : followingSongs.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No new releases from followed artists</h3>
                <p className="text-gray-500 text-sm">Check back later for updates from artists you follow.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {followingList.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="flex flex-col items-center gap-1.5 min-w-[64px]"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-primary/50 transition-all">
                        <img
                          src={getImageUrl(artist.image_url)}
                          alt={artist.stage_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 truncate max-w-[64px]">{artist.stage_name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {followingSongs.map((song, i) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onMouseEnter={() => setHoveredSong(song.id)}
                      onMouseLeave={() => setHoveredSong(null)}
                      onClick={() => handlePlayFollowing(song)}
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
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary/80 backdrop-blur-sm rounded text-[9px] font-bold text-white uppercase">
                          New
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{song.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{getArtistName(song)}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </section>

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
                onClick={() => handlePlayTrending(song)}
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
                <p className="text-xs text-gray-500 truncate">{getArtistName(song)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

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

        {featuredArtists.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No featured artists yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {featuredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHoveredArtist(artist.id)}
                onMouseLeave={() => setHoveredArtist(null)}
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <img
                    src={getImageUrl(artist.image_url)}
                    alt={artist.stage_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/default-avatar.jpg' }}
                  />
                  <AnimatePresence>
                    {hoveredArtist === artist.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
                      >
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {artist.is_verified && (
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm truncate group-hover:text-secondary transition-colors">{artist.stage_name}</h3>
                <p className="text-xs text-gray-500 truncate">{(artist.followers_count ?? 0).toLocaleString()} followers</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* NEW RELEASES — shows upload time, newest on top */}
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
                onClick={() => handlePlayNewRelease(song)}
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
                  <p className="text-xs text-gray-500 truncate">{getArtistName(song)}</p>
                </div>
                {/* SHOWS UPLOAD TIME instead of duration */}
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  {formatTimeAgo(song.created_at)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

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
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
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
                Join {stats.artists}+ artists on Apiaro Music. Upload, share, and grow your audience.
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

      <div className="px-4 md:px-8 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-white/5 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>© 2026 Apiaro Music</span>
            <button onClick={() => navigate('/categories')} className="hover:text-gray-400 transition-colors">Categories</button>
            <button onClick={() => navigate('/search')} className="hover:text-gray-400 transition-colors">Search</button>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> All systems operational</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12121a] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    <ModalIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{getModalTitle()}</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : modalData.length === 0 ? (
                  <div className="text-center py-12">
                    {activeModal === 'recent' && !user ? (
                      <>
                        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Sign in to see your history</h4>
                        <p className="text-gray-500 mb-6">Track your listening habits and pick up where you left off.</p>
                        <button
                          onClick={() => { setActiveModal(null); navigate('/login') }}
                          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm"
                        >
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No content available yet</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeModal === 'recent' && modalData.map((item, i) => (
                      <div
                        key={item.id || i}
                        onClick={() => { setActiveModal(null); player?.playSong?.(item.song) }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(item.cover_url || item.song?.cover_url)} alt={item.title || item.song?.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{item.title || item.song?.title}</p>
                          <p className="text-xs text-gray-500">{item.artist_name || item.song?.artist_name || 'Unknown'}</p>
                        </div>
                        <span className="text-xs text-gray-600">{formatTimeAgo(item.played_at)}</span>
                      </div>
                    ))}

                    {activeModal === 'fresh' && modalData.map((song, i) => (
                      <div
                        key={song.id}
                        onClick={() => { setActiveModal(null); player?.playSong?.(song) }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(song.cover_url)} alt={song.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-fuchsia-300 transition-colors">{song.title}</p>
                          <p className="text-xs text-gray-500">{getArtistName(song)}</p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {formatTimeAgo(song.created_at)}
                        </span>
                      </div>
                    ))}

                    {activeModal === 'artists' && modalData.map((artist, i) => (
                      <div
                        key={artist.id}
                        onClick={() => { setActiveModal(null); navigate(`/artist/${artist.id}`) }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-900 to-fuchsia-900">
                          <img src={getImageUrl(artist.image_url)} alt={artist.stage_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-amber-300 transition-colors">{artist.stage_name}</p>
                          <p className="text-xs text-gray-500">{(artist.followers_count ?? 0).toLocaleString()} followers</p>
                        </div>
                        {artist.is_verified && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-medium border border-blue-500/20">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Home