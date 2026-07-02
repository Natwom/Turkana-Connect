import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import userApi from '../api/user'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  push_notifications: true,
  email_notifications: true,
  new_release_alerts: true,
  artist_updates: false,
  playlist_collabs: true,
  marketing_emails: false,
  audio_quality: 'high',
  crossfade: true,
  crossfade_duration: 5,
  normalize_volume: true,
  autoplay: true,
  gapless_playback: false,
  theme: 'dark',
  compact_mode: false,
  show_lyrics: true,
  animations: true,
  font_size: 'medium',
  private_profile: false,
  activity_sharing: true,
  listening_history: true,
  show_followers: true,
  allow_messages: 'everyone',
  two_factor: false,
  login_alerts: true,
  language: 'en',
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const res = await userApi.getSettings()
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }))
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
      // Keep defaults if backend fails
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Apply theme to document
  useEffect(() => {
    const theme = settings.theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings.theme])

  // Apply font size
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = sizes[settings.font_size] || '16px'
  }, [settings.font_size])

  // Apply compact mode
  useEffect(() => {
    if (settings.compact_mode) {
      document.body.classList.add('compact-mode')
    } else {
      document.body.classList.remove('compact-mode')
    }
  }, [settings.compact_mode])

  const value = {
    settings,
    loadSettings,
    updateSettings,
    loading,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}