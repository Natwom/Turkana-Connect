import { Bell, Search } from 'lucide-react'

const TopBar = () => {
  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all" />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
