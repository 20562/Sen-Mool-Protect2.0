import { create } from 'zustand'
import { Fisherman, Alert, DashboardStats } from '../types'
import { io, Socket } from 'socket.io-client'

interface DashboardStore {
  // Data
  fishermen: Fisherman[]
  alerts: Alert[]
  stats: DashboardStats
  selectedFisherman: Fisherman | null

  // WebSocket
  socket: Socket | null
  isConnected: boolean

  // Actions
  initSocket: () => void
  addFisherman: (fisherman: Fisherman) => void
  updateFisherman: (fisherman: Fisherman) => void
  removeFisherman: (id: string) => void
  setFishermen: (fishermen: Fisherman[]) => void

  addAlert: (alert: Alert) => void
  resolveAlert: (alertId: string) => void
  setAlerts: (alerts: Alert[]) => void

  updateStats: (stats: DashboardStats) => void
  setSelectedFisherman: (fisherman: Fisherman | null) => void
  setConnected: (connected: boolean) => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  fishermen: [],
  alerts: [],
  stats: {
    totalFishermen: 0,
    onlineNow: 0,
    activeAlerts: 0,
    resolvedToday: 0,
  },
  selectedFisherman: null,
  socket: null,
  isConnected: false,

  initSocket: () => {
    const socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      set({ isConnected: true })
      console.log('✅ Connected to server')
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
      console.log('❌ Disconnected from server')
    })

    socket.on('fisherman:update', (fisherman: Fisherman) => {
      get().updateFisherman(fisherman)
    })

    socket.on('fisherman:new', (fisherman: Fisherman) => {
      get().addFisherman(fisherman)
    })

    socket.on('alert:new', (alert: Alert) => {
      get().addAlert(alert)
    })

    socket.on('stats:update', (stats: DashboardStats) => {
      get().updateStats(stats)
    })

    set({ socket })
  },

  addFisherman: (fisherman: Fisherman) => {
    set((state) => ({
      fishermen: [...state.fishermen, fisherman],
    }))
  },

  updateFisherman: (fisherman: Fisherman) => {
    set((state) => ({
      fishermen: state.fishermen.map((f) =>
        f.id === fisherman.id ? fisherman : f
      ),
    }))
  },

  removeFisherman: (id: string) => {
    set((state) => ({
      fishermen: state.fishermen.filter((f) => f.id !== id),
    }))
  },

  setFishermen: (fishermen: Fisherman[]) => {
    set({ fishermen })
  },

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }))
  },

  resolveAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      ),
    }))
  },

  setAlerts: (alerts: Alert[]) => {
    set({ alerts })
  },

  updateStats: (stats: DashboardStats) => {
    set({ stats })
  },

  setSelectedFisherman: (fisherman: Fisherman | null) => {
    set({ selectedFisherman: fisherman })
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected })
  },
}))
