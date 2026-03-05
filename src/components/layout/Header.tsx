import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { LogOut, User, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const { livery } = useTheme()

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-primary tracking-tight">Shopper<span className="text-primary/60">360</span></span>
        <span className="text-xs text-slate-300 hidden sm:inline">|</span>
        <span className="text-xs text-slate-500 hidden sm:inline font-medium">{livery.name}</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{user?.displayName}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
