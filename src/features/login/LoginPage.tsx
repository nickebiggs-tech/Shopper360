import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import {
  Eye, EyeOff, ShieldCheck, Users, BarChart3, TrendingUp,
  Pill, Heart, Sparkles, FlaskConical, ShoppingCart, Globe, Store,
  Search, Repeat, CreditCard,
} from 'lucide-react'

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

/* ═══════════════════════════════════════════════════════════════════════
   SHOPPER ECOSYSTEM — the hero visual
   Tells the story: Persona → CW hub → Shopping journey → Competitor leakage
   Bigger SVG (viewBox 600×600) with generous margins for labels
   ═══════════════════════════════════════════════════════════════════════ */
function ShopperEcosystem() {
  const competitors = [
    { name: 'Priceline', angle: -90, Icon: Pill, color: '#3B82F6', share: '12%' },
    { name: 'Mecca / Sephora', angle: -39, Icon: Sparkles, color: '#EC4899', share: '8%' },
    { name: 'Online Retail', angle: 12, Icon: Globe, color: '#F59E0B', share: '15%' },
    { name: 'Supermarkets', angle: 63, Icon: ShoppingCart, color: '#10B981', share: '18%' },
    { name: 'Discount Stores', angle: 116, Icon: Store, color: '#8B5CF6', share: '6%' },
    { name: 'Amcal', angle: 167, Icon: Heart, color: '#06B6D4', share: '9%' },
    { name: 'Other Pharmacy', angle: 218, Icon: FlaskConical, color: '#F97316', share: '4%' },
  ]

  // Journey stages — positioned on inner ring
  const journeyStages = [
    { label: 'Browse', angle: -70, Icon: Search, step: 1 },
    { label: 'Compare', angle: -20, Icon: BarChart3, step: 2 },
    { label: 'Purchase', angle: 30, Icon: CreditCard, step: 3 },
    { label: 'Repeat', angle: 80, Icon: Repeat, step: 4 },
  ]

  const cx = 300
  const cy = 300
  const cwR = 54          // CW hub
  const journeyR = 110    // journey stage ring
  const midWebR = 170     // inner web ring
  const outerR = 235      // competitor nodes

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[620px] mx-auto">
      {/* ─── Persona card — the shopper ─── */}
      <div
        className="bg-white/[0.07] backdrop-blur-md border border-white/[0.12] rounded-2xl px-5 py-4 mb-3 w-[290px]"
        style={{ animation: 'hero-fade-in 0.8s 0.2s ease-out both' }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/25 to-white/5 border border-white/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white/90 leading-tight">Sarah Mitchell</p>
            <p className="text-[10px] text-white/45 leading-tight mt-0.5">Young Family · Health-conscious</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[9px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">$142/basket</span>
              <span className="text-[9px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">3.2×/mo</span>
              <span className="text-[9px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">28% SoW</span>
            </div>
          </div>
        </div>
        {/* Mini share-of-wallet bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[8px] text-white/30 shrink-0 w-[52px]">CW wallet</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.06] flex">
            <div className="h-full bg-primary/70 rounded-full" style={{ width: '28%' }} />
          </div>
          <span className="text-[8px] text-white/40 font-medium shrink-0">28%</span>
        </div>
      </div>

      {/* ─── Main ecosystem SVG — 600×600 viewBox for breathing room ─── */}
      <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[560px] h-auto"
      >
        {/* ── Outer web ring (drawn with animation) ── */}
        <circle cx={cx} cy={cy} r={outerR}
          stroke="white" strokeWidth="0.6" strokeOpacity="0.07"
          strokeDasharray="1500"
          style={{ animation: 'eco-ring-draw 2s 1.8s ease-out both' }}
        />

        {/* ── Mid web ring ── */}
        <circle cx={cx} cy={cy} r={midWebR}
          stroke="white" strokeWidth="0.5" strokeOpacity="0.08"
          strokeDasharray="1200"
          style={{ animation: 'eco-ring-draw 1.8s 1.4s ease-out both' }}
        />

        {/* ── Journey ring (dashed) ── */}
        <circle cx={cx} cy={cy} r={journeyR}
          stroke="white" strokeWidth="0.8" strokeOpacity="0.1"
          strokeDasharray="6 4"
          style={{ animation: 'eco-ring-draw 1.5s 0.9s ease-out both' }}
        />

        {/* ── Web spokes — from center to outer ring ── */}
        {competitors.map((comp, i) => {
          const rad = (comp.angle * Math.PI) / 180
          const ex = cx + outerR * Math.cos(rad)
          const ey = cy + outerR * Math.sin(rad)
          return (
            <line key={`spoke-${comp.name}`}
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke="white" strokeWidth="0.5" strokeOpacity="0.05"
              strokeDasharray="200"
              style={{ animation: `eco-spoke-grow 1s ${1.6 + i * 0.08}s ease-out both` }}
            />
          )
        })}

        {/* ── Cross-web connections (mid ring polygon) ── */}
        {competitors.map((comp, i) => {
          const next = competitors[(i + 1) % competitors.length]!
          const rad1 = (comp.angle * Math.PI) / 180
          const rad2 = (next.angle * Math.PI) / 180
          return (
            <line key={`web-${i}`}
              x1={cx + midWebR * Math.cos(rad1)} y1={cy + midWebR * Math.sin(rad1)}
              x2={cx + midWebR * Math.cos(rad2)} y2={cy + midWebR * Math.sin(rad2)}
              stroke="white" strokeWidth="0.4" strokeOpacity="0.05"
              style={{ animation: `hero-fade-in 0.6s ${2.0 + i * 0.06}s ease-out both` }}
            />
          )
        })}

        {/* ── Animated spend-flow dashes — CW → competitors ── */}
        {competitors.map((comp, i) => {
          const rad = (comp.angle * Math.PI) / 180
          const sx = cx + (cwR + 10) * Math.cos(rad)
          const sy = cy + (cwR + 10) * Math.sin(rad)
          const ex = cx + (outerR - 24) * Math.cos(rad)
          const ey = cy + (outerR - 24) * Math.sin(rad)
          return (
            <line key={`flow-${comp.name}`}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={comp.color} strokeWidth="1.5" strokeDasharray="4 8"
              strokeOpacity="0.4"
              style={{ animation: `dash-flow 2.5s ${2.4 + i * 0.15}s linear infinite, hero-fade-in 0.5s ${2.4 + i * 0.15}s ease-out both` }}
            />
          )
        })}

        {/* ── CW Hub — pulsing center ── */}
        <circle cx={cx} cy={cy} r={cwR + 14} fill="white" fillOpacity="0.015"
          style={{ animation: 'pulse-ring 3s 0.8s ease-in-out infinite' }}
        />
        <circle cx={cx} cy={cy} r={cwR + 6} fill="white" fillOpacity="0.03"
          stroke="white" strokeWidth="0.5" strokeOpacity="0.1"
          style={{ animation: 'eco-scale-in 0.6s 0.5s ease-out both' }}
        />
        <circle cx={cx} cy={cy} r={cwR} fill="white" fillOpacity="0.08"
          stroke="white" strokeWidth="2.5" strokeOpacity="0.25"
          style={{ animation: 'eco-scale-in 0.5s 0.4s ease-out both' }}
        />

        {/* CW text */}
        <g style={{ animation: 'eco-scale-in 0.5s 0.6s ease-out both' }}>
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fillOpacity="0.95"
            fontSize="22" fontWeight="800" fontFamily="inherit" letterSpacing="2">
            CW
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="white" fillOpacity="0.35"
            fontSize="9" fontWeight="600" fontFamily="inherit" letterSpacing="1">
            PHARMACY
          </text>
        </g>

        {/* ── Journey stages — inner ring ── */}
        {journeyStages.map((stage, i) => {
          const rad = (stage.angle * Math.PI) / 180
          const sx = cx + journeyR * Math.cos(rad)
          const sy = cy + journeyR * Math.sin(rad)
          const connX = cx + (cwR + 4) * Math.cos(rad)
          const connY = cy + (cwR + 4) * Math.sin(rad)
          const delay = 1.0 + i * 0.25

          return (
            <g key={stage.label} style={{ animation: `hero-fade-in 0.5s ${delay}s ease-out both` }}>
              {/* Connector line */}
              <line x1={connX} y1={connY} x2={sx - 12 * Math.cos(rad)} y2={sy - 12 * Math.sin(rad)}
                stroke="white" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="2 3" />
              {/* Stage circle */}
              <circle cx={sx} cy={sy} r={18} fill="white" fillOpacity="0.06"
                stroke="white" strokeWidth="0.8" strokeOpacity="0.15" />
              {/* Icon */}
              <foreignObject x={sx - 8} y={sy - 13} width={16} height={16}>
                <stage.Icon style={{ width: 13, height: 13, margin: '1.5px', color: 'white', opacity: 0.55 }} />
              </foreignObject>
              {/* Label */}
              <text x={sx} y={sy + 12} textAnchor="middle" fill="white" fillOpacity="0.45"
                fontSize="8" fontWeight="600" fontFamily="inherit">
                {stage.label}
              </text>
              {/* Step number badge */}
              <circle cx={sx + 14} cy={sy - 14} r={6} fill="white" fillOpacity="0.1" />
              <text x={sx + 14} y={sy - 11} textAnchor="middle" fill="white" fillOpacity="0.4"
                fontSize="7" fontWeight="700" fontFamily="inherit">
                {stage.step}
              </text>
            </g>
          )
        })}

        {/* ── Arrow arc between journey stages ── */}
        <path
          d={`M ${cx + journeyR * Math.cos((-70 * Math.PI) / 180) + 20} ${cy + journeyR * Math.sin((-70 * Math.PI) / 180)}
              A ${journeyR} ${journeyR} 0 0 1
              ${cx + journeyR * Math.cos((80 * Math.PI) / 180)} ${cy + journeyR * Math.sin((80 * Math.PI) / 180) - 20}`}
          stroke="white" strokeWidth="0.6" strokeOpacity="0.08" strokeDasharray="4 3"
          fill="none"
          style={{ animation: 'eco-ring-draw 2s 1.2s ease-out both' }}
        />

        {/* ── Competitor nodes ── */}
        {competitors.map((comp, i) => {
          const rad = (comp.angle * Math.PI) / 180
          const nx = cx + outerR * Math.cos(rad)
          const ny = cy + outerR * Math.sin(rad)
          const lx = cx + (outerR + 30) * Math.cos(rad)
          const ly = cy + (outerR + 30) * Math.sin(rad)
          // Smart label anchoring based on position
          const isLeft = comp.angle > 100 || comp.angle < -100
          const isTop = comp.angle < -50 && comp.angle > -130
          const isBottom = comp.angle > 50 && comp.angle < 130
          const anchor = isTop || isBottom ? 'middle' : isLeft ? 'end' : 'start'
          const delay = 2.2 + i * 0.12

          return (
            <g key={comp.name} style={{ animation: `hero-fade-in 0.5s ${delay}s ease-out both` }}>
              {/* Glow behind node */}
              <circle cx={nx} cy={ny} r={22} fill={comp.color} fillOpacity="0.06" />
              {/* Node */}
              <circle cx={nx} cy={ny} r={18} fill={comp.color} fillOpacity="0.12"
                stroke={comp.color} strokeWidth="1.2" strokeOpacity="0.45" />
              {/* Icon */}
              <foreignObject x={nx - 9} y={ny - 9} width={18} height={18}>
                <comp.Icon style={{ width: 14, height: 14, margin: '2px', color: comp.color, opacity: 0.85 }} />
              </foreignObject>
              {/* Label + share % */}
              <text x={lx} y={ly} textAnchor={anchor} fill="white" fillOpacity="0.55"
                fontSize="9.5" fontWeight="600" fontFamily="inherit">
                {comp.name}
              </text>
              <text x={lx} y={ly + 13} textAnchor={anchor} fill={comp.color}
                fontSize="8" fontWeight="700" fontFamily="inherit" opacity="0.65">
                {comp.share} of spend
              </text>
            </g>
          )
        })}

        {/* ── "Where spend leaks" annotation ── */}
        <g style={{ animation: 'hero-fade-in 0.8s 3.2s ease-out both' }}>
          <rect x={cx - 80} y={cy + outerR + 26} width={160} height={24} rx={12}
            fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
          <text x={cx} y={cy + outerR + 42} textAnchor="middle" fill="white" fillOpacity="0.4"
            fontSize="8.5" fontWeight="500" fontFamily="inherit">
            72% of pharmacy spend leaks
          </text>
        </g>
      </svg>
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
        {/* Subtle background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />
          <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-3xl" />
          <DataParticles />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full px-10 xl:px-14 py-8">
          {/* Top: logo + Shopper360 product name */}
          <div style={{ animation: 'hero-fade-in 0.8s ease-out both' }}>
            <img src={livery.logoWhite} alt={livery.name} className="h-11 object-contain object-left" />
            <p className="mt-2 text-[22px] xl:text-[26px] font-extrabold tracking-tight text-white/90 leading-none">
              Shopper<span className="text-white/50">360</span>
            </p>
            <p className="text-[10px] text-white/30 mt-1 tracking-wide">Shopper Intelligence Platform</p>
          </div>

          {/* Center: stats + ecosystem */}
          <div className="flex items-center gap-6 xl:gap-10 flex-1 py-4">
            {/* Left column — bigger stats */}
            <div className="w-[280px] xl:w-[320px] shrink-0">
              {livery.heroFeatureStat && (
                <div className="mb-6" style={{ animation: 'hero-number-in 1s 0.2s ease-out both' }}>
                  <p className="text-7xl xl:text-8xl font-extrabold tracking-tighter leading-none mb-2 text-white">
                    {livery.heroFeatureStat.value}
                  </p>
                  <p className="text-white/50 text-sm xl:text-base max-w-[280px] leading-relaxed">
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
              <p className="text-white/35 text-sm max-w-[280px] mb-8 leading-relaxed" style={{ animation: 'hero-fade-in 0.8s 0.6s ease-out both' }}>
                {livery.heroSubtext}
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-[300px]" style={{ animation: 'hero-fade-in 0.8s 0.9s ease-out both' }}>
                {livery.heroStats.map((stat, idx) => (
                  <div key={stat.label}
                    className="bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3.5 hover:bg-white/[0.12] transition-colors"
                    style={{ animation: `hero-fade-in 0.6s ${1.0 + idx * 0.12}s ease-out both` }}>
                    <p className="text-2xl xl:text-[26px] font-bold tracking-tight text-white leading-none">{stat.value}</p>
                    <p className="text-[10px] xl:text-[11px] text-white/40 mt-1.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Big Shopper Ecosystem — the hero */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <ShopperEcosystem />
            </div>
          </div>

          {/* Bottom — more readable footer */}
          <div className="flex items-center gap-3" style={{ animation: 'hero-fade-in 0.8s 3.5s ease-out both' }}>
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-white/10" />
            <p className="text-[11px] text-white/45 font-medium tracking-wide">
              Powered by <span className="text-white/65 font-semibold">{livery.poweredBy}</span>
              <span className="text-white/25 mx-2">·</span>
              CBA credit card transaction intelligence
              <span className="text-white/25 mx-2">·</span>
              {new Date().getFullYear()}
            </p>
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-white/10" />
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
