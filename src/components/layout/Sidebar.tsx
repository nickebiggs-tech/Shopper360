import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CalendarDays,
  PieChart,
  Target,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Heart,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../theme/ThemeProvider'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shoppers', icon: Users, label: 'Shoppers' },
  { to: '/basket', icon: ShoppingCart, label: 'Basket Analysis' },
  { to: '/visits', icon: CalendarDays, label: 'Visit Patterns' },
  { to: '/segments', icon: PieChart, label: 'Segments' },
  { to: '/national', icon: BarChart3, label: 'Benchmarks' },
  { to: '/suppliers', icon: Package, label: 'Suppliers' },
  { to: '/loyalty', icon: Heart, label: 'Loyalty' },
  { to: '/campaigns', icon: Target, label: 'Campaigns' },
  { to: '/ask', icon: MessageSquare, label: 'Ask Shopper360' },
  { to: '/admin/branding', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { livery } = useTheme()

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        {collapsed && !mobileOpen ? (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-white">
            {livery.logoShort}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <img src={livery.logoWhite} alt={livery.name} className="h-9 object-contain object-left" />
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden ml-auto p-1 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/8',
                collapsed && !mobileOpen && 'justify-center px-2',
              )
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {(!collapsed || mobileOpen) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Powered by */}
      {(!collapsed || mobileOpen) && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[10px] text-white/30">Powered by {livery.poweredBy}</p>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex h-screen flex-col bg-gradient-to-b from-sidebar-from to-sidebar-to text-white transition-all duration-300 relative',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {navContent}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-72 max-w-[80vw] flex flex-col bg-gradient-to-b from-sidebar-from to-sidebar-to text-white shadow-2xl animate-slide-in safe-area-inset">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
