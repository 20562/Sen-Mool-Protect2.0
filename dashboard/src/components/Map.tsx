import { useEffect, useRef } from 'react'
import { useDashboardStore } from '../store'

// Mock map component (using canvas for demo)
// In production, use react-leaflet or google-maps-react
export default function MapComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fishermen = useDashboardStore((state) => state.fishermen)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw water pattern
    ctx.strokeStyle = '#0f3460'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw fishermen (scale coordinates to canvas)
    fishermen.forEach((fisherman) => {
      // Scale to canvas dimensions (simple scaling for demo)
      const x =
        ((fisherman.longitude + 180) / 360) * canvas.width ||
        Math.random() * canvas.width
      const y =
        ((fisherman.latitude + 90) / 180) * canvas.height ||
        Math.random() * canvas.height

      // Draw marker circle
      const radius = fisherman.status === 'alert' ? 12 : 8
      ctx.fillStyle =
        fisherman.status === 'online'
          ? '#10b981'
          : fisherman.status === 'alert'
            ? '#dc2626'
            : '#6b7280'

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw name label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(fisherman.name.substring(0, 3), x, y - 20)
    })

    // Draw center cross
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    ctx.setLineDash([])
  }, [fishermen])

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full block"
      />

      {fishermen.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">📍 Pas de pêcheurs à afficher</p>
            <p className="text-gray-500 text-sm">
              Les pêcheurs apparaîtront ici quand ils seront en ligne
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>En ligne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Alerte</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
          <span>Hors ligne</span>
        </div>
      </div>
    </div>
  )
}
