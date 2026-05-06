import { useDashboardStore } from '../store'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function Analytics() {
  const fishermen = useDashboardStore((state) => state.fishermen)
  const alerts = useDashboardStore((state) => state.alerts)
  const stats = useDashboardStore((state) => state.stats)

  const totalAlerts = alerts.length
  const resolvedAlerts = alerts.filter((a) => a.resolved).length
  const resolutionRate =
    totalAlerts > 0 ? ((resolvedAlerts / totalAlerts) * 100).toFixed(1) : '0'

  const activeAlerts = alerts.filter((a) => !a.resolved).length

  const alertsByType = {
    SOS: alerts.filter((a) => a.type === 'SOS').length,
    FALL: alerts.filter((a) => a.type === 'FALL').length,
    ANOMALY: alerts.filter((a) => a.type === 'ANOMALY').length,
    IMMOBILE: alerts.filter((a) => a.type === 'IMMOBILE').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-500 mt-2">
          Analyse et rapports du système MoolProtect
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taux de résolution</p>
              <p className="text-3xl font-bold text-gray-900">{resolutionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-gray-600 text-sm">Total Alertes</p>
            <p className="text-3xl font-bold text-gray-900">{totalAlerts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-gray-600 text-sm">Alertes actives</p>
            <p className="text-3xl font-bold text-red-600">{activeAlerts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-gray-600 text-sm">Pêcheurs moyens en ligne</p>
            <p className="text-3xl font-bold text-gray-900">{stats.onlineNow}</p>
          </div>
        </div>
      </div>

      {/* Alerts by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertes par type
          </h2>
          <div className="space-y-4">
            {Object.entries(alertsByType).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {type}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${totalAlerts > 0 ? (count / totalAlerts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statut des pêcheurs
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">En ligne</span>
                <span className="text-sm font-bold text-gray-900">
                  {fishermen.filter((f) => f.status === 'online').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      fishermen.length > 0
                        ? (fishermen.filter((f) => f.status === 'online').length /
                            fishermen.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Hors ligne</span>
                <span className="text-sm font-bold text-gray-900">
                  {fishermen.filter((f) => f.status === 'offline').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{
                    width: `${
                      fishermen.length > 0
                        ? (fishermen.filter((f) => f.status === 'offline').length /
                            fishermen.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Alertes</span>
                <span className="text-sm font-bold text-gray-900">
                  {fishermen.filter((f) => f.status === 'alert').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      fishermen.length > 0
                        ? (fishermen.filter((f) => f.status === 'alert').length /
                            fishermen.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
