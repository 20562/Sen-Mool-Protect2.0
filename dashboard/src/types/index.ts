export interface Fisherman {
  id: string
  name: string
  status: 'online' | 'offline' | 'alert'
  latitude: number
  longitude: number
  heartRate: number
  temperature: number
  batteryLevel: number
  lastUpdate: Date
  boatId: string
}

export interface Alert {
  id: string
  fishermanId: string
  fishermanName: string
  type: 'SOS' | 'FALL' | 'ANOMALY' | 'IMMOBILE'
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: Date
  resolved: boolean
  latitude: number
  longitude: number
  description: string
}

export interface Boat {
  id: string
  name: string
  operator: string
  latitude: number
  longitude: number
  fishermen: string[]
}

export interface DashboardStats {
  totalFishermen: number
  onlineNow: number
  activeAlerts: number
  resolvedToday: number
}
