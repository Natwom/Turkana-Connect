import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import userApi from '../api/user'
import { useAuth } from '../context/AuthContext'
import { 
  User, Bell, Lock, Palette, Globe, Volume2, 
  ChevronRight, Camera, Mail, Smartphone, 
  Shield, Moon, Sun, Monitor, Check, Loader2,
  AlertTriangle, LogOut, Trash2, Heart
} from 'lucide-react'

const Settings = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    email: '',
    bio: '',
  })

  // Settings state (maps to UserSettings table)
  const [settings, setSettings] = useState({
    // Notifications
    push_notifications: true,
    email_notifications: true,
    new_release_alerts: true,
    artist_updates: false,
    playlist_collabs: true,
    marketing_emails: false,
    // Playback
    audio_quality: 'high',
    crossfade: true,
    crossfade_duration: 5,
    normalize_volume: true,
    autoplay: true,
    gapless_playback: false,
    // Appearance
    theme: 'dark',
    compact_mode: false,
    show_lyrics: true,
    animations: true,
    font_size: 'medium',
    // Privacy
    private_profile: false,
    activity_sharing: true,
    listening_history: true,
    show_followers: true,
    allow_messages: 'everyone',
    // Security
    two_factor: false,
    login_alerts: true,
    // Language
    language: 'en',
  })

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'tr', name: 'Turkana', flag: '🇰🇪' },
  ]

  const audioQualities = [
    { value: 'low', label: 'Low (96 kbps)', desc: 'Save data' },
    { value: 'medium', label: 'Medium (160 kbps)', desc: 'Balanced' },
    { value: 'high', label: 'High (320 kbps)', desc: 'Best quality' },
    { value: 'lossless', label: 'Lossless', desc: 'FLAC format' },
  ]

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-400' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-yellow-400' },
    { id: 'playback', label: 'Playback', icon: Volume2, color: 'text-green-400' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-purple-400' },
    { id: 'privacy', label: 'Privacy', icon: Shield, color: 'text-red-400' },
    { id: 'security', label: 'Security', icon: Lock, color: 'text-orange-400' },
    { id: 'language', label: 'Language', icon: Globe, color: 'text-cyan-400' },
  ]

  // Load user and settings from backend on mount
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Load profile from user object
        setProfile({
          full_name: user.full_name || '',
          username: user.username || '',
          email: user.email || '',
          bio: user.bio || '',
        })

        // Load settings from backend
        const settingsRes = await userApi.getSettings()
        const s = settingsRes.data
        setSettings({
          push_notifications: s.push_notifications ?? true,
          email_notifications: s.email_notifications ?? true,
          new_release_alerts: s.new_release_alerts ?? true,
          artist_updates: s.artist_updates ?? false,
          playlist_collabs: s.playlist_collabs ?? true,
          marketing_emails: s.marketing_emails ?? false,
          audio_quality: s.audio_quality || 'high',
          crossfade: s.crossfade ?? true,
          crossfade_duration: s.crossfade_duration ?? 5,
          normalize_volume: s.normalize_volume ?? true,
          autoplay: s.autoplay ?? true,
          gapless_playback: s.gapless_playback ?? false,
          theme: s.theme || 'dark',
          compact_mode: s.compact_mode ?? false,
          show_lyrics: s.show_lyrics ?? true,
          animations: s.animations ?? true,
          font_size: s.font_size || 'medium',
          private_profile: s.private_profile ?? false,
          activity_sharing: s.activity_sharing ?? true,
          listening_history: s.listening_history ?? true,
          show_followers: s.show_followers ?? true,
          allow_messages: s.allow_messages || 'everyone',
          two_factor: s.two_factor ?? false,
          login_alerts: s.login_alerts ?? true,
          language: s.language || 'en',
        })
      } catch (err) {
        console.error('Failed to load settings:', err)
        setMessage({ type: 'error', text: 'Failed to load settings' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const showSuccess = (text) => {
    setMessage({ type: 'success', text })
    setTimeout(() => setMessage(null), 3000)
  }

  const showError = (text) => {
    setMessage({ type: 'error', text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Save profile (User table fields only)
  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      // Only send fields that exist on User model
      const profileData = {
        full_name: profile.full_name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
      }
      await userApi.updateMe(profileData)
      showSuccess('Profile updated successfully!')
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Save settings (UserSettings table)
  const handleSaveSettings = async (section) => {
    setSaving(true)
    try {
      // Build the payload based on which settings changed
      // We send all settings to keep it simple
      const payload = {
        push_notifications: settings.push_notifications,
        email_notifications: settings.email_notifications,
        new_release_alerts: settings.new_release_alerts,
        artist_updates: settings.artist_updates,
        playlist_collabs: settings.playlist_collabs,
        marketing_emails: settings.marketing_emails,
        audio_quality: settings.audio_quality,
        crossfade: settings.crossfade,
        crossfade_duration: settings.crossfade_duration,
        normalize_volume: settings.normalize_volume,
        autoplay: settings.autoplay,
        gapless_playback: settings.gapless_playback,
        theme: settings.theme,
        compact_mode: settings.compact_mode,
        show_lyrics: settings.show_lyrics,
        animations: settings.animations,
        font_size: settings.font_size,
        private_profile: settings.private_profile,
        activity_sharing: settings.activity_sharing,
        listening_history: settings.listening_history,
        show_followers: settings.show_followers,
        allow_messages: settings.allow_messages,
        two_factor: settings.two_factor,
        login_alerts: settings.login_alerts,
        language: settings.language,
      }
      
      await userApi.updateSettings(payload)
      showSuccess(`${section} settings saved successfully!`)
    } catch (err) {
      console.error('Save settings error:', err)
      showError(err.response?.data?.detail || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return
    try {
      await api.delete('/api/v1/users/me')
      logout()
      navigate('/')
    } catch (err) {
      showError('Failed to delete account')
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const Toggle = ({ value, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
          value ? 'bg-primary' : 'bg-surface border border-white/10'
        }`}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  )

  const Section = ({ title, children, onSave, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="space-y-1">
          {children}
        </div>
      </div>
      {onSave && (
        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-500">Click Save to persist changes</p>
          <button
            onClick={onSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-8 pt-4 pb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-gray-400 text-sm">Customize your experience and manage your account</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </motion.div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-4 md:mx-8 mb-4 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="px-4 md:px-8 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-surface/50 text-gray-400 hover:text-white hover:bg-surface'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 space-y-6">
        <AnimatePresence mode="wait">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Profile Information" icon={User} onSave={handleProfileUpdate}>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 mb-3">
                    <img 
                      src={user?.avatar_url || '/default-avatar.jpg'} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Change Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500 absolute ml-3" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Account Actions" icon={Lock}>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/settings/change-password')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Change Password</p>
                        <p className="text-xs text-gray-500">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                  </button>

                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-red-400">Delete Account</p>
                        <p className="text-xs text-gray-500">Permanently remove your account and data</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400/50" />
                  </button>
                </div>
              </Section>

              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-400 mb-1">Delete Account?</h3>
                      <p className="text-sm text-gray-400">This will permanently delete all your data, playlists, and uploaded music. This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Yes, Delete Everything
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-surface hover:bg-surface/80 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Push Notifications" icon={Bell} onSave={() => handleSaveSettings('Notification')}>
                <Toggle 
                  value={settings.push_notifications} 
                  onChange={(v) => updateSetting('push_notifications', v)}
                  label="Enable Push Notifications"
                  description="Receive notifications on your device"
                />
                <div className="border-t border-white/5" />
                <Toggle 
                  value={settings.new_release_alerts} 
                  onChange={(v) => updateSetting('new_release_alerts', v)}
                  label="New Releases"
                  description="Get notified when artists you follow release new music"
                />
                <Toggle 
                  value={settings.artist_updates} 
                  onChange={(v) => updateSetting('artist_updates', v)}
                  label="Artist Updates"
                  description="News and updates from your favorite artists"
                />
              </Section>

              <Section title="Email Notifications" icon={Mail}>
                <Toggle 
                  value={settings.email_notifications} 
                  onChange={(v) => updateSetting('email_notifications', v)}
                  label="Email Digest"
                  description="Weekly summary of your activity"
                />
                <Toggle 
                  value={settings.playlist_collabs} 
                  onChange={(v) => updateSetting('playlist_collabs', v)}
                  label="Playlist Collaborations"
                  description="When someone adds to your collaborative playlists"
                />
                <Toggle 
                  value={settings.marketing_emails} 
                  onChange={(v) => updateSetting('marketing_emails', v)}
                  label="Promotional Emails"
                  description="Special offers and music recommendations"
                />
              </Section>
            </motion.div>
          )}

          {/* PLAYBACK TAB */}
          {activeTab === 'playback' && (
            <motion.div
              key="playback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Audio Quality" icon={Volume2} onSave={() => handleSaveSettings('Playback')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {audioQualities.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => updateSetting('audio_quality', q.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        settings.audio_quality === q.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/5 bg-background hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${settings.audio_quality === q.value ? 'text-primary' : ''}`}>
                          {q.label}
                        </span>
                        {settings.audio_quality === q.value && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs text-gray-500">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Playback Behavior" icon={Volume2}>
                <Toggle 
                  value={settings.crossfade} 
                  onChange={(v) => updateSetting('crossfade', v)}
                  label="Crossfade Songs"
                  description="Smoothly transition between tracks"
                />
                {settings.crossfade && (
                  <div className="pl-4 border-l-2 border-primary/20 ml-6 mb-3">
                    <label className="block text-xs text-gray-500 mb-2">Crossfade Duration: {settings.crossfade_duration}s</label>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={settings.crossfade_duration}
                      onChange={(e) => updateSetting('crossfade_duration', parseInt(e.target.value))}
                      className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}
                <Toggle 
                  value={settings.normalize_volume} 
                  onChange={(v) => updateSetting('normalize_volume', v)}
                  label="Normalize Volume"
                  description="Keep consistent volume across tracks"
                />
                <Toggle 
                  value={settings.autoplay} 
                  onChange={(v) => updateSetting('autoplay', v)}
                  label="Autoplay"
                  description="Automatically play similar songs when queue ends"
                />
                <Toggle 
                  value={settings.gapless_playback} 
                  onChange={(v) => updateSetting('gapless_playback', v)}
                  label="Gapless Playback"
                  description="Remove silence between tracks for albums"
                />
              </Section>
            </motion.div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Theme" icon={Palette} onSave={() => handleSaveSettings('Appearance')}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-900' },
                    { value: 'light', label: 'Light', icon: Sun, preview: 'bg-gray-100' },
                    { value: 'system', label: 'Auto', icon: Monitor, preview: 'bg-gradient-to-br from-gray-900 to-gray-100' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        settings.theme === theme.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/5 bg-background hover:border-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 ${theme.preview} rounded-xl mx-auto mb-2 border border-white/10`} />
                      <theme.icon className={`w-5 h-5 mx-auto mb-1 ${settings.theme === theme.value ? 'text-primary' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${settings.theme === theme.value ? 'text-primary' : ''}`}>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Display Options" icon={Palette}>
                <Toggle 
                  value={settings.compact_mode} 
                  onChange={(v) => updateSetting('compact_mode', v)}
                  label="Compact Mode"
                  description="Show more content with less spacing"
                />
                <Toggle 
                  value={settings.show_lyrics} 
                  onChange={(v) => updateSetting('show_lyrics', v)}
                  label="Show Lyrics"
                  description="Display lyrics panel when available"
                />
                <Toggle 
                  value={settings.animations} 
                  onChange={(v) => updateSetting('animations', v)}
                  label="Animations"
                  description="Enable smooth transitions and effects"
                />
                <div className="py-3">
                  <label className="block text-sm font-medium text-gray-200 mb-2">Font Size</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSetting('font_size', size)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                          settings.font_size === size 
                            ? 'bg-primary text-white' 
                            : 'bg-background border border-white/5 hover:border-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            </motion.div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Profile Visibility" icon={Shield} onSave={() => handleSaveSettings('Privacy')}>
                <Toggle 
                  value={settings.private_profile} 
                  onChange={(v) => updateSetting('private_profile', v)}
                  label="Private Profile"
                  description="Only approved followers can see your activity"
                />
                <Toggle 
                  value={settings.activity_sharing} 
                  onChange={(v) => updateSetting('activity_sharing', v)}
                  label="Share Activity"
                  description="Show what you're listening to in real-time"
                />
                <Toggle 
                  value={settings.show_followers} 
                  onChange={(v) => updateSetting('show_followers', v)}
                  label="Show Follower Count"
                  description="Display your follower count on your profile"
                />
              </Section>

              <Section title="Interactions" icon={Heart}>
                <div className="py-3">
                  <label className="block text-sm font-medium text-gray-200 mb-2">Who can message you</label>
                  <div className="flex gap-2">
                    {['everyone', 'followers', 'nobody'].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSetting('allow_messages', option)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                          settings.allow_messages === option 
                            ? 'bg-primary text-white' 
                            : 'bg-background border border-white/5 hover:border-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <Toggle 
                  value={settings.listening_history} 
                  onChange={(v) => updateSetting('listening_history', v)}
                  label="Save Listening History"
                  description="Track your plays for recommendations"
                />
              </Section>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Authentication" icon={Lock} onSave={() => handleSaveSettings('Security')}>
                <Toggle 
                  value={settings.two_factor} 
                  onChange={(v) => updateSetting('two_factor', v)}
                  label="Two-Factor Authentication"
                  description="Require a code from your phone to log in"
                />
                <Toggle 
                  value={settings.login_alerts} 
                  onChange={(v) => updateSetting('login_alerts', v)}
                  label="Login Alerts"
                  description="Get notified of new sign-ins to your account"
                />
              </Section>

              <Section title="Active Sessions" icon={Monitor}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-gray-500">Kali Linux • Chrome</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </Section>
            </motion.div>
          )}

          {/* LANGUAGE TAB */}
          {activeTab === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Language & Region" icon={Globe} onSave={() => handleSaveSettings('Language')}>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSetting('language', lang.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        settings.language === lang.code 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/5 bg-background hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="text-left">
                          <p className={`font-semibold ${settings.language === lang.code ? 'text-primary' : ''}`}>{lang.name}</p>
                          <p className="text-xs text-gray-500">{lang.code.toUpperCase()}</p>
                        </div>
                      </div>
                      {settings.language === lang.code && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-8 mt-8 pt-6 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface/80 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Turkana Music Hub v1.0.0 • Made with ❤️ in Turkana
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings