import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { ShoppingCart, TrendingUp, Users, BarChart3, Eye, EyeOff } from 'lucide-react'

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
      setError('Invalid credentials. Try George / 1234')
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-hero-from via-hero-mid to-hero-to relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{livery.logoText}</h1>
              <p className="text-white/60 text-sm">{livery.tagline}</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Know your shoppers.<br />
            <span className="text-white/70">Grow your pharmacy.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-md mb-12">
            AI-powered insights into customer behaviour, basket composition, and retention opportunities.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: Users, label: 'Active Shoppers', value: '5,200+' },
              { icon: ShoppingCart, label: 'Avg Basket', value: '$43.80' },
              { icon: TrendingUp, label: 'Retention Rate', value: '72.4%' },
              { icon: BarChart3, label: 'Categories Tracked', value: '15' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <stat.icon className="w-5 h-5 text-white/50 mb-2" />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
              S3
            </div>
            <span className="text-lg font-bold text-slate-900">{livery.logoText}</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">PIN / Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PIN"
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
            Powered by NostraData Pty Ltd
          </p>
        </div>
      </div>
    </div>
  )
}
