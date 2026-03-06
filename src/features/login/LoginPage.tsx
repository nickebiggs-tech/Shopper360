import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { Eye, EyeOff, ShieldCheck, Users, BarChart3, TrendingUp, Pill, Heart, Sparkles, Baby, Sun, FlaskConical, Stethoscope, ShoppingCart, Globe, Store } from 'lucide-react'

/* ─── animated data-particle columns ─── */
function DataParticles({ count = 12 }: { count?: number }) {
  const configs = [
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
  const cols = configs.slice(0, count)
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

/* ─── orbiting category icons — professional SVG icons ─── */
function OrbitingIcons() {
  const icons = [
    { Icon: Pill, delay: '0s', ring: 'orbit' },
    { Icon: Heart, delay: '-15s', ring: 'orbit' },
    { Icon: Stethoscope, delay: '-30s', ring: 'orbit' },
    { Icon: Baby, delay: '-45s', ring: 'orbit' },
    { Icon: Sparkles, delay: '-10s', ring: 'orbit-outer' },
    { Icon: FlaskConical, delay: '-30s', ring: 'orbit-outer' },
    { Icon: Sun, delay: '-50s', ring: 'orbit-outer' },
  ]
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {icons.map((ic, i) => (
        <div
          key={i}
          className="absolute left-0 top-0"
          style={{
            animation: `${ic.ring} 60s ${ic.delay} linear infinite`,
          }}
        >
          <div className="w-9 h-9 rounded-full bg-white/[0.10] backdrop-blur-sm flex items-center justify-center border border-white/[0.08]">
            <ic.Icon className="w-4 h-4 text-white/50" strokeWidth={1.5} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Shopper Ecosystem — person at heart of CW with competitor web ─── */
function ShopperEcosystem() {
  // Competitors positioned around the shopper (angle in degrees, distance from center)
  const competitors = [
    { name: 'Priceline', angle: 0, Icon: Pill, color: '#3B82F6' },
    { name: 'Mecca', angle: 51, Icon: Sparkles, color: '#EC4899' },
    { name: 'Online', angle: 103, Icon: Globe, color: '#F59E0B' },
    { name: 'Supermarkets', angle: 154, Icon: ShoppingCart, color: '#10B981' },
    { name: 'Discount', angle: 206, Icon: Store, color: '#8B5CF6' },
    { name: 'Terry White', angle: 257, Icon: Heart, color: '#06B6D4' },
    { name: 'Other Rx', angle: 309, Icon: FlaskConical, color: '#F97316' },
  ]

  const cx = 200
  const cy = 200
  const innerR = 52   // CW ring
  const midR = 110    // web ring 1
  const outerR = 165   // competitor nodes

  return (
    <div className="relative w-[340px] h-[440px] flex flex-col items-center">
      {/* Persona card — floating above */}
      <div
        className="bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-xl px-4 py-3 mb-3 w-[220px]"
        style={{ animation: 'hero-fade-in 0.8s 0.8s ease-out both' }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/15 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white/80 leading-tight">Sarah M.</p>
            <p className="text-[9px] text-white/40 leading-tight mt-0.5">Young Family · Health-conscious</p>
            <p className="text-[9px] text-white/30 leading-tight">$142 avg basket · 3.2 visits/mo</p>
          </div>
        </div>
      </div>

      {/* Main SVG spider web */}
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[320px] h-[320px]"
        style={{ animation: 'hero-fade-in 1s 0.3s ease-out both' }}
      >
        {/* Web rings (spider web concentric) */}
        <circle cx={cx} cy={cy} r={midR} stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
        <circle cx={cx} cy={cy} r={outerR} stroke="white" strokeWidth="0.5" strokeOpacity="0.06" />

        {/* Web spokes — lines from center to each competitor */}
        {competitors.map((comp) => {
          const rad = (comp.angle * Math.PI) / 180
          const ex = cx + outerR * Math.cos(rad)
          const ey = cy + outerR * Math.sin(rad)
          return (
            <line
              key={`spoke-${comp.name}`}
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke="white" strokeWidth="0.6" strokeOpacity="0.06"
            />
          )
        })}

        {/* Cross-web connections (inner web pattern) */}
        {competitors.map((comp, i) => {
          const next = competitors[(i + 1) % competitors.length]!
          const rad1 = (comp.angle * Math.PI) / 180
          const rad2 = (next.angle * Math.PI) / 180
          const x1 = cx + midR * Math.cos(rad1)
          const y1 = cy + midR * Math.sin(rad1)
          const x2 = cx + midR * Math.cos(rad2)
          const y2 = cy + midR * Math.sin(rad2)
          return (
            <line
              key={`web-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="white" strokeWidth="0.5" strokeOpacity="0.06"
            />
          )
        })}

        {/* Animated spend-flow dashes — from CW center outward to competitors */}
        {competitors.map((comp, i) => {
          const rad = (comp.angle * Math.PI) / 180
          const sx = cx + innerR * Math.cos(rad)
          const sy = cy + innerR * Math.sin(rad)
          const ex = cx + (outerR - 20) * Math.cos(rad)
          const ey = cy + (outerR - 20) * Math.sin(rad)
          return (
            <line
              key={`flow-${comp.name}`}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={comp.color}
              strokeWidth="1.2"
              strokeDasharray="3 6"
              strokeOpacity="0.35"
              style={{ animation: `dash-flow 2s ${i * 0.3}s linear infinite` }}
            />
          )
        })}

        {/* Inner CW ring — glow */}
        <circle cx={cx} cy={cy} r={innerR + 8} fill="white" fillOpacity="0.02"
          style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
        />
        <circle cx={cx} cy={cy} r={innerR} fill="white" fillOpacity="0.06"
          stroke="white" strokeWidth="1.5" strokeOpacity="0.2"
        />

        {/* CW logo text at center */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fillOpacity="0.9"
          fontSize="16" fontWeight="800" fontFamily="inherit" letterSpacing="1">
          CW
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="white" fillOpacity="0.35"
          fontSize="7" fontWeight="500" fontFamily="inherit" letterSpacing="0.5">
          SHOPPER
        </text>

        {/* Shopper silhouette icon at center */}
        <g transform={`translate(${cx - 6}, ${cy + 14})`} opacity="0.4">
          <circle cx="6" cy="3" r="3" fill="white" />
          <path d="M0 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="1.2" fill="none" />
        </g>

        {/* Competitor nodes */}
        {competitors.map((comp, i) => {
          const rad = (comp.angle * Math.PI) / 180
          const nx = cx + outerR * Math.cos(rad)
          const ny = cy + outerR * Math.sin(rad)
          // Label offset — push label outward
          const lx = cx + (outerR + 22) * Math.cos(rad)
          const ly = cy + (outerR + 22) * Math.sin(rad)
          const anchor = comp.angle > 90 && comp.angle < 270 ? 'end' : 'start'
          const adjustedAnchor = Math.abs(comp.angle - 180) < 30 || comp.angle < 30 || comp.angle > 330 ? 'middle' : anchor

          return (
            <g key={comp.name} style={{ animation: `hero-fade-in 0.5s ${0.6 + i * 0.12}s ease-out both` }}>
              {/* Node circle */}
              <circle cx={nx} cy={ny} r={14} fill={comp.color} fillOpacity="0.15"
                stroke={comp.color} strokeWidth="1" strokeOpacity="0.4" />
              {/* Lucide icon via foreignObject */}
              <foreignObject x={nx - 8} y={ny - 8} width={16} height={16}>
                <comp.Icon style={{ width: 12, height: 12, margin: '2px', color: comp.color, opacity: 0.8 }} />
              </foreignObject>
              {/* Label */}
              <text x={lx} y={ly + 3} textAnchor={adjustedAnchor} fill="white" fillOpacity="0.45"
                fontSize="8" fontWeight="500" fontFamily="inherit">
                {comp.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Bottom label */}
      <p className="text-[9px] text-white/25 mt-1 tracking-widest uppercase"
        style={{ animation: 'hero-fade-in 0.6s 1.5s ease-out both' }}
      >
        Shopper Ecosystem
      </p>
    </div>
  )
}

/* ─── mobile hero banner ─── */
function MobileHero({ livery }: { livery: { heroStats: { label: string; value: string }[]; heroFeatureStat?: { value: string; label: string }; poweredBy: string } }) {
  const mobileStats = [
    { icon: Users, value: '3.2M+', label: 'Shoppers' },
    { icon: BarChart3, value: '18M+', label: 'Journeys' },
    { icon: ShieldCheck, value: '500+', label: 'Stores' },
    { icon: TrendingUp, value: '120+', label: 'Partners' },
  ]

  return (
    <div className="relative bg-gradient-to-br from-hero-from via-hero-mid to-hero-to overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-white/[0.06] blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-white/[0.04] blur-2xl" />
        <DataParticles count={6} />
        <div className="absolute right-[20%] top-[50%]">
          <div className="absolute -left-[60px] -top-[60px] w-[120px] h-[120px] rounded-full border border-white/10"
            style={{ animation: 'pulse-ring 4s ease-in-out infinite' }} />
          <div className="absolute -left-[100px] -top-[100px] w-[200px] h-[200px] rounded-full border border-white/[0.06]"
            style={{ animation: 'pulse-ring-slow 5s ease-in-out 0.5s infinite' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 pt-8 pb-6">
        {/* Big number */}
        <div style={{ animation: 'hero-number-in 0.8s 0.1s ease-out both' }}>
          <p className="text-5xl font-extrabold tracking-tighter leading-none text-white mb-1">
            {livery.heroFeatureStat?.value || '3.2M+'}
          </p>
          <p className="text-white/50 text-xs leading-relaxed max-w-[260px]">
            unique shoppers across 500+ stores — the richest shopper journey data in Australian pharmacy
          </p>
        </div>

        {/* Stat pills — horizontal scroll */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {mobileStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 bg-white/[0.10] backdrop-blur-sm border border-white/[0.08] rounded-xl px-3.5 py-2.5 shrink-0"
                style={{ animation: `hero-fade-in 0.5s ${0.3 + idx * 0.1}s ease-out both` }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.12] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-none">{stat.value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
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
      {/* Mobile hero banner — visible only on mobile/tablet */}
      <div className="lg:hidden">
        <MobileHero livery={livery} />
      </div>

      {/* Desktop hero — hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-hero-from via-hero-mid to-hero-to relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-white/[0.03] blur-3xl" />
          <DataParticles />
          <div className="absolute right-[15%] top-[45%]">
            <PulseRings />
            <OrbitingIcons />
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full px-12 xl:px-16 py-10">
          <div style={{ animation: 'hero-fade-in 0.8s ease-out both' }}>
            <img src={livery.logoWhite} alt={livery.name} className="h-12 object-contain object-left" />
          </div>

          <div className="flex items-center gap-8 xl:gap-12 flex-1 py-8">
            <div className="flex-1 min-w-0">
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
              <div className="grid grid-cols-2 gap-2.5 max-w-sm" style={{ animation: 'hero-fade-in 0.8s 0.9s ease-out both' }}>
                {livery.heroStats.map((stat, idx) => (
                  <div key={stat.label}
                    className="bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-lg px-4 py-3 hover:bg-white/[0.12] transition-colors"
                    style={{ animation: `hero-fade-in 0.6s ${1.0 + idx * 0.12}s ease-out both` }}>
                    <p className="text-xl font-bold tracking-tight text-white">{stat.value}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden xl:flex flex-col items-center shrink-0" style={{ animation: 'hero-fade-in 1s 0.5s ease-out both' }}>
              <ShopperEcosystem />
            </div>
          </div>

          <div style={{ animation: 'hero-fade-in 0.8s 1.5s ease-out both' }}>
            <p className="text-[10px] text-white/25">
              Powered by {livery.poweredBy} · Credit card transaction intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-5 sm:px-8 bg-white">
        <div className="w-full max-w-sm" style={{ animation: 'hero-fade-in 0.6s 0.2s ease-out both' }}>
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <img src={livery.logoColor} alt={livery.name} className="h-10 sm:h-12 object-contain object-left" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Welcome back</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">Sign in to access your shopper intelligence dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2.5">{error}</p>
            )}

            <button type="submit" disabled={loading || !username || !password}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-6 sm:mt-8">
            Powered by {livery.poweredBy}
          </p>
        </div>
      </div>
    </div>
  )
}
