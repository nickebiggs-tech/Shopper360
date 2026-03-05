import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, ShoppingCart, Wallet, HeartPulse, X, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatCurrencyDecimal, formatNumber } from '../../lib/formatters'
import { SegmentBadge } from './SegmentBadge'
import type { Customer, Segment } from '../../data/types'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']
const CHANNEL_COLORS = ['#0A8BA8', '#10B39B', '#F59E0B']

interface PersonaPanelProps {
  customers: Customer[]
  title?: string
  compact?: boolean
}

interface ActiveFilter {
  type: 'lifeStage' | 'segment' | 'channel' | null
  value: string | null
}

export function PersonaPanel({ customers, title, compact = false }: PersonaPanelProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: null, value: null })

  // Apply filter
  const filtered = useMemo(() => {
    if (!activeFilter.type || !activeFilter.value) return customers
    return customers.filter((c) => {
      switch (activeFilter.type) {
        case 'lifeStage': return c.lifeStage === activeFilter.value
        case 'segment': return c.segment === activeFilter.value
        case 'channel': return c.preferredChannel === activeFilter.value
        default: return true
      }
    })
  }, [customers, activeFilter])

  // Summary KPIs
  const kpis = useMemo(() => {
    const count = filtered.length
    if (count === 0) return { count: 0, avgBasket: 0, avgSoW: 0, healthPct: 0, avgVisits: 0, avgRetention: 0 }
    const avgBasket = filtered.reduce((s, c) => s + c.avgBasketValue, 0) / count
    const avgSoW = filtered.reduce((s, c) => s + c.shareOfWallet, 0) / count
    const healthCount = filtered.filter((c) => c.healthConscious === 'Y').length
    const avgVisits = filtered.reduce((s, c) => s + c.totalVisits, 0) / count
    const avgRetention = filtered.reduce((s, c) => s + c.retentionScore, 0) / count
    return { count, avgBasket, avgSoW, healthPct: (healthCount / count) * 100, avgVisits, avgRetention }
  }, [filtered])

  // Life Stage Distribution
  const lifeStageDist = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((c) => { counts[c.lifeStage] = (counts[c.lifeStage] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: ((value / filtered.length) * 100).toFixed(0) }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  // Segment Mix
  const segmentMix = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((c) => { counts[c.segment] = (counts[c.segment] || 0) + 1 })
    const order: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']
    return order.map((seg) => ({ name: seg, value: counts[seg] || 0, pct: (((counts[seg] || 0) / filtered.length) * 100).toFixed(0) }))
  }, [filtered])

  // Channel Preference
  const channelDist = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((c) => { counts[c.preferredChannel] = (counts[c.preferredChannel] || 0) + 1 })
    return ['In-Store', 'Online', 'Click & Collect']
      .map((ch) => ({ name: ch, value: counts[ch] || 0, pct: (((counts[ch] || 0) / filtered.length) * 100).toFixed(0) }))
  }, [filtered])

  // Cross-Shopping
  const crossShopDist = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((c) => {
      if (c.crossShopRetailer && c.crossShopRetailer !== 'None') {
        counts[c.crossShopRetailer] = (counts[c.crossShopRetailer] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: ((value / filtered.length) * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filtered])

  // Persona Archetypes: group by lifeStage × healthConscious
  const archetypes = useMemo(() => {
    const groups: Record<string, Customer[]> = {}
    filtered.forEach((c) => {
      const key = `${c.lifeStage}|${c.healthConscious === 'Y' ? 'Health-Conscious' : 'General'}`
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })

    return Object.entries(groups)
      .map(([key, custs]) => {
        const [lifeStage, healthLabel] = key.split('|')
        const avgBasket = custs.reduce((s, c) => s + c.avgBasketValue, 0) / custs.length
        const avgVisits = custs.reduce((s, c) => s + c.totalVisits, 0) / custs.length
        const inStorePct = (custs.filter((c) => c.preferredChannel === 'In-Store').length / custs.length) * 100
        const avgSoW = custs.reduce((s, c) => s + c.shareOfWallet, 0) / custs.length

        // Find dominant segment
        const segCounts: Record<string, number> = {}
        custs.forEach((c) => { segCounts[c.segment] = (segCounts[c.segment] || 0) + 1 })
        const dominantSeg = Object.entries(segCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Segment || 'Regular Shoppers'

        return {
          label: `${healthLabel} ${lifeStage}`,
          lifeStage: lifeStage!,
          healthLabel: healthLabel!,
          count: custs.length,
          avgBasket,
          avgVisits,
          inStorePct,
          avgSoW,
          dominantSeg,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [filtered])

  // Auto-narrative generation
  const narrative = useMemo(() => {
    if (filtered.length === 0) return ''
    const topLifeStage = lifeStageDist[0]
    const topSegment = segmentMix.reduce((a, b) => (b.value > a.value ? b : a), segmentMix[0]!)
    const topChannel = channelDist[0]
    const topCrossShop = crossShopDist[0]
    const healthPct = kpis.healthPct

    const parts: string[] = []

    // Context if filter active
    if (activeFilter.type && activeFilter.value) {
      parts.push(`**Filtered to ${activeFilter.value}** (${formatNumber(filtered.length)} shoppers):`)
    } else {
      parts.push(`Across **${formatNumber(filtered.length)} shoppers**:`)
    }

    // Life stage insight
    if (topLifeStage) {
      parts.push(`The dominant life stage is **${topLifeStage.name}** (${topLifeStage.pct}%), with an avg basket of **${formatCurrencyDecimal(kpis.avgBasket)}**.`)
    }

    // Segment insight
    if (topSegment) {
      parts.push(`**${topSegment.name}** are the largest segment at ${topSegment.pct}%.`)
    }

    // Channel
    if (topChannel && Number(topChannel.pct) > 0) {
      parts.push(`**${topChannel.pct}%** prefer ${topChannel.name.toLowerCase()} shopping.`)
    }

    // Health conscious
    if (healthPct > 50) {
      parts.push(`A strong **${healthPct.toFixed(0)}%** are health-conscious — ideal for vitamin & supplement promotions.`)
    } else if (healthPct > 35) {
      parts.push(`**${healthPct.toFixed(0)}%** are health-conscious — moderate wellness engagement.`)
    }

    // Cross-shopping risk
    if (topCrossShop) {
      parts.push(`Top cross-shopping risk: **${topCrossShop.name}** (${topCrossShop.pct}% of shoppers also shop there).`)
    }

    // Share of wallet opportunity
    if (kpis.avgSoW < 40) {
      parts.push(`Average share of wallet is only **${kpis.avgSoW.toFixed(0)}%** — significant opportunity to capture more spend.`)
    } else if (kpis.avgSoW > 60) {
      parts.push(`Strong loyalty with **${kpis.avgSoW.toFixed(0)}%** share of wallet — focus on retention.`)
    }

    return parts.join(' ')
  }, [filtered, lifeStageDist, segmentMix, channelDist, crossShopDist, kpis, activeFilter])

  const handleFilter = (type: ActiveFilter['type'], value: string) => {
    if (activeFilter.type === type && activeFilter.value === value) {
      setActiveFilter({ type: null, value: null })
    } else {
      setActiveFilter({ type, value })
    }
  }

  const chartHeight = compact ? 220 : 260

  return (
    <div className={cn('space-y-4', compact ? '' : 'space-y-5')}>
      {title && !compact && (
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      )}

      {/* Active filter pill */}
      {activeFilter.type && activeFilter.value && (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <Filter className="w-3 h-3" />
            Filtered: {activeFilter.value}
            <button onClick={() => setActiveFilter({ type: null, value: null })} className="hover:text-primary/70">
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-400">{formatNumber(filtered.length)} of {formatNumber(customers.length)} shoppers</span>
        </div>
      )}

      {/* Auto-narrative */}
      {narrative && (
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-3 sm:p-4 animate-fade-in">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      )}

      {/* KPI row */}
      <div className={cn('grid gap-3', compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')}>
        <MiniKPI icon={<Users className="w-3.5 h-3.5" />} label="Shoppers" value={formatNumber(kpis.count)} />
        <MiniKPI icon={<ShoppingCart className="w-3.5 h-3.5" />} label="Avg Basket" value={formatCurrencyDecimal(kpis.avgBasket)} />
        <MiniKPI icon={<Wallet className="w-3.5 h-3.5" />} label="Share of Wallet" value={`${kpis.avgSoW.toFixed(0)}%`} />
        <MiniKPI icon={<HeartPulse className="w-3.5 h-3.5" />} label="Health Conscious" value={`${kpis.healthPct.toFixed(0)}%`} />
        {!compact && (
          <>
            <MiniKPI icon={<ShoppingCart className="w-3.5 h-3.5" />} label="Avg Visits" value={kpis.avgVisits.toFixed(1)} />
            <MiniKPI icon={<HeartPulse className="w-3.5 h-3.5" />} label="Avg Retention" value={`${kpis.avgRetention.toFixed(0)}`} />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className={cn('grid gap-4', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2')}>
        {/* Life Stage Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 chart-card">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Life Stage Distribution</h4>
          <p className="text-[10px] text-slate-400 mb-2">Click a slice to drill down</p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={lifeStageDist}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 35 : 45}
                outerRadius={compact ? 65 : 80}
                paddingAngle={3}
                dataKey="value"
                cornerRadius={3}
                animationDuration={800}
                onClick={(_, idx) => handleFilter('lifeStage', lifeStageDist[idx]!.name)}
                style={{ cursor: 'pointer' }}
                label={compact ? false : ({ name, pct }) => `${name} (${pct}%)`}
              >
                {lifeStageDist.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    opacity={activeFilter.type === 'lifeStage' && activeFilter.value !== entry.name ? 0.3 : 1}
                    stroke={activeFilter.value === entry.name ? PIE_COLORS[i % PIE_COLORS.length] : 'transparent'}
                    strokeWidth={activeFilter.value === entry.name ? 3 : 0}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Shoppers']} />
              {compact && <Legend wrapperStyle={{ fontSize: 10 }} />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Mix Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 chart-card">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Segment Mix</h4>
          <p className="text-[10px] text-slate-400 mb-2">Click a bar to filter</p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={segmentMix} layout="vertical" margin={{ left: compact ? 0 : 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={compact ? 70 : 100} />
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Shoppers']} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                onClick={(data) => handleFilter('segment', data.name)}
                style={{ cursor: 'pointer' }}
              >
                {segmentMix.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[i]}
                    opacity={activeFilter.type === 'segment' && activeFilter.value !== entry.name ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 chart-card">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Channel Preference</h4>
          <p className="text-[10px] text-slate-400 mb-2">Click a slice to filter</p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={channelDist}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 40 : 50}
                outerRadius={compact ? 65 : 80}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={3}
                animationDuration={800}
                onClick={(_, idx) => handleFilter('channel', channelDist[idx]!.name)}
                style={{ cursor: 'pointer' }}
                label={({ name, pct }) => `${name} (${pct}%)`}
              >
                {channelDist.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={CHANNEL_COLORS[i]}
                    opacity={activeFilter.type === 'channel' && activeFilter.value !== entry.name ? 0.3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Shoppers']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cross-Shopping Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 chart-card">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Cross-Shopping Risk</h4>
          <p className="text-[10px] text-slate-400 mb-2">Where shoppers also transact</p>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={crossShopDist} layout="vertical" margin={{ left: compact ? 0 : 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={compact ? 80 : 110} />
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Shoppers']} />
              <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} animationDuration={800}>
                {crossShopDist.map((_, i) => (
                  <Cell key={i} fill={`hsl(${0 + i * 8}, 70%, ${55 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Persona Archetype Cards */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-3">
          {compact ? 'Top Personas' : 'Shopper Persona Archetypes'}
        </h4>
        <div className={cn('grid gap-3', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
          {archetypes.map((arch, idx) => (
            <div
              key={arch.label}
              className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 chart-card animate-fade-in-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{arch.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatNumber(arch.count)} shoppers</p>
                </div>
                <SegmentBadge segment={arch.dominantSeg} className="text-[9px] px-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p className="text-[10px] text-slate-500">Avg Basket</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrencyDecimal(arch.avgBasket)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">In-Store</p>
                  <p className="text-sm font-bold text-slate-800">{arch.inStorePct.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Avg Visits</p>
                  <p className="text-sm font-bold text-slate-800">{arch.avgVisits.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Share of Wallet</p>
                  <p className="text-sm font-bold text-slate-800">{arch.avgSoW.toFixed(0)}%</p>
                </div>
              </div>
              {/* Archetype narrative */}
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed border-t border-slate-100 pt-2">
                {generateArchetypeNarrative(arch)}
              </p>
            </div>
          ))}
        </div>
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

function generateArchetypeNarrative(arch: {
  label: string; lifeStage: string; healthLabel: string; count: number;
  avgBasket: number; avgVisits: number; inStorePct: number; avgSoW: number; dominantSeg: Segment;
}): string {
  const parts: string[] = []

  if (arch.avgBasket > 80) {
    parts.push('High-value shopper with premium basket size.')
  } else if (arch.avgBasket > 55) {
    parts.push('Moderate spender with room to grow basket.')
  } else {
    parts.push('Light spender — target with cross-sell offers.')
  }

  if (arch.avgSoW > 60) {
    parts.push('Strong CW loyalty.')
  } else if (arch.avgSoW < 30) {
    parts.push('Low loyalty — high competitor risk.')
  }

  if (arch.healthLabel === 'Health-Conscious') {
    parts.push('Responsive to wellness and vitamin promotions.')
  }

  if (arch.lifeStage === 'Young Family') {
    parts.push('Key for baby, personal care & health categories.')
  } else if (arch.lifeStage === 'Retiree') {
    parts.push('Focus on prescription, OTC & eye care.')
  } else if (arch.lifeStage === 'Young Adult') {
    parts.push('Target with beauty, skincare & sports nutrition.')
  } else if (arch.lifeStage === 'Empty Nester') {
    parts.push('Premium health & wellness buyer.')
  }

  if (arch.inStorePct > 80) {
    parts.push('Predominantly in-store shopper.')
  } else if (arch.inStorePct < 50) {
    parts.push('Digital-first — strong online engagement.')
  }

  return parts.join(' ')
}
