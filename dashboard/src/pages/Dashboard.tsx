import { useEffect } from 'react'
import { useDashboardStore } from '../store'
import MapComponent from '../components/Map'
import StatCard from '../components/StatCard'
import RecentAlerts from '../components/RecentAlerts'
import { Users, AlertTriangle, Activity, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { fishermen, alerts, stats, isConnected } = useDashboardStore()
  const activeAlerts = alerts.filter((a) => !a.resolved).length

  useEffect(() => {
    // Fetch initial data from API
    if (!isConnected) return

    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        console.log('Stats:', data)
      })
      .catch((err) => console.error('Error fetching stats:', err))
  }, [isConnected])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord SenMoolProtect
        </h1>
        <div
          className={`px-4 py-2 rounded-lg font-semibold ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isConnected ? '🟢 En ligne' : '🔴 Hors ligne'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Pêcheurs"
          value={stats.totalFishermen}
          color="blue"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          label="En ligne maintenant"
          value={stats.onlineNow}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Alertes actives"
          value={activeAlerts}
          color="red"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Résolues (24h)"
          value={stats.resolvedToday}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Carte temps réel
            </h2>
            <p className="text-sm text-gray-500">
              {fishermen.length} pêcheurs suivis
            </p>
          </div>
          <MapComponent />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Alertes récentes
            </h2>
          </div>
          <RecentAlerts alerts={alerts.slice(0, 5)} />
        </div>
      </div>
    </div>
  )
}
