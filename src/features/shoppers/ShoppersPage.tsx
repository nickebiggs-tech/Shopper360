import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  ShieldCheck, Baby, Users, Home, Heart, Sparkles, UserCircle,
  ChevronDown, ChevronUp, ShoppingCart, Wallet, HeartPulse, Eye,
  Download,
} from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrencyDecimal, formatNumber } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Customer, Segment } from '../../data/types'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899']
const CHANNEL_COLORS = ['#0A8BA8', '#10B39B', '#F59E0B']

const LIFE_STAGE_CONFIG: Record<string, { icon: typeof Baby; color: string; gradient: string }> = {
  'Young Adult': { icon: Sparkles, color: '#8B5CF6', gradient: 'from-violet-50 to-violet-100/30' },
  'Young Family': { icon: Baby, color: '#EC4899', gradient: 'from-pink-50 to-pink-100/30' },
  'Established Family': { icon: Users, color: '#3B82F6', gradient: 'from-blue-50 to-blue-100/30' },
  'Empty Nester': { icon: Home, color: '#F59E0B', gradient: 'from-amber-50 to-amber-100/30' },
  'Retiree': { icon: Heart, color: '#EF4444', gradient: 'from-red-50 to-red-100/30' },
  'Mature Singles': { icon: UserCircle, color: '#10B981', gradient: 'from-emerald-50 to-emerald-100/30' },
}

const DEFAULT_STAGE = { icon: UserCircle, color: '#64748b', gradient: 'from-slate-50 to-slate-100/30' }

interface PersonaGroup {
  lifeStage: string
  count: number
  avgBasket: number
  avgVisits: number
  avgRetention: number
  avgSoW: number
  healthPct: number
  topSegment: Segment
  topChannel: string
  topCrossShop: string
  channelBreakdown: { name: string; value: number; pct: string }[]
  segmentBreakdown: { name: string; value: number; pct: string }[]
  topCategory: string
  narrative: string
}

export function ShoppersPage() {
  const { state } = useData()
  const [segmentFilter, setSegmentFilter] = useState<string>('all')
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null)

  const baseCustomers = useMemo(() => {
    if (segmentFilter === 'all') return state.customers
    return state.customers.filter((c) => c.segment === segmentFilter)
  }, [state.customers, segmentFilter])

  // Build persona groups by life stage
  const personas = useMemo<PersonaGroup[]>(() => {
    const groups: Record<string, Customer[]> = {}
    baseCustomers.forEach((c) => {
      if (!groups[c.lifeStage]) groups[c.lifeStage] = []
      groups[c.lifeStage]!.push(c)
    })

    return Object.entries(groups)
      .map(([lifeStage, custs]) => {
        const count = custs.length
        const avgBasket = custs.reduce((s, c) => s + c.avgBasketValue, 0) / count
        const avgVisits = custs.reduce((s, c) => s + c.totalVisits, 0) / count
        const avgRetention = custs.reduce((s, c) => s + c.retentionScore, 0) / count
        const avgSoW = custs.reduce((s, c) => s + c.shareOfWallet, 0) / count
        const healthPct = (custs.filter((c) => c.healthConscious === 'Y').length / count) * 100

        // Top segment
        const segCounts: Record<string, number> = {}
        custs.forEach((c) => { segCounts[c.segment] = (segCounts[c.segment] || 0) + 1 })
        const topSegment = Object.entries(segCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Segment || 'Regular Shoppers'

        // Segment breakdown
        const segmentOrder: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']
        const segmentBreakdown = segmentOrder.map((seg) => ({
          name: seg,
          value: segCounts[seg] || 0,
          pct: (((segCounts[seg] || 0) / count) * 100).toFixed(0),
        }))

        // Top channel
        const chCounts: Record<string, number> = {}
        custs.forEach((c) => { chCounts[c.preferredChannel] = (chCounts[c.preferredChannel] || 0) + 1 })
        const topChannel = Object.entries(chCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'In-Store'

        // Channel breakdown
        const channelBreakdown = ['In-Store', 'Online', 'Click & Collect'].map((ch) => ({
          name: ch,
          value: chCounts[ch] || 0,
          pct: (((chCounts[ch] || 0) / count) * 100).toFixed(0),
        }))

        // Top cross-shop
        const csCounts: Record<string, number> = {}
        custs.forEach((c) => {
          if (c.crossShopRetailer && c.crossShopRetailer !== 'None') {
            csCounts[c.crossShopRetailer] = (csCounts[c.crossShopRetailer] || 0) + 1
          }
        })
        const topCrossShop = Object.entries(csCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

        // Top category
        const catCounts: Record<string, number> = {}
        custs.forEach((c) => { catCounts[c.topCategory] = (catCounts[c.topCategory] || 0) + 1 })
        const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

        // Auto-narrative
        const narrative = buildNarrative(lifeStage, count, avgBasket, avgSoW, healthPct, topChannel, topCrossShop, avgRetention, topSegment, topCategory)

        return {
          lifeStage, count, avgBasket, avgVisits, avgRetention, avgSoW, healthPct,
          topSegment, topChannel, topCrossShop, channelBreakdown, segmentBreakdown,
          topCategory, narrative,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [baseCustomers])

  // Network-level summary
  const summary = useMemo(() => {
    const count = baseCustomers.length
    if (count === 0) return { count: 0, avgBasket: 0, avgSoW: 0, avgRetention: 0 }
    return {
      count,
      avgBasket: baseCustomers.reduce((s, c) => s + c.avgBasketValue, 0) / count,
      avgSoW: baseCustomers.reduce((s, c) => s + c.shareOfWallet, 0) / count,
      avgRetention: baseCustomers.reduce((s, c) => s + c.retentionScore, 0) / count,
    }
  }, [baseCustomers])

  const handleExport = () => {
    const headers = ['Life Stage', 'Count', 'Avg Basket', 'Avg Visits', 'Retention', 'Share of Wallet', 'Health %', 'Top Segment', 'Top Channel', 'Top Cross-Shop', 'Top Category']
    const rows = personas.map((p) =>
      [p.lifeStage, p.count, p.avgBasket.toFixed(2), p.avgVisits.toFixed(1), p.avgRetention.toFixed(0), p.avgSoW.toFixed(0), p.healthPct.toFixed(0), p.topSegment, p.topChannel, p.topCrossShop, p.topCategory].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Shopper360_Personas_Export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shopper Personas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated persona profiles across the CW network — {formatNumber(summary.count)} shoppers
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">De-identified</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKPI icon={<Users className="w-4 h-4" />} label="Total Shoppers" value={formatNumber(summary.count)} />
        <MiniKPI icon={<ShoppingCart className="w-4 h-4" />} label="Avg Basket" value={formatCurrencyDecimal(summary.avgBasket)} />
        <MiniKPI icon={<Wallet className="w-4 h-4" />} label="Avg Share of Wallet" value={`${summary.avgSoW.toFixed(0)}%`} />
        <MiniKPI icon={<HeartPulse className="w-4 h-4" />} label="Avg Retention" value={`${summary.avgRetention.toFixed(0)}`} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All Segments</option>
          <option value="Power Shoppers">Power Shoppers</option>
          <option value="Regular Shoppers">Regular Shoppers</option>
          <option value="Occasional Visitors">Occasional Visitors</option>
          <option value="New Customers">New Customers</option>
          <option value="At-Risk">At-Risk</option>
        </select>
        <span className="text-xs text-slate-400">{personas.length} persona groups</span>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona, idx) => {
          const config = LIFE_STAGE_CONFIG[persona.lifeStage] || DEFAULT_STAGE
          const Icon = config.icon
          const isExpanded = expandedPersona === persona.lifeStage

          return (
            <div
              key={persona.lifeStage}
              className={cn(
                'bg-gradient-to-br border rounded-xl overflow-hidden chart-card animate-fade-in-up transition-all',
                config.gradient,
                isExpanded ? 'border-primary/30 sm:col-span-2 lg:col-span-3' : 'border-slate-200',
              )}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedPersona(isExpanded ? null : persona.lifeStage)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/30 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: config.color + '18' }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{persona.lifeStage}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{formatNumber(persona.count)} shoppers</span>
                    <SegmentBadge segment={persona.topSegment} className="text-[9px] px-1.5" />
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold" style={{ color: config.color }}>{formatCurrencyDecimal(persona.avgBasket)}</p>
                  <p className="text-[10px] text-slate-400">avg basket</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-4 gap-px bg-white/60 mx-4 mb-3 rounded-lg overflow-hidden border border-white/80">
                <MetricCell label="Visits" value={persona.avgVisits.toFixed(1)} />
                <MetricCell label="Retention" value={`${persona.avgRetention.toFixed(0)}`} />
                <MetricCell label="SoW" value={`${persona.avgSoW.toFixed(0)}%`} />
                <MetricCell label="Health" value={`${persona.healthPct.toFixed(0)}%`} />
              </div>

              {/* Quick Insights */}
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-white/70 rounded-full text-[10px] text-slate-600 border border-white">
                    {persona.topChannel}
                  </span>
                  {persona.topCrossShop !== 'None' && (
                    <span className="px-2 py-0.5 bg-red-50/70 rounded-full text-[10px] text-red-600 border border-red-100">
                      Cross-shops: {persona.topCrossShop}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-white/70 rounded-full text-[10px] text-slate-600 border border-white">
                    {persona.topCategory}
                  </span>
                </div>
              </div>

              {/* Auto-narrative */}
              <div className="mx-4 mb-4 bg-white/60 rounded-lg p-3 border border-white/80">
                <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: persona.narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-white/50 bg-white/40 p-4 animate-fade-in space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Segment Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Segment Mix</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={persona.segmentBreakdown} layout="vertical" margin={{ left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={90} />
                          <Tooltip formatter={(v: number) => [formatNumber(v), 'Shoppers']} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={600}>
                            {persona.segmentBreakdown.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Channel Donut */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Channel Preference</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={persona.channelBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                            cornerRadius={3}
                            animationDuration={600}
                            label={({ name, pct }) => `${name} (${pct}%)`}
                          >
                            {persona.channelBreakdown.map((_, i) => (
                              <Cell key={i} fill={CHANNEL_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [formatNumber(v), 'Shoppers']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Quick Facts */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
                      <h4 className="text-xs font-semibold text-slate-700 mb-3">Quick Facts</h4>
                      <div className="space-y-2.5">
                        <FactRow icon={<Eye className="w-3 h-3" />} label="Top Category" value={persona.topCategory} />
                        <FactRow icon={<ShoppingCart className="w-3 h-3" />} label="Avg Basket" value={formatCurrencyDecimal(persona.avgBasket)} />
                        <FactRow icon={<Users className="w-3 h-3" />} label="Avg Visits" value={persona.avgVisits.toFixed(1)} />
                        <FactRow icon={<HeartPulse className="w-3 h-3" />} label="Health Conscious" value={`${persona.healthPct.toFixed(0)}%`} />
                        <FactRow icon={<Wallet className="w-3 h-3" />} label="Share of Wallet" value={`${persona.avgSoW.toFixed(0)}%`} />
                        <FactRow icon={<Heart className="w-3 h-3" />} label="Retention Score" value={`${persona.avgRetention.toFixed(0)}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MiniKPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-2 py-2 text-center">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-xs font-bold text-slate-800">{value}</p>
    </div>
  )
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-slate-400">{icon}</div>
      <span className="text-[10px] text-slate-500 flex-1">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function buildNarrative(
  lifeStage: string, count: number, avgBasket: number, avgSoW: number,
  healthPct: number, _topChannel: string, topCrossShop: string,
  _avgRetention: number, _topSegment: Segment, _topCategory: string,
): string {
  const parts: string[] = []

  parts.push(`**${lifeStage}** shoppers represent **${formatNumber(count)}** across the CW network.`)

  if (avgBasket > 80) {
    parts.push(`Premium spenders with an avg basket of **${formatCurrencyDecimal(avgBasket)}** — high lifetime value.`)
  } else if (avgBasket > 55) {
    parts.push(`Moderate spenders averaging **${formatCurrencyDecimal(avgBasket)}** per visit — opportunity to grow basket.`)
  } else {
    parts.push(`Lighter spenders at **${formatCurrencyDecimal(avgBasket)}** avg basket — cross-sell and upsell opportunities.`)
  }

  if (avgSoW > 60) {
    parts.push(`Strong CW loyalty at **${avgSoW.toFixed(0)}%** share of wallet.`)
  } else if (avgSoW < 35) {
    parts.push(`Low loyalty (**${avgSoW.toFixed(0)}% SoW**) — high competitor leakage risk.`)
  }

  if (healthPct > 55) {
    parts.push(`**${healthPct.toFixed(0)}%** are health-conscious — ideal for vitamin, supplement & wellness promotions.`)
  }

  if (topCrossShop !== 'None') {
    parts.push(`Top cross-shopping risk is **${topCrossShop}**.`)
  }

  // Life-stage specific recommendations
  if (lifeStage === 'Young Family') {
    parts.push('Recommend targeting with baby care, children\'s health & family wellness ranges.')
  } else if (lifeStage === 'Retiree') {
    parts.push('Focus on prescription support, OTC pain relief, eye care & senior health.')
  } else if (lifeStage === 'Young Adult') {
    parts.push('Engage with beauty, skincare, sports nutrition & digital-first experiences.')
  } else if (lifeStage === 'Empty Nester') {
    parts.push('Premium wellness, travel health & anti-aging categories resonate strongly.')
  } else if (lifeStage === 'Established Family') {
    parts.push('Multi-category shoppers — basket builders through family health bundles.')
  } else if (lifeStage === 'Mature Singles') {
    parts.push('Self-care focused — personal care, supplements & convenience offerings.')
  }

  return parts.join(' ')
}
