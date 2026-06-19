import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Disc, Music, Guitar, Church, Drum, Mic2, 
  Play, TrendingUp, Clock, ChevronRight, Headphones,
  Radio, Star, ArrowUpRight
} from 'lucide-react'

const categories = [
  { 
    name: 'Turkana', 
    color: 'from-orange-500 to-red-600', 
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    icon: Drum, 
    description: 'Traditional Turkana rhythms and sounds',
    songCount: 124,
    artistCount: 18,
    trending: ['Nakwam Ekile', 'Akolong'],
    featured: true
  },
  { 
    name: 'Kenyan', 
    color: 'from-green-500 to-emerald-600', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: Music, 
    description: 'Best of Kenyan music across all genres',
    songCount: 856,
    artistCount: 142,
    trending: ['Sauti Sol', 'Nyashinski'],
    featured: true
  },
  { 
    name: 'Gospel', 
    color: 'from-blue-500 to-indigo-600', 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: Church, 
    description: 'Inspirational gospel and worship music',
    songCount: 432,
    artistCount: 67,
    trending: ['Eunice Njeri', 'Guardian Angel'],
    featured: false
  },
  { 
    name: 'Traditional', 
    color: 'from-amber-500 to-yellow-600', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: Guitar, 
    description: 'Authentic African traditional music',
    songCount: 289,
    artistCount: 45,
    trending: ['Benga Classics', 'Ohangla'],
    featured: false
  },
  { 
    name: 'Afrobeat', 
    color: 'from-purple-500 to-violet-600', 
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: Mic2, 
    description: 'Contemporary Afrobeat hits',
    songCount: 567,
    artistCount: 89,
    trending: ['Burna Boy', 'Wizkid'],
    featured: true
  },
  { 
    name: 'Contemporary', 
    color: 'from-pink-500 to-rose-600', 
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    icon: Disc, 
    description: 'Modern sounds and fresh releases',
    songCount: 723,
    artistCount: 112,
    trending: ['Gengetone', 'Pop Hits'],
    featured: false
  },
]

const Categories = () => {
  const navigate = useNavigate()
  const [hoveredCat, setHoveredCat] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filters = [
    { label: 'All', value: 'all', count: categories.length },
    { label: 'Featured', value: 'featured', count: categories.filter(c => c.featured).length },
    { label: 'Trending', value: 'trending', count: 4 },
  ]

  const filteredCategories = selectedFilter === 'all' 
    ? categories 
    : selectedFilter === 'featured' 
      ? categories.filter(c => c.featured)
      : categories.filter(c => c.songCount > 400)

  const totalSongs = categories.reduce((acc, c) => acc + c.songCount, 0)
  const totalArtists = categories.reduce((acc, c) => acc + c.artistCount, 0)

  return (
    <div className="space-y-0 pb-10">
      
      {/* HEADER */}
      <div className="px-4 md:px-8 pt-4 pb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/5 p-6 md:p-8 border border-white/5"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                Discover
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Headphones className="w-3 h-3" />
                {totalSongs.toLocaleString()} songs
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Categories</h1>
            <p className="text-gray-400 max-w-lg">
              Explore {totalSongs.toLocaleString()} songs across {categories.length} genres from {totalArtists.toLocaleString()} artists
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
              {[
                { icon: Music, label: 'Songs', value: totalSongs },
                { icon: Mic2, label: 'Artists', value: totalArtists },
                { icon: Radio, label: 'Live Stations', value: 12 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* FILTERS */}
      <div className="px-4 md:px-8 pb-4">
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-surface/50 text-gray-400 hover:text-white hover:bg-surface'
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 text-xs ${selectedFilter === filter.value ? 'text-white/70' : 'text-gray-600'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="px-4 md:px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                onMouseEnter={() => setHoveredCat(cat.name)}
                onMouseLeave={() => setHoveredCat(null)}
                onClick={() => navigate(`/categories?genre=${encodeURIComponent(cat.name)}`)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                  hoveredCat === cat.name ? cat.borderColor : 'border-white/5'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10 p-5">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <cat.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {cat.featured && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-bold uppercase">
                          Featured
                        </span>
                      )}
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{cat.description}</p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Music className="w-3.5 h-3.5" />
                      <span>{cat.songCount.toLocaleString()} songs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mic2 className="w-3.5 h-3.5" />
                      <span>{cat.artistCount} artists</span>
                    </div>
                  </div>

                  {/* Trending Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-3 h-3 text-gray-600" />
                    {cat.trending.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hover Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map((n) => (
                          <div key={n} className={`w-6 h-6 rounded-full ${cat.bgColor} border-2 border-background flex items-center justify-center`}>
                            <span className="text-[8px] font-bold">{n}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500">+{cat.artistCount - 3} more</span>
                    </div>
                    
                    <motion.button
                      initial={false}
                      animate={{ opacity: hoveredCat === cat.name ? 1 : 0, x: hoveredCat === cat.name ? 0 : 10 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary rounded-lg text-xs font-semibold"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Play All
                    </motion.button>
                  </div>
                </div>

                {/* Bottom Accent Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM SECTION - Recently Added */}
      <div className="px-4 md:px-8 pt-4">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-surface/80 to-surface border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Recently Added</h2>
            </div>
            <button 
              onClick={() => navigate('/search?sort=newest')}
              className="group flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/categories?genre=${encodeURIComponent(cat.name)}`)}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-[10px] text-gray-500">{cat.songCount} songs</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="px-4 md:px-8 pt-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 md:p-8 text-center border border-white/5">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
          <div className="relative z-10">
            <Star className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Can't Find What You Like?</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
              Discover new music daily. Our curated playlists update every week with fresh tracks.
            </p>
            <button 
              onClick={() => navigate('/search')}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-bold text-sm transition-all hover:scale-105"
            >
              Explore All Music
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories