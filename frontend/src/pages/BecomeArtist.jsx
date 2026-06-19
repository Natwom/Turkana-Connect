import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { 
  Mic2, 
  Upload, 
  Loader2, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Music,
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react'

const BecomeArtist = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    genre: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const genres = [
    { value: '', label: 'Select a genre' },
    { value: 'Turkana', label: 'Turkana Traditional' },
    { value: 'Kenyan', label: 'Kenyan Pop' },
    { value: 'Gospel', label: 'Gospel' },
    { value: 'Traditional', label: 'Traditional Folk' },
    { value: 'Afrobeat', label: 'Afrobeat' },
    { value: 'Contemporary', label: 'Contemporary' },
    { value: 'Hip Hop', label: 'Hip Hop' },
    { value: 'R&B', label: 'R&B / Soul' },
    { value: 'Reggae', label: 'Reggae' },
  ]

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }
    
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleImageChange(e)
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.stage_name.trim()) {
      setError('Stage name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('stage_name', formData.stage_name.trim())
      if (formData.bio) data.append('bio', formData.bio)
      if (formData.genre) data.append('genre', formData.genre)
      if (image) data.append('image', image, image.name)

      const res = await api.post('/api/v1/artists', data)
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 3000)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Failed to create artist profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
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
              <User className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in Required</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">You need to be logged in to apply as an artist and share your music with the Turkana community.</p>
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
            Application Submitted!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 max-w-md mx-auto mb-2"
          >
            Your artist profile is pending admin approval. You'll be notified once approved.
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
          className="max-w-2xl mx-auto"
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
                <Mic2 className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Become an Artist</h1>
            <p className="text-gray-400 text-lg">Share your music with the Turkana community</p>
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

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-sm" />
            
            <form onSubmit={handleSubmit} className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-8">
              
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-36 h-36 rounded-full overflow-hidden cursor-pointer group transition-all duration-300 ${
                    dragActive 
                      ? 'ring-4 ring-fuchsia-500/50 scale-105' 
                      : 'ring-2 ring-white/[0.08] hover:ring-fuchsia-500/30'
                  }`}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage() }}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#1a1a2e] flex flex-col items-center justify-center gap-2 group-hover:bg-[#1f1f2e] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Upload className={`w-6 h-6 transition-colors ${dragActive ? 'text-fuchsia-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      </div>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400 text-center px-4">
                        {dragActive ? 'Drop image here' : 'Click or drag image'}
                      </span>
                    </div>
                  )}
                </motion.div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/jpg" 
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {image && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-500 mt-3 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {image.name} ({(image.size / 1024).toFixed(1)} KB)
                  </motion.p>
                )}
              </div>

              {/* Stage Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">
                  Stage Name <span className="text-fuchsia-400">*</span>
                </label>
                <div className="relative group">
                  <Mic2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'stage_name' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    required
                    value={formData.stage_name}
                    onChange={(e) => setFormData({...formData, stage_name: e.target.value})}
                    onFocus={() => setFocusedField('stage_name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your artist name"
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]"
                  />
                  <motion.div 
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" 
                    initial={{ scaleX: 0 }} 
                    animate={{ scaleX: focusedField === 'stage_name' ? 1 : 0 }} 
                    transition={{ duration: 0.3 }} 
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Genre</label>
                <div className="relative group">
                  <Music className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'genre' ? 'text-fuchsia-400' : 'text-gray-500'} pointer-events-none z-10`} />
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    onFocus={() => setFocusedField('genre')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15] appearance-none cursor-pointer"
                  >
                    {genres.map(g => (
                      <option key={g.value} value={g.value} className="bg-[#1a1a2e] text-white">
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Bio</label>
                <div className="relative group">
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tell us about yourself and your music journey..."
                    className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15] resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                    {formData.bio.length}/500
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-fuchsia-500/25">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-white font-semibold">Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-semibold text-lg">Apply as Artist</span>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </motion.button>

              <p className="text-center text-xs text-gray-600">
                By applying, you agree to our{' '}
                <Link to="/terms" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/artist-guidelines" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Artist Guidelines</Link>
              </p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default BecomeArtist