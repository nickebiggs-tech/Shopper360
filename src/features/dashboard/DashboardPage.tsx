import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import {
  Users, ShoppingCart, DollarSign, TrendingUp, UserPlus, Shield,
  Crown, Repeat, Eye, Sparkles, AlertTriangle, ChevronRight, X,
  PieChart as PieIcon,
} from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'
import { SEGMENT_DEFINITIONS } from '../../lib/constants'

// Refined palette: Blue, Indigo, Amber, Teal, Rose
const PIE_COLORS = ['#2563EB', '#7C3AED', '#D97706', '#0D9488', '#DC2626']

// Competitor share colors for SoW chart
const SOW_COLORS = ['#2563EB', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc']

const ANIM = { duration: 1200, easing: 'ease-out' as const }
const BAR_ANIM = { animationDuration: 800, animationEasing: 'ease-out' as const }

const SEGMENT_ICONS: Record<string, typeof Crown> = {
  'Power Shoppers': Crown,
  'Regular Shoppers': Repeat,
  'Occasional Visitors': Eye,
  'New Customers': Sparkles,
  'At-Risk': AlertTriangle,
}

const SEGMENT_ORDER = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk'] as const

export function DashboardPage() {
  const { state, selectedSummary, previousSummary, networkScale } = useData()
  const navigate = useNavigate()
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    state.customers.forEach((c) => {
      counts[c.segment] = (counts[c.segment] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [state.customers])

  // Segment stats for persona cards
  const segmentStats = useMemo(() => {
    const map: Record<string, { count: number; avgBasket: number; avgSoW: number; avgVisits: number; totalSpend: number; retention: number }> = {}
    state.customers.forEach((c) => {
      if (!map[c.segment]) map[c.segment] = { count: 0, avgBasket: 0, avgSoW: 0, avgVisits: 0, totalSpend: 0, retention: 0 }
      const s = map[c.segment]!
      s.count++
      s.avgBasket += c.avgBasketValue
      s.avgSoW += c.shareOfWallet
      s.avgVisits += c.totalVisits
      s.totalSpend += c.totalSpend
      s.retention += c.retentionScore
    })
    Object.values(map).forEach(s => {
      if (s.count) {
        s.avgBasket /= s.count
        s.avgSoW /= s.count
        s.avgVisits /= s.count
        s.retention /= s.count
      }
    })
    return map
  }, [state.customers])

  // Expanded segment drill-in data
  const expandedData = useMemo(() => {
    if (!expandedSegment) return null
    const customers = state.customers.filter(c => c.segment === expandedSegment)
    if (!customers.length) return null

    // Life stage distribution
    const lifeStages: Record<string, number> = {}
    customers.forEach(c => { lifeStages[c.lifeStage] = (lifeStages[c.lifeStage] || 0) + 1 })
    const lifeStageDist = Object.entries(lifeStages)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / customers.length) * 100) }))
      .sort((a, b) => b.value - a.value)

    // Channel split
    const channels: Record<string, number> = {}
    customers.forEach(c => { channels[c.preferredChannel] = (channels[c.preferredChannel] || 0) + 1 })
    const channelDist = Object.entries(channels)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / customers.length) * 100) }))
      .sort((a, b) => b.value - a.value)

    // Top categories
    const cats: Record<string, number> = {}
    customers.forEach(c => {
      cats[c.topCategory] = (cats[c.topCategory] || 0) + 1
      if (c.secondCategory) cats[c.secondCategory] = (cats[c.secondCategory] || 0) + 1
    })
    const topCats = Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Cross-shop retailers
    const retailers: Record<string, number> = {}
    customers.forEach(c => { if (c.crossShopRetailer) retailers[c.crossShopRetailer] = (retailers[c.crossShopRetailer] || 0) + 1 })
    const crossShop = Object.entries(retailers)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / customers.length) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return { lifeStageDist, channelDist, topCats, crossShop, count: customers.length }
  }, [expandedSegment, state.customers])

  // Share of Wallet computation
  const sowData = useMemo(() => {
    if (!state.customers.length) return null
    const avgSoW = state.customers.reduce((s, c) => s + c.shareOfWallet, 0) / state.customers.length
    const avgTotalSpend = state.customers.reduce((s, c) => s + c.totalPharmacySpend, 0) / state.customers.length
    const cwShare = avgSoW * 100
    const remainder = 100 - cwShare
    // Distribute remainder across competitors proportionally
    const competitorShares = [
      { name: 'Priceline', share: remainder * 0.28 },
      { name: 'Supermarkets', share: remainder * 0.25 },
      { name: 'Online / Direct', share: remainder * 0.22 },
      { name: 'Other Pharmacy', share: remainder * 0.25 },
    ]
    const pieData = [
      { name: 'Chemist Warehouse', value: Math.round(cwShare * 10) / 10 },
      ...competitorShares.map(c => ({ name: c.name, value: Math.round(c.share * 10) / 10 })),
    ]
    // SoW by segment
    const segSoW = SEGMENT_ORDER.map(seg => {
      const custs = state.customers.filter(c => c.segment === seg)
      const avg = custs.length ? custs.reduce((s, c) => s + c.shareOfWallet, 0) / custs.length : 0
      return { segment: seg, sow: Math.round(avg * 1000) / 10 }
    })
    return { pieData, avgSoW: cwShare, avgTotalSpend, segSoW }
  }, [state.customers])

  const trendData = useMemo(() =>
    state.summary.map((s) => ({
      month: format(s.periodMonth, 'MMM yy'),
      revenue: s.totalRevenue,
      basket: s.avgBasketValue,
      retention: s.retentionRate,
    })),
    [state.summary],
  )

  const segmentTrend = useMemo(() => {
    const months = [...new Set(state.segmentBreakdown.map(s => format(s.periodMonth, 'MMM yy')))]
    return months.map(month => {
      const row: Record<string, string | number> = { month }
      state.segmentBreakdown
        .filter(s => format(s.periodMonth, 'MMM yy') === month)
        .forEach(s => { row[s.segment] = s.customerCount })
      return row
    })
  }, [state.segmentBreakdown])

  const delta = (curr: number | undefined, prev: number | undefined) => {
    if (!curr || !prev || prev === 0) return undefined
    return ((curr - prev) / prev) * 100
  }

  const drillColors = ['#2563EB', '#7C3AED', '#D97706', '#0D9488', '#DC2626', '#DB2777']

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <div className="flex items-center gap-2 mb-0.5 sm:hidden">
          <span className="text-base font-extrabold tracking-tight"><span className="text-primary">Shopper</span><span className="text-primary/50">360</span></span>
          <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest border border-slate-200 rounded px-1.5 py-0.5">Dashboard</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
          CW network overview for {selectedSummary ? format(selectedSummary.periodMonth, 'MMMM yyyy') : 'current period'}
        </p>
      </div>

      {/* KPI Grid — staggered animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
        <KPICard
          title="Total Customers"
          value={formatNumber(selectedSummary?.totalCustomers ?? 0)}
          delta={delta(selectedSummary?.totalCustomers, previousSummary?.totalCustomers)}
          deltaLabel="vs last month"
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          title="Active Shoppers"
          value={formatNumber(selectedSummary?.activeCustomers ?? 0)}
          delta={delta(selectedSummary?.activeCustomers, previousSummary?.activeCustomers)}
          deltaLabel="vs last month"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KPICard
          title="Avg Basket"
          value={formatCurrency(selectedSummary?.avgBasketValue ?? 0)}
          delta={delta(selectedSummary?.avgBasketValue, previousSummary?.avgBasketValue)}
          deltaLabel="vs last month"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(selectedSummary?.totalRevenue ?? 0)}
          delta={delta(selectedSummary?.totalRevenue, previousSummary?.totalRevenue)}
          deltaLabel="vs last month"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          title="New Customers"
          value={formatNumber(selectedSummary?.newCustomers ?? 0)}
          delta={delta(selectedSummary?.newCustomers, previousSummary?.newCustomers)}
          deltaLabel="vs last month"
          icon={<UserPlus className="w-4 h-4" />}
        />
        <KPICard
          title="Retention Rate"
          value={formatPercentRaw(selectedSummary?.retentionRate ?? 0)}
          delta={selectedSummary && previousSummary ? selectedSummary.retentionRate - previousSummary.retentionRate : undefined}
          deltaLabel="pp change"
          icon={<Shield className="w-4 h-4" />}
        />
      </div>

      {/* Persona Cards — Clickable segment drill-in */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Shopper Personas</h2>
          <button
            onClick={() => navigate('/personas')}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            View all personas <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SEGMENT_ORDER.map((seg) => {
            const def = SEGMENT_DEFINITIONS[seg]
            if (!def) return null
            const stats = segmentStats[seg]
            const SegIcon = SEGMENT_ICONS[seg] ?? Crown
            const isExpanded = expandedSegment === seg
            const count = segmentCounts.find(s => s.name === seg)?.value ?? 0
            const totalCustomers = state.customers.length
            const pct = totalCustomers ? Math.round((count / totalCustomers) * 100) : 0

            return (
              <button
                key={seg}
                onClick={() => setExpandedSegment(isExpanded ? null : seg)}
                className={`relative bg-white rounded-xl border text-left transition-all duration-200 group overflow-hidden ${
                  isExpanded
                    ? 'border-slate-300 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
                style={isExpanded ? { boxShadow: `0 0 0 2px ${def.color}30` } : undefined}
              >
                {/* Color accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: def.color }} />
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: def.color + '15' }}
                    >
                      <SegIcon className="w-4 h-4" style={{ color: def.color }} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: def.color + '12', color: def.color }}>
                      {pct}%
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mb-0.5">{def.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-snug mb-2">{def.short}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    <div>
                      <span className="text-slate-400">Shoppers</span>
                      <p className="font-semibold text-slate-700">{formatNumber(Math.round(count * networkScale))}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg Basket</span>
                      <p className="font-semibold text-slate-700">{stats ? formatCurrency(stats.avgBasket) : '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">SoW</span>
                      <p className="font-semibold text-slate-700">{stats ? `${Math.round(stats.avgSoW * 100)}%` : '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Visits</span>
                      <p className="font-semibold text-slate-700">{stats ? `${stats.avgVisits.toFixed(1)}/yr` : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 italic">{isExpanded ? 'Click to collapse' : 'Click to drill in'}</span>
                    <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Expanded Drill-In Panel */}
        {expandedSegment && expandedData && SEGMENT_DEFINITIONS[expandedSegment] && (() => {
          const expDef = SEGMENT_DEFINITIONS[expandedSegment]!
          const ExpIcon = SEGMENT_ICONS[expandedSegment] ?? Crown
          return (
          <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100" style={{ backgroundColor: expDef.color + '08' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: expDef.color + '15' }}>
                  <ExpIcon className="w-4 h-4" style={{ color: expDef.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{expDef.title} — Deep Dive</h3>
                  <p className="text-xs text-slate-500">{formatNumber(Math.round(expandedData.count * networkScale))} shoppers across the CW network</p>
                </div>
              </div>
              <button onClick={() => setExpandedSegment(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Detail & Strategy */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-600 leading-relaxed mb-2">{expDef.detail}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  📊 {expDef.criteria}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: expDef.color }}>
                  🎯 {expDef.action}
                </span>
              </div>
            </div>

            {/* Drill-in Charts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5">
              {/* Life Stage */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Life Stage Mix</h4>
                <div className="space-y-1.5">
                  {expandedData.lifeStageDist.map((ls, i) => (
                    <div key={ls.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: drillColors[i % drillColors.length] }} />
                      <span className="text-[10px] text-slate-600 truncate flex-1">{ls.name}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ls.pct}%`, backgroundColor: drillColors[i % drillColors.length] }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 w-7 text-right">{ls.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Preference */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Channel Preference</h4>
                <div className="space-y-1.5">
                  {expandedData.channelDist.map((ch, i) => (
                    <div key={ch.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: drillColors[i % drillColors.length] }} />
                      <span className="text-[10px] text-slate-600 truncate flex-1">{ch.name}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ch.pct}%`, backgroundColor: drillColors[i % drillColors.length] }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 w-7 text-right">{ch.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Top Categories</h4>
                <div className="space-y-1.5">
                  {expandedData.topCats.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: drillColors[i % drillColors.length] }} />
                      <span className="text-[10px] text-slate-600 truncate flex-1">{cat.name}</span>
                      <span className="text-[10px] font-semibold text-slate-700">{formatNumber(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Shopping */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Cross-Shopping</h4>
                <div className="space-y-1.5">
                  {expandedData.crossShop.map((cs, i) => (
                    <div key={cs.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: drillColors[i % drillColors.length] }} />
                      <span className="text-[10px] text-slate-600 truncate flex-1">{cs.name}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${cs.pct}%`, backgroundColor: drillColors[i % drillColors.length] }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 w-7 text-right">{cs.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigate to full personas */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button
                onClick={() => navigate('/personas')}
                className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                Explore full persona view <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          )
        })()}
      </div>

      {/* Share of Wallet + Revenue Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Share of Wallet at CW */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Share of Wallet at CW</h3>
            <div className="flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">CBA Credit Card Insights</span>
            </div>
          </div>
          {sowData && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Donut */}
              <div className="flex-shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={sowData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      cornerRadius={3}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {sowData.pieData.map((_, i) => (
                        <Cell key={i} fill={SOW_COLORS[i % SOW_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="text-center -mt-[108px] mb-[42px] pointer-events-none">
                  <p className="text-lg font-bold text-slate-900">{sowData.avgSoW.toFixed(1)}%</p>
                  <p className="text-[9px] text-slate-400">CW Share</p>
                </div>
              </div>
              {/* Legend + Segment SoW */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1.5 mb-3">
                  {sowData.pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: SOW_COLORS[i] }} />
                      <span className="text-[10px] text-slate-600 flex-1 truncate">{d.name}</span>
                      <span className="text-[10px] font-bold text-slate-700">{d.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">CW Share by Segment</p>
                  {sowData.segSoW.map((s, i) => (
                    <div key={s.segment} className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-[10px] text-slate-600 flex-1 truncate">{s.segment}</span>
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.sow}%`, backgroundColor: PIE_COLORS[i] }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 w-8 text-right">{s.sow}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Trend — Area chart with gradient fill */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#revGradient)"
                dot={{ r: 4, fill: 'var(--color-chart-1)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={ANIM.duration}
                animationEasing={ANIM.easing}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Segment Pie — with animation */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={segmentCounts}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={4}
                animationDuration={1000}
                animationEasing="ease-out"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {segmentCounts.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Basket & Retention dual axis — gradient lines */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Basket Value & Retention</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left" type="monotone" dataKey="basket"
                stroke="var(--color-chart-1)" strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-chart-1)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Avg Basket ($)"
                animationDuration={ANIM.duration}
                animationEasing={ANIM.easing}
              />
              <Line
                yAxisId="right" type="monotone" dataKey="retention"
                stroke="var(--color-chart-2)" strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-chart-2)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Retention (%)"
                animationDuration={ANIM.duration}
                animationEasing={ANIM.easing}
                animationBegin={200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Segment Stacked Bar — animated bars */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Segment Distribution Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={segmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              {['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk'].map((seg, i) => (
                <Bar
                  key={seg}
                  dataKey={seg}
                  stackId="a"
                  fill={PIE_COLORS[i]}
                  radius={i === 4 ? [4, 4, 0, 0] : undefined}
                  {...BAR_ANIM}
                  animationBegin={i * 100}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SoW by Segment Bar Chart */}
        {sowData && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">CW Wallet Share by Segment</h3>
              <button
                onClick={() => navigate('/loyalty')}
                className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                Full leakage view <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sowData.segSoW} layout="vertical" margin={{ left: 110 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <YAxis dataKey="segment" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={105} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="sow" name="CW Share %" radius={[0, 4, 4, 0]} {...BAR_ANIM}>
                  {sowData.segSoW.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
