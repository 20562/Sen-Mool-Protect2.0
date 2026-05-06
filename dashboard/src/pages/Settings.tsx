import { useState } from 'react'
import { Save, AlertCircle } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:3000',
    alertThreshold: 70,
    refreshInterval: 5000,
    notificationsEnabled: true,
    emailAlerts: false,
    darkMode: false,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('moolprotect-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-2">
          Configuration du système MoolProtect
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="text-green-800">Paramètres sauvegardés avec succès</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* API Configuration */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration API
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du serveur
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Adresse du serveur Node.js backend
            </p>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Paramètres d'alerte
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil d'alerte (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.alertThreshold}
                onChange={(e) =>
                  handleChange('alertThreshold', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Déclencher une alerte si un paramètre dépasse ce seuil
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalle de rafraîchissement (ms)
              </label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) =>
                  handleChange('refreshInterval', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  handleChange('notificationsEnabled', e.target.checked)
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Notifications du navigateur
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Alertes par email (premium)
              </span>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Apparence</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleChange('darkMode', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mode sombre (bêta)</span>
          </label>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            <Save className="w-4 h-4" />
            Enregistrer les paramètres
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Information système</h3>
            <p className="text-sm text-blue-800 mt-1">
              Version: 2.0.0 | Mode: Production | Dernière mise à jour: 2026-05-06
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
