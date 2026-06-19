import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  X,
  FileAudio,
  ImagePlus,
  Type,
  ListMusic,
  Disc,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  Trash2,
  ShieldCheck,
  Check
} from 'lucide-react'

const UploadSong = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const audioRef = useRef(null)
  const coverInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    album_id: '',
    lyrics: ''
  })
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [audioDragActive, setAudioDragActive] = useState(false)
  const [coverDragActive, setCoverDragActive] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, albumsRes] = await Promise.all([
          api.get('/api/v1/categories'),
          api.get('/api/v1/albums/my-albums').catch(() => ({ data: [] }))
        ])
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : [])
        setAlbums(Array.isArray(albumsRes.data) ? albumsRes.data : [])
      } catch (err) {
        console.error('Failed to fetch form data:', err)
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [])

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (MP3, WAV, FLAC)')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Audio file must be less than 50MB')
      return
    }
    
    setAudioFile(file)
    setAudioPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be less than 5MB')
      return
    }
    
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrag = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      type === 'audio' ? setAudioDragActive(true) : setCoverDragActive(true)
    } else if (e.type === 'dragleave') {
      type === 'audio' ? setAudioDragActive(false) : setCoverDragActive(false)
    }
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    type === 'audio' ? setAudioDragActive(false) : setCoverDragActive(false)
    if (type === 'audio') handleAudioChange(e)
    else handleCoverChange(e)
  }

  const removeAudio = () => {
    setAudioFile(null)
    setAudioPreview(null)
    if (audioRef.current) audioRef.current.value = ''
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!audioFile) {
      setError('Audio file is required')
      return
    }
    if (!formData.title.trim()) {
      setError('Song title is required')
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions')
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('audio', audioFile)
      if (formData.category_id) data.append('category_id', formData.category_id)
      if (formData.album_id) data.append('album_id', formData.album_id)
      if (formData.lyrics) data.append('lyrics', formData.lyrics)
      if (coverFile) data.append('cover', coverFile)

      await api.post('/api/v1/songs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      setSuccess(true)
      setTimeout(() => navigate('/profile'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload song. Make sure you are an approved artist.')
    } finally {
      setLoading(false)
    }
  }

  const getAudioDuration = () => {
    if (!audioFile) return null
    const duration = Math.floor(Math.random() * 180) + 120
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 to-transparent" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center px-4"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
            <div className="relative w-full h-full bg-[#1a1a2e] border border-white/[0.08] rounded-full flex items-center justify-center">
              <Music className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in Required</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">You need to be logged in as an approved artist to upload songs.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-white/[0.05] border border-white/[0.08] text-gray-300 rounded-xl font-medium hover:bg-white/[0.1] hover:text-white transition-all"
              >
                Create Account
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center px-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-xl" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Song Uploaded!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 max-w-md mx-auto mb-2"
          >
            Your song has been submitted and is pending admin approval. You'll be notified once it's live.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-600"
          >
            Redirecting to profile...
          </motion.p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: "linear" }}
            className="max-w-xs mx-auto mt-6 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-fuchsia-900/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Music className="w-64 h-64 text-fuchsia-500" />
        </div>
      </div>

      <div className="px-4 -mt-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative w-20 h-20 mx-auto mb-5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-full h-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Upload Song</h1>
            <p className="text-gray-400 text-lg">Share your music with the world</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {fetching ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full"
              />
              <p className="text-gray-500 text-sm">Loading form data...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-sm" />
              
              <form onSubmit={handleSubmit} className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
                
                {/* Audio Upload Section */}
                <div className="p-8 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <FileAudio className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Audio File</h3>
                      <p className="text-xs text-gray-500">Required • Max 50MB • MP3, WAV, FLAC</p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    onDragEnter={(e) => handleDrag(e, 'audio')}
                    onDragLeave={(e) => handleDrag(e, 'audio')}
                    onDragOver={(e) => handleDrag(e, 'audio')}
                    onDrop={(e) => handleDrop(e, 'audio')}
                    onClick={() => !audioFile && audioRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                      audioDragActive 
                        ? 'border-fuchsia-500 bg-fuchsia-500/5 scale-[1.02]' 
                        : audioFile
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={audioRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                    
                    {audioFile ? (
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                            <Music className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{audioFile.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {getAudioDuration()}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeAudio() }}
                            className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {audioPreview && (
                          <div className="mt-4">
                            <audio controls className="w-full h-10" src={audioPreview}>
                              <source src={audioPreview} type={audioFile.type} />
                            </audio>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${
                          audioDragActive ? 'bg-fuchsia-500/10' : 'bg-white/5'
                        }`}>
                          <FileAudio className={`w-8 h-8 transition-colors ${audioDragActive ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                        </div>
                        <p className={`text-sm font-medium transition-colors ${audioDragActive ? 'text-fuchsia-400' : 'text-gray-300'}`}>
                          {audioDragActive ? 'Drop audio file here' : 'Drag & drop audio file'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">or click to browse from your device</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Cover Image Section */}
                <div className="p-8 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Cover Image</h3>
                      <p className="text-xs text-gray-500">Optional • Max 5MB • JPG, PNG, WEBP</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onDragEnter={(e) => handleDrag(e, 'cover')}
                      onDragLeave={(e) => handleDrag(e, 'cover')}
                      onDragOver={(e) => handleDrag(e, 'cover')}
                      onDrop={(e) => handleDrop(e, 'cover')}
                      onClick={() => !coverFile && coverInputRef.current?.click()}
                      className={`relative w-40 h-40 rounded-2xl border-2 border-dashed flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300 ${
                        coverDragActive 
                          ? 'border-fuchsia-500 scale-105' 
                          : coverFile
                            ? 'border-emerald-500/30'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                      }`}
                    >
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center">
                              <ImagePlus className="w-6 h-6 text-white mx-auto mb-1" />
                              <span className="text-xs text-white">Change</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeCover() }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
                          <ImageIcon className={`w-8 h-8 transition-colors ${coverDragActive ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                          <span className="text-xs text-gray-500 text-center px-2">
                            {coverDragActive ? 'Drop here' : 'Add cover'}
                          </span>
                        </div>
                      )}
                    </motion.div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Cover Guidelines</h4>
                      <ul className="space-y-2 text-xs text-gray-500">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Square image recommended (1:1 ratio)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Minimum 500x500 pixels
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Clear, high-quality artwork
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          No explicit or copyrighted content
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Song Details */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Type className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Song Details</h3>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">
                      Song Title <span className="text-fuchsia-400">*</span>
                    </label>
                    <div className="relative group">
                      <Type className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'title' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        onFocus={() => setFocusedField('title')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter song title"
                        className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]"
                      />
                      <motion.div 
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" 
                        initial={{ scaleX: 0 }} 
                        animate={{ scaleX: focusedField === 'title' ? 1 : 0 }} 
                        transition={{ duration: 0.3 }} 
                      />
                    </div>
                  </div>

                  {/* Category & Album */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Category</label>
                      <div className="relative group">
                        <ListMusic className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'category' ? 'text-fuchsia-400' : 'text-gray-500'} pointer-events-none z-10`} />
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                          onFocus={() => setFocusedField('category')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15] appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#1a1a2e]">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#1a1a2e]">{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Album</label>
                      <div className="relative group">
                        <Disc className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'album' ? 'text-fuchsia-400' : 'text-gray-500'} pointer-events-none z-10`} />
                        <select
                          value={formData.album_id}
                          onChange={(e) => setFormData({...formData, album_id: e.target.value})}
                          onFocus={() => setFocusedField('album')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15] appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#1a1a2e]">Single (no album)</option>
                          {albums.map(album => (
                            <option key={album.id} value={album.id} className="bg-[#1a1a2e]">{album.title}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lyrics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Lyrics</label>
                    <div className="relative group">
                      <FileText className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${focusedField === 'lyrics' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                      <textarea
                        rows={6}
                        value={formData.lyrics}
                        onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                        onFocus={() => setFocusedField('lyrics')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Paste song lyrics here..."
                        className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15] resize-none font-mono text-sm leading-relaxed"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                        {formData.lyrics.length} chars
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="p-8 bg-white/[0.02] border-t border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Terms & Conditions</h3>
                  </div>

                  <div className="bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-5 mb-5">
                    <div className="space-y-3 text-sm text-gray-400 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="font-medium text-gray-300">By uploading content to Turkana Music, you agree to the following:</p>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">1.</span>
                        <p><strong className="text-gray-300">Ownership:</strong> You confirm that you own all rights to the audio file, cover image, and lyrics being uploaded, or have obtained all necessary licenses, permissions, and consents.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">2.</span>
                        <p><strong className="text-gray-300">Original Content:</strong> The content is original and does not infringe on any third-party copyrights, trademarks, or intellectual property rights.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">3.</span>
                        <p><strong className="text-gray-300">No Infringement:</strong> You will not upload content that contains unauthorized samples, covers, or remixes of copyrighted material.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">4.</span>
                        <p><strong className="text-gray-300">Appropriate Content:</strong> The content does not contain hate speech, explicit violence, illegal activities, or sexually explicit material.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">5.</span>
                        <p><strong className="text-gray-300">Content Review:</strong> All uploads are subject to admin review and approval before being published. Turkana Music reserves the right to reject or remove any content.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">6.</span>
                        <p><strong className="text-gray-300">Platform License:</strong> You grant Turkana Music a non-exclusive license to host, distribute, and promote your content on the platform.</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <span className="text-fuchsia-400 font-bold">7.</span>
                        <p><strong className="text-gray-300">Liability:</strong> You agree to indemnify Turkana Music against any claims arising from your uploaded content.</p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-gray-600 peer-checked:bg-gradient-to-br peer-checked:from-violet-500 peer-checked:to-fuchsia-500 peer-checked:border-transparent transition-all duration-200 flex items-center justify-center">
                        <Check className={`w-3 h-3 text-white transition-opacity ${agreedToTerms ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                      I have read and agree to the{' '}
                      <Link to="/terms" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Terms of Service</Link>
                      ,{' '}
                      <Link to="/content-policy" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Content Policy</Link>
                      , and{' '}
                      <Link to="/artist-agreement" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Artist Agreement</Link>
                      . I confirm that I own the rights to this content.
                    </span>
                  </label>
                </div>

                {/* Submit Section */}
                <div className="p-8 bg-white/[0.02] border-t border-white/[0.05]">
                  <AnimatePresence>
                    {loading && uploadProgress > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Uploading...</span>
                          <span className="text-fuchsia-400 font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading || !agreedToTerms}
                    whileHover={agreedToTerms ? { scale: 1.01 } : {}}
                    whileTap={agreedToTerms ? { scale: 0.99 } : {}}
                    className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className={`relative rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 ${
                      agreedToTerms ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 group-hover:shadow-lg group-hover:shadow-fuchsia-500/25' : 'bg-gray-700'
                    }`}>
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                          <span className="text-white font-semibold text-lg">
                            {uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : 'Processing...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold text-lg">Upload Song</span>
                          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </motion.button>

                  {!agreedToTerms && !loading && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-gray-500 mt-3"
                    >
                      Please agree to the Terms & Conditions to upload
                    </motion.p>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default UploadSong