import { Alert } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RecentAlertsProps {
  alerts: Alert[]
}

export default function RecentAlerts({ alerts }: RecentAlertsProps) {
  const typeEmojis: Record<string, string> = {
    SOS: '🆘',
    FALL: '⬇️',
    ANOMALY: '⚠️',
    IMMOBILE: '🟢',
  }

  const severityColors: Record<string, string> = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50',
  }

  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>✅ Aucune alerte récente</p>
      </div>
    )
  }

  return (
    <div className="divide-y max-h-96 overflow-y-auto">
      {alerts.map((alert) => (
        <div key={alert.id} className={`p-4 ${severityColors[alert.severity]}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{typeEmojis[alert.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-sm truncate">
                  {alert.fishermanName}
                </p>
                <span className="text-xs font-semibold ml-2 flex-shrink-0">
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs opacity-75">
                {formatDistanceToNow(new Date(alert.timestamp), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
              {!alert.resolved && (
                <div className="mt-2 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
