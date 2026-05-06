import { Bell, User, LogOut, Wifi, WifiOff } from 'lucide-react'
import { useDashboardStore } from '../store'

export default function Navbar() {
  const isConnected = useDashboardStore((state) => state.isConnected)
  const alerts = useDashboardStore((state) => state.alerts)
  const activeAlerts = alerts.filter((a) => !a.resolved).length

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {activeAlerts > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeAlerts}
              </span>
            )}
          </button>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-6 border-l">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  )
}
