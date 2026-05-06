import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useEffect } from 'react'
import { useDashboardStore } from '../store'

export default function Layout() {
  const initSocket = useDashboardStore((state) => state.initSocket)

  useEffect(() => {
    initSocket()
  }, [initSocket])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
