import { useDashboardStore } from '../store'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Alerts() {
  const alerts = useDashboardStore((state) => state.alerts)
  const resolveAlert = useDashboardStore((state) => state.resolveAlert)

  const activeAlerts = alerts.filter((a) => !a.resolved)
  const resolvedAlerts = alerts.filter((a) => a.resolved)

  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    SOS: '🆘',
    FALL: '⬇️',
    ANOMALY: '⚠️',
    IMMOBILE: '🟢',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Système d'Alertes</h1>
        <p className="text-gray-500 mt-2">
          Gérez et suivez toutes les alertes en temps réel
        </p>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Alertes Actives ({activeAlerts.length})
            </h2>
          </div>
        </div>
        <div className="divide-y">
          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ✅ Aucune alerte active
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{typeIcons[alert.type]}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          severityColors[alert.severity]
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(alert.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {alert.fishermanName}
                    </p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold"
                  >
                    Résoudre
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolved Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-900">
              Alertes Résolues ({resolvedAlerts.length})
            </h2>
          </div>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {resolvedAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune alerte résolue
            </div>
          ) : (
            resolvedAlerts.map((alert) => (
              <div key={alert.id} className="p-4 opacity-60 hover:opacity-100">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{typeIcons[alert.type]}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {alert.fishermanName}
                    </p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
