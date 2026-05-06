import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  MapPin,
} from 'lucide-react'

const menuItems = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Pêcheurs',
    icon: Users,
    path: '/fishermen',
  },
  {
    label: 'Alertes',
    icon: AlertTriangle,
    path: '/alerts',
  },
  {
    label: 'Statistiques',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    label: 'Paramètres',
    icon: Settings,
    path: '/settings',
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">MoolProtect</h1>
          <p className="text-xs text-gray-400">v2.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © 2026 MoolProtect — Souveraineté Numérique
        </p>
      </div>
    </aside>
  )
}
