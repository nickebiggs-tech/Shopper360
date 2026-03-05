import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { Users, Store, Layers, Handshake, TrendingUp, ShoppingCart, BarChart3, Eye, EyeOff } from 'lucide-react'

const STAT_ICONS = [Users, ShoppingCart, TrendingUp, BarChart3, Store, Layers, Handshake]

/** Shopper journey hub-and-spoke SVG — CW/brand at centre, journey stages radiating out */
function JourneyVisualization() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl opacity-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl opacity-10" />

      {/* Journey network SVG */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.07]"
        style={{ animation: 'spin 120s linear infinite' }}
      >
        {/* Outer orbital ring */}
        <circle cx="250" cy="250" r="220" stroke="white" strokeWidth="0.8" strokeDasharray="6 10" />
        <circle cx="250" cy="250" r="160" stroke="white" strokeWidth="0.6" strokeDasharray="4 8" />

        {/* Central hub — the store */}
        <circle cx="250" cy="250" r="50" stroke="white" strokeWidth="2" />
        <circle cx="250" cy="250" r="52" stroke="white" strokeWidth="0.5" opacity="0.4" />
        <circle cx="250" cy="250" r="12" fill="white" />

        {/* Journey stage nodes + connecting lines */}
        {/* Discovery (top) */}
        <line x1="250" y1="200" x2="250" y2="60" stroke="white" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="250" cy="45" r="18" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.06" />
        <circle cx="250" cy="45" r="5" fill="white" opacity="0.6" />

        {/* Browse (top-right) */}
        <line x1="285" y1="215" x2="395" y2="105" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="405" cy="95" r="15" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.04" />
        <circle cx="405" cy="95" r="4" fill="white" opacity="0.5" />

        {/* Purchase (right) */}
        <line x1="300" y1="250" x2="440" y2="250" stroke="white" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="455" cy="250" r="18" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.06" />
        <circle cx="455" cy="250" r="5" fill="white" opacity="0.6" />

        {/* Repeat (bottom-right) */}
        <line x1="285" y1="285" x2="395" y2="395" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="405" cy="405" r="15" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.04" />
        <circle cx="405" cy="405" r="4" fill="white" opacity="0.5" />

        {/* Loyalty (bottom) */}
        <line x1="250" y1="300" x2="250" y2="440" stroke="white" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="250" cy="455" r="18" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.06" />
        <circle cx="250" cy="455" r="5" fill="white" opacity="0.6" />

        {/* Advocate (bottom-left) */}
        <line x1="215" y1="285" x2="105" y2="395" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="95" cy="405" r="15" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.04" />
        <circle cx="95" cy="405" r="4" fill="white" opacity="0.5" />

        {/* Awareness (left) */}
        <line x1="200" y1="250" x2="60" y2="250" stroke="white" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="45" cy="250" r="18" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.06" />
        <circle cx="45" cy="250" r="5" fill="white" opacity="0.6" />

        {/* Research (top-left) */}
        <line x1="215" y1="215" x2="105" y2="105" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="95" cy="95" r="15" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.04" />
        <circle cx="95" cy="95" r="4" fill="white" opacity="0.5" />

        {/* Small data particles on orbits */}
        <circle cx="250" cy="30" r="3" fill="white" opacity="0.3" />
        <circle cx="470" cy="250" r="3" fill="white" opacity="0.3" />
        <circle cx="250" cy="470" r="3" fill="white" opacity="0.3" />
        <circle cx="30" cy="250" r="3" fill="white" opacity="0.3" />
        <circle cx="406" cy="150" r="2" fill="white" opacity="0.2" />
        <circle cx="94" cy="350" r="2" fill="white" opacity="0.2" />
      </svg>
    </div>
  )
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { livery } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(username, password)
    setLoading(false)
    if (success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Left hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-hero-from via-hero-mid to-hero-to relative overflow-hidden">
        <JourneyVisualization />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <img src={livery.logoWhite} alt={livery.name} className="h-12 object-contain object-left" />
          </div>

          {/* Feature stat callout (if available) */}
          {livery.heroFeatureStat && (
            <div className="mb-6">
              <p className="text-6xl font-extrabold tracking-tight leading-none mb-2">
                {livery.heroFeatureStat.value}
              </p>
              <p className="text-white/60 text-base max-w-md leading-relaxed">
                {livery.heroFeatureStat.label}
              </p>
            </div>
          )}

          {/* Headline (when no feature stat) */}
          {!livery.heroFeatureStat && (
            <h2 className="text-4xl font-bold leading-tight mb-4">
              {livery.heroLine1}<br />
              <span className="text-white/70">{livery.heroLine2}</span>
            </h2>
          )}

          <p className="text-white/45 text-lg max-w-md mb-10">
            {livery.heroSubtext}
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {livery.heroStats.map((stat, idx) => {
              const Icon = STAT_ICONS[idx] ?? BarChart3
              return (
                <div key={stat.label} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/12 transition-colors">
                  <Icon className="w-4 h-4 text-white/40 mb-2" />
                  <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-white/45">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-5 sm:px-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <img src={livery.logoColor} alt={livery.name} className="h-10 object-contain object-left" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h3>
          <p className="text-sm text-slate-500 mb-8">Sign in to access your shopper intelligence dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            Powered by NostraData &middot; Shopper360
          </p>
        </div>
      </div>
    </div>
  )
}
