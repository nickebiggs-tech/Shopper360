import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { Eye, EyeOff } from 'lucide-react'

/* ─── animated data-particle columns ─── */
function DataParticles() {
  // 12 particle columns flowing upward at different speeds/positions
  const cols = [
    { left: '8%', delay: '0s', dur: '7s', size: 3, anim: 'flow-up-1' },
    { left: '15%', delay: '1.2s', dur: '9s', size: 2, anim: 'flow-up-2' },
    { left: '22%', delay: '0.5s', dur: '8s', size: 4, anim: 'flow-up-3' },
    { left: '30%', delay: '2.1s', dur: '7.5s', size: 2, anim: 'flow-up-1' },
    { left: '38%', delay: '0.8s', dur: '9.5s', size: 3, anim: 'flow-up-2' },
    { left: '46%', delay: '1.6s', dur: '8.5s', size: 2, anim: 'flow-up-3' },
    { left: '54%', delay: '0.3s', dur: '7s', size: 3, anim: 'flow-up-1' },
    { left: '62%', delay: '2.4s', dur: '8s', size: 2, anim: 'flow-up-2' },
    { left: '70%', delay: '1.0s', dur: '9s', size: 4, anim: 'flow-up-3' },
    { left: '78%', delay: '1.8s', dur: '7.5s', size: 2, anim: 'flow-up-1' },
    { left: '86%', delay: '0.6s', dur: '8.5s', size: 3, anim: 'flow-up-2' },
    { left: '93%', delay: '2.0s', dur: '9.5s', size: 2, anim: 'flow-up-3' },
  ]
  return (
    <>
      {cols.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: c.left,
            bottom: '-20px',
            width: c.size,
            height: c.size,
            animation: `${c.anim} ${c.dur} ${c.delay} linear infinite`,
          }}
        />
      ))}
    </>
  )
}

/* ─── pulsing concentric rings ─── */
function PulseRings() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div
        className="absolute -left-[100px] -top-[100px] w-[200px] h-[200px] rounded-full border border-white/15"
        style={{ animation: 'pulse-ring 4s ease-in-out infinite' }}
      />
      <div
        className="absolute -left-[160px] -top-[160px] w-[320px] h-[320px] rounded-full border border-white/10"
        style={{ animation: 'pulse-ring-slow 5s ease-in-out 0.5s infinite' }}
      />
      <div
        className="absolute -left-[230px] -top-[230px] w-[460px] h-[460px] rounded-full border border-white/[0.06]"
        style={{ animation: 'pulse-ring-slow 6s ease-in-out 1s infinite' }}
      />
    </div>
  )
}

/* ─── orbiting category icons ─── */
function OrbitingIcons() {
  const icons = [
    { emoji: '💊', delay: '0s', ring: 'orbit' },
    { emoji: '🧴', delay: '-15s', ring: 'orbit' },
    { emoji: '🩹', delay: '-30s', ring: 'orbit' },
    { emoji: '👶', delay: '-45s', ring: 'orbit' },
    { emoji: '💄', delay: '-10s', ring: 'orbit-outer' },
    { emoji: '🧪', delay: '-30s', ring: 'orbit-outer' },
    { emoji: '☀️', delay: '-50s', ring: 'orbit-outer' },
  ]
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {icons.map((ic, i) => (
        <span
          key={i}
          className="absolute left-0 top-0 text-lg opacity-[0.35]"
          style={{
            animation: `${ic.ring} 60s ${ic.delay} linear infinite`,
            filter: 'grayscale(0.3)',
          }}
        >
          {ic.emoji}
        </span>
      ))}
    </div>
  )
}

/* ─── journey funnel SVG ─── */
function JourneyFunnel() {
  const stages = [
    { y: 60, label: 'Discovery', w: 220 },
    { y: 130, label: 'Visit', w: 180 },
    { y: 200, label: 'Purchase', w: 140 },
    { y: 270, label: 'Repeat', w: 105 },
    { y: 340, label: 'Loyal', w: 75 },
  ]

  return (
    <svg viewBox="0 0 300 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[260px] h-[360px]">
      {/* Connecting flow lines */}
      {stages.map((s, i) => {
        if (i === stages.length - 1) return null
        const next = stages[i + 1]!
        return (
          <g key={`line-${i}`}>
            <line
              x1={150 - s.w / 2 + 10}
              y1={s.y + 36}
              x2={150 - next.w / 2 + 10}
              y2={next.y + 4}
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.2"
              style={{ animation: 'dash-flow 1.5s linear infinite' }}
            />
            <line
              x1={150 + s.w / 2 - 10}
              y1={s.y + 36}
              x2={150 + next.w / 2 - 10}
              y2={next.y + 4}
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.2"
              style={{ animation: 'dash-flow 1.5s linear infinite' }}
            />
          </g>
        )
      })}
      {/* Funnel stages */}
      {stages.map((s, i) => {
        const opacity = 0.08 + i * 0.04
        return (
          <g key={s.label}>
            <rect
              x={150 - s.w / 2}
              y={s.y}
              width={s.w}
              height={36}
              rx={8}
              fill="white"
              fillOpacity={opacity}
              stroke="white"
              strokeWidth="0.8"
              strokeOpacity={0.2 + i * 0.05}
            />
            <text
              x={150}
              y={s.y + 22}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.5 + i * 0.1}
              fontSize="12"
              fontWeight="500"
              fontFamily="inherit"
            >
              {s.label}
            </text>
          </g>
        )
      })}
      {/* Arrow at bottom */}
      <polygon points="140,390 150,405 160,390" fill="white" fillOpacity="0.3" />
    </svg>
  )
}

/* ─── main login page ─── */
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
      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-hero-from via-hero-mid to-hero-to relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-white/[0.03] blur-3xl" />

          {/* Flowing data particles */}
          <DataParticles />

          {/* Pulse rings centred on the journey funnel area */}
          <div className="absolute right-[15%] top-[45%]">
            <PulseRings />
            <OrbitingIcons />
          </div>
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 xl:px-16 py-10">
          {/* Top: Logo */}
          <div style={{ animation: 'hero-fade-in 0.8s ease-out both' }}>
            <img src={livery.logoWhite} alt={livery.name} className="h-12 object-contain object-left" />
          </div>

          {/* Middle: Content + Funnel side by side */}
          <div className="flex items-center gap-8 xl:gap-12 flex-1 py-8">
            {/* Left text column */}
            <div className="flex-1 min-w-0">
              {/* Big number callout */}
              {livery.heroFeatureStat && (
                <div className="mb-6" style={{ animation: 'hero-number-in 1s 0.2s ease-out both' }}>
                  <p className="text-7xl xl:text-8xl font-extrabold tracking-tighter leading-none mb-2 text-white">
                    {livery.heroFeatureStat.value}
                  </p>
                  <p className="text-white/50 text-sm xl:text-base max-w-sm leading-relaxed">
                    {livery.heroFeatureStat.label}
                  </p>
                </div>
              )}

              {!livery.heroFeatureStat && (
                <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4" style={{ animation: 'hero-number-in 1s 0.2s ease-out both' }}>
                  {livery.heroLine1}<br />
                  <span className="text-white/70">{livery.heroLine2}</span>
                </h2>
              )}

              <p className="text-white/35 text-sm max-w-sm mb-8 leading-relaxed" style={{ animation: 'hero-fade-in 0.8s 0.6s ease-out both' }}>
                {livery.heroSubtext}
              </p>

              {/* Stat cards — 2×2 grid */}
              <div className="grid grid-cols-2 gap-2.5 max-w-sm" style={{ animation: 'hero-fade-in 0.8s 0.9s ease-out both' }}>
                {livery.heroStats.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-lg px-4 py-3 hover:bg-white/[0.12] transition-colors"
                    style={{ animation: `hero-fade-in 0.6s ${1.0 + idx * 0.12}s ease-out both` }}
                  >
                    <p className="text-xl font-bold tracking-tight text-white">{stat.value}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Journey funnel visualization */}
            <div
              className="hidden xl:flex flex-col items-center shrink-0"
              style={{ animation: 'hero-fade-in 1s 0.5s ease-out both' }}
            >
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 mb-4">Shopper Journey</p>
              <JourneyFunnel />
            </div>
          </div>

          {/* Bottom: Powered by */}
          <div style={{ animation: 'hero-fade-in 0.8s 1.5s ease-out both' }}>
            <p className="text-[10px] text-white/25">
              Powered by {livery.poweredBy} · Credit card transaction intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-5 sm:px-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo on white bg */}
          <div className="mb-8">
            <img src={livery.logoColor} alt={livery.name} className="h-12 object-contain object-left" />
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
            Powered by {livery.poweredBy}
          </p>
        </div>
      </div>
    </div>
  )
}
