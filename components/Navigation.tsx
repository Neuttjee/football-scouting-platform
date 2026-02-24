'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const routes = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Spelers', path: '/spelers', icon: Users },
  { name: 'Contacten', path: '/contacten', icon: MessageSquare },
  { name: 'Taken', path: '/taken', icon: CheckSquare },
  { name: 'Overzicht', path: '/overzicht', icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  const allRoutes = isAdmin
    ? [...routes, { name: 'Instellingen', path: '/instellingen', icon: Settings }]
    : routes

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <div className="font-bold text-lg">{session?.user?.clubName || 'Club'}</div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar (Desktop) / Dropdown (Mobile) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">
            {session?.user?.clubName || 'Scouting'}
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto">
          {allRoutes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.path || (route.path !== '/' && pathname?.startsWith(route.path))
            
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-900 font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{route.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center space-x-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Uitloggen</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}