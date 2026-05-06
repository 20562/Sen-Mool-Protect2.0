import { useDashboardStore } from '../store'
import { Heart, Thermometer, Battery, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Fishermen() {
  const fishermen = useDashboardStore((state) => state.fishermen)
  const setSelectedFisherman = useDashboardStore(
    (state) => state.setSelectedFisherman
  )

  const statusColors: Record<string, string> = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-800',
    alert: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des Pêcheurs
        </h1>
        <p className="text-gray-500 mt-2">
          Suivi en temps réel de {fishermen.length} pêcheurs
        </p>
      </div>

      {/* Fishermen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fishermen.map((fisherman) => (
          <div
            key={fisherman.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedFisherman(fisherman)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {fisherman.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Bateau: {fisherman.boatId}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[fisherman.status]
                }`}
              >
                {fisherman.status === 'online'
                  ? '🟢 En ligne'
                  : fisherman.status === 'offline'
                    ? '⚪ Hors ligne'
                    : '🔴 Alerte'}
              </span>
            </div>

            {/* Location */}
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">Position GPS</p>
              <p className="text-sm font-mono">
                {fisherman.latitude.toFixed(4)}, {fisherman.longitude.toFixed(4)}
              </p>
            </div>

            {/* Vital Signs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">
                  {fisherman.heartRate} bpm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">
                  {fisherman.temperature.toFixed(1)}°C
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  {fisherman.batteryLevel}%
                </span>
              </div>
            </div>

            {/* Last Update */}
            <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(fisherman.lastUpdate), {
                addSuffix: true,
                locale: fr,
              })}
            </div>
          </div>
        ))}
      </div>

      {fishermen.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun pêcheur actuellement suivi</p>
        </div>
      )}
    </div>
  )
}
