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
  { to: '/campaigns', icon: Target, label: 'Campaigns' },
  { to: '/ask', icon: MessageSquare, label: 'Ask Shopper360' },
  { to: '/admin/branding', icon: Settings, label: 'Admin' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { livery } = useTheme()

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-gradient-to-b from-sidebar-from to-sidebar-to text-white transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold shrink-0">
          S3
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-sm leading-tight">{livery.logoText}</p>
            <p className="text-[10px] text-white/50">{livery.tagline}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/8',
                collapsed && 'justify-center px-2',
              )
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-slate-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
