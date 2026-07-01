import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Check, X } from 'lucide-react'
import api from '../api/axios'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500']

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (passwordStrength < 2) {
      setError('Please use a stronger password')
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/api/v1/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }))

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]" />
        {particles.map((p) => (
          <motion.div key={p.id} className="absolute rounded-full bg-white/10" style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }} animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
        ))}
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-lg relative z-10 px-4">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <motion.div className="relative w-20 h-20 mx-auto mb-6" whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Music2 className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <motion.div className="absolute -top-1 -right-1" animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Join Apiaro Music</h1>
          <p className="text-gray-400 text-lg">Create your account and start your <span className="text-fuchsia-400 font-medium">musical journey</span></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-sm" />
          <form onSubmit={handleSubmit} className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                    <X className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Username</label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'username' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                  <input name="username" value={formData.username} onChange={handleChange} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]" placeholder="johndoe" required />
                  <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === 'username' ? 1 : 0 }} transition={{ duration: 0.3 }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Full Name</label>
                <div className="relative group">
                  <input name="full_name" value={formData.full_name} onChange={handleChange} onFocus={() => setFocusedField('full_name')} onBlur={() => setFocusedField(null)} className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]" placeholder="John Doe" />
                  <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === 'full_name' ? 1 : 0 }} transition={{ duration: 0.3 }} />
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]" placeholder="you@example.com" required />
                <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === 'email' ? 1 : 0 }} transition={{ duration: 0.3 }} />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-300 hover:border-white/[0.15]" placeholder="Create a strong password" required />
                <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === 'password' ? 1 : 0 }} transition={{ duration: 0.3 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200 p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-700'}`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Password strength:</span>
                    <span className={`font-medium ${passwordStrength > 0 ? 'text-' + strengthColors[passwordStrength - 1].replace('bg-', '') : 'text-gray-500'}`}>
                      {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {[{ label: '8+ chars', met: formData.password.length >= 8 }, { label: 'Uppercase', met: /[A-Z]/.test(formData.password) }, { label: 'Number', met: /[0-9]/.test(formData.password) }, { label: 'Special', met: /[^A-Za-z0-9]/.test(formData.password) }].map((req) => (
                      <span key={req.label} className={`flex items-center gap-1 ${req.met ? 'text-emerald-400' : ''}`}>
                        {req.met ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2.5 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} className={`w-full bg-[#1a1a2e] border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:border-white/[0.15] ${formData.confirmPassword ? passwordsMatch ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20' : 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : 'border-white/[0.08] focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20'}`} placeholder="Repeat your password" required />
                <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: focusedField === 'confirmPassword' ? 1 : 0 }} transition={{ duration: 0.3 }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200 p-1">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-400" />}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 rounded-md border-2 border-gray-600 peer-checked:bg-gradient-to-br peer-checked:from-violet-500 peer-checked:to-fuchsia-500 peer-checked:border-transparent transition-all duration-200" />
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  I agree to the <Link to="/terms" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Privacy Policy</Link>
                </span>
              </label>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-[1px] disabled:opacity-60 disabled:cursor-not-allowed">
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-fuchsia-500/25">
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <span className="text-white font-semibold text-base">Create Account</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </motion.button>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-4 bg-[#12121a] text-gray-500 uppercase tracking-wider">or sign up with</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.08] text-gray-300 hover:text-white hover:border-white/[0.15] transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </motion.button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.08] text-gray-300 hover:text-white hover:border-white/[0.15] transition-all duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </motion.button>
            </div>
            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-semibold inline-flex items-center gap-1 group">Sign in<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></Link>
            </p>
          </form>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-gray-600 mt-8">
          By registering, you agree to our <Link to="/terms" className="hover:text-gray-400 transition-colors underline">Terms</Link> and <Link to="/privacy" className="hover:text-gray-400 transition-colors underline">Privacy Policy</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Register