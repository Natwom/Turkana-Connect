import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Globe, 
  Database, 
  Bell, 
  Shield, 
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Upload,
  UserPlus,
  FileCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Turkana Music Hub',
    maintenanceMode: false,
    allowRegistration: true,
    requireApproval: true,
    maxUploadSize: 50,
    emailNotifications: true,
    analyticsEnabled: true,
  })
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // API call here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'storage', label: 'Storage', icon: Database },
  ]

  const CustomToggle = ({ checked, onChange, label, description, icon: Icon }) => (
    <div className="flex items-start justify-between py-4 border-b border-white/[0.05] last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${checked ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'bg-white/10'}`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
        />
      </motion.button>
    </div>
  )

  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Platform Settings</h1>
          <p className="text-gray-400 text-sm">Configure global platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                Saved successfully
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-fuchsia-400' : 'text-gray-500'}`} />
                {section.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-2xl blur-sm" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">General</h2>
                      <p className="text-sm text-gray-500">Basic platform configuration</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2.5">Site Name</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          type="text" 
                          value={settings.siteName} 
                          onChange={(e) => handleChange('siteName', e.target.value)} 
                          className="w-full bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all hover:border-white/[0.15]" 
                        />
                      </div>
                    </div>
                  </div>

                  <CustomToggle
                    checked={settings.maintenanceMode}
                    onChange={(v) => handleChange('maintenanceMode', v)}
                    label="Maintenance Mode"
                    description="Temporarily disable public access to the platform"
                    icon={AlertTriangle}
                  />
                  <CustomToggle
                    checked={settings.allowRegistration}
                    onChange={(v) => handleChange('allowRegistration', v)}
                    label="Allow New Registrations"
                    description="Enable or disable user sign-ups"
                    icon={UserPlus}
                  />
                  <CustomToggle
                    checked={settings.requireApproval}
                    onChange={(v) => handleChange('requireApproval', v)}
                    label="Require Content Approval"
                    description="Admin approval required before content goes live"
                    icon={FileCheck}
                  />
                </div>
              </div>

              <div className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl blur-sm" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Notifications</h2>
                      <p className="text-sm text-gray-500">Email and push notification settings</p>
                    </div>
                  </div>

                  <CustomToggle
                    checked={settings.emailNotifications}
                    onChange={(v) => handleChange('emailNotifications', v)}
                    label="Email Notifications"
                    description="Send email alerts for important events"
                    icon={Bell}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-2xl blur-sm" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Security</h2>
                    <p className="text-sm text-gray-500">Platform security settings</p>
                  </div>
                </div>

                <CustomToggle
                  checked={settings.analyticsEnabled}
                  onChange={(v) => handleChange('analyticsEnabled', v)}
                  label="Analytics Collection"
                  description="Collect usage analytics to improve the platform"
                  icon={Sparkles}
                />
              </div>
            </motion.div>
          )}

          {/* Storage Settings */}
          {activeSection === 'storage' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-sm" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Storage</h2>
                    <p className="text-sm text-gray-500">File upload and storage configuration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2.5">Max Upload Size (MB)</label>
                    <div className="relative">
                      <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="number" 
                        value={settings.maxUploadSize} 
                        onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))} 
                        className="w-32 bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all hover:border-white/[0.15]" 
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Maximum file size for audio uploads</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage