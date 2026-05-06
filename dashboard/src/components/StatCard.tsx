interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'red' | 'purple'
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  const classes = colorClasses[color]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${classes.bg}`}>{icon}</div>
      </div>
    </div>
  )
}
