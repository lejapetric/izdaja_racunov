// src/components/layout/Sidebar.tsx
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FileText, Archive, AlertCircle, Receipt, BarChart3, Settings, LogOut, Menu, X, CheckCircle } from 'lucide-react'

const navItems = [
  { id: 'new-invoice', label: 'Ustvari račun', icon: FileText, roles: ['tajnistvo', 'projektant'] },
  { id: 'archive', label: 'Seznam računov', icon: Archive, roles: ['tajnistvo', 'direktor', 'projektant'] },
  { id: 'estimates', label: 'Predračuni', icon: Receipt, roles: ['tajnistvo'] },
  { id: 'overdue', label: 'Zapadli računi', icon: AlertCircle, roles: ['tajnistvo'] },
  { id: 'reports', label: 'Poročila in analize', icon: BarChart3, roles: ['tajnistvo', 'direktor'] },
  { id: 'confirmation', label: 'Potrditev računov', icon: CheckCircle, roles: ['direktor'] },
  { id: 'settings', label: 'Sistemske nastavitve', icon: Settings, roles: ['admin'] },
]

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  userRole: string
  onLogout?: () => void
}

export function Sidebar({ activeView, setActiveView, userRole, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  // Mobilni pogled - hamburger meni
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-primary rounded-lg shadow-lg text-primary-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed top-0 left-0 z-40 w-64 bg-primary text-primary-foreground flex flex-col h-full transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">GeoFaktura</div>
              <div className="text-xs opacity-70">Geodetski fakturirni sistem</div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (!item.roles.includes(userRole) && userRole !== 'admin') return null
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    activeView === item.id ? 'bg-white/20 text-white' : 'hover:bg-white/10'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.id === 'overdue' && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                  )}
                  {item.id === 'confirmation' && (
                    <span className="ml-auto bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">5</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">MN</div>
              <div>
                <div className="font-medium">Maja Novak</div>
                <div className="text-xs opacity-70">Tajništvo</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/10 text-white/90"
            >
              <LogOut className="w-4 h-4" /> Odjava
            </button>
          </div>
        </aside>
      </>
    )
  }

  // Namizni pogled
  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/20">
        <div className="font-bold text-lg">GeoFaktura</div>
        <div className="text-xs opacity-70">Geodetski fakturirni sistem</div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          if (!item.roles.includes(userRole) && userRole !== 'admin') return null
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                activeView === item.id ? 'bg-white/20 text-white' : 'hover:bg-white/10'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === 'overdue' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              )}
              {item.id === 'confirmation' && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">5</span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">MN</div>
          <div>
            <div className="font-medium">Maja Novak</div>
            <div className="text-xs opacity-70">Tajništvo</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/10 text-white/90"
        >
          <LogOut className="w-4 h-4" /> Odjava
        </button>
      </div>
    </aside>
  )
}