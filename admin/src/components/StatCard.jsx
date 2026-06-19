import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    danger: 'from-danger/20 to-danger/5 text-danger',
    warning: 'from-warning/20 to-warning/5 text-warning',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`admin-card bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}/10`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {trend && <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">+{trend}%</span>}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value?.toLocaleString()}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </motion.div>
  )
}

export default StatCard
