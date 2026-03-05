import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const { livery } = useTheme()

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary">{livery.logoText}</span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-slate-500">{livery.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="w-4 h-4" />
          <span>{user?.displayName}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  )
}
