import { useMemo, useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PieChart as PieIcon, Target, DollarSign, TrendingUp, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrency, formatNumber, formatPercentRaw, formatCompact } from '../../lib/formatters'
import type { Segment } from '../../data/types'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']
const SEGMENTS: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']

/* ------------------------------------------------------------------ */
/*  Segment drill-in detail panel                                      */
/* ------------------------------------------------------------------ */
interface SegmentDetail {
  segment: Segment
  topCategories: { name: string; pct: number }[]
  lifeStages: { name: string; pct: number }[]
  avgSoW: number
  healthConsciousPct: number
  channelSplit: { online: number; inStore: number }
}

function SegmentDetailCard({ detail, color }: { detail: SegmentDetail; color: string }) {
  return (
    <div className="bg-white rounded-xl border-2 p-4 sm:p-6 animate-fade-in-up" style={{ borderColor: color }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="text-base font-bold text-slate-800">{detail.segment} &mdash; Deep Dive</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Categories */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Categories</p>
          <ul className="space-y-1.5">
            {detail.topCategories.map((c) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{c.name}</span>
                <span className="text-slate-500 font-medium">{c.pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Life Stages */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Life Stages</p>
          <ul className="space-y-1.5">
            {detail.lifeStages.map((l) => (
              <li key={l.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{l.name}</span>
                <span className="text-slate-500 font-medium">{l.pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Share of Wallet + Health Conscious */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Metrics</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Avg Share of Wallet</span>
              <span className="font-bold text-slate-800">{detail.avgSoW.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Health Conscious</span>
              <span className="font-bold text-slate-800">{detail.healthConsciousPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Channel Split */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Channel Split</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-0.5">
                <span className="text-slate-600">In-Store</span>
                <span className="font-medium text-slate-700">{detail.channelSplit.inStore.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${detail.channelSplit.inStore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-0.5">
                <span className="text-slate-600">Online</span>
                <span className="font-medium text-slate-700">{detail.channelSplit.online.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${detail.channelSplit.online}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chart tooltip helper                                               */
/* ------------------------------------------------------------------ */
function ChartExplainer({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 mt-1 mb-3">
      <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export function SegmentsPage() {
  const { state, networkScale } = useData()

  // Helper: scale a sample count to network level
  const scaleN = useCallback((n: number) => Math.round(n * networkScale), [networkScale])

  const [expandedSegment, setExpandedSegment] = useState<Segment | null>(null)

  /* ---- Segment stats (raw sample) ---- */
  const segmentStats = useMemo(() => {
    const stats = SEGMENTS.map((seg) => {
      const customers = state.customers.filter((c) => c.segment === seg)
      const count = customers.length
      const avgBasket = count > 0 ? customers.reduce((s, c) => s + c.avgBasketValue, 0) / count : 0
      const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
      const avgRetention = count > 0 ? customers.reduce((s, c) => s + c.retentionScore, 0) / count : 0
      const avgVisits = count > 0 ? customers.reduce((s, c) => s + c.totalVisits, 0) / count : 0
      return { segment: seg, count, avgBasket, totalSpend, avgRetention, avgVisits }
    })
    return stats
  }, [state.customers])

  /* ---- Pie data scaled to network ---- */
  const pieData = useMemo(() =>
    segmentStats.map((s) => ({ name: s.segment, value: scaleN(s.count) })),
    [segmentStats, scaleN],
  )

  const revenuePie = useMemo(() =>
    segmentStats.map((s) => ({ name: s.segment, value: Math.round(s.totalSpend * networkScale) })),
    [segmentStats, networkScale],
  )

  const retentionBySegment = useMemo(() =>
    segmentStats.map((s) => ({
      segment: s.segment.length > 12 ? s.segment.slice(0, 12) + '...' : s.segment,
      fullName: s.segment,
      retention: Math.round(s.avgRetention),
    })),
    [segmentStats],
  )

  /* ---- Scaled KPI headline numbers ---- */
  const totalCustomers = scaleN(state.customers.length)
  const powerRatio = scaleN(segmentStats.find((s) => s.segment === 'Power Shoppers')?.count ?? 0)
  const atRiskCount = scaleN(segmentStats.find((s) => s.segment === 'At-Risk')?.count ?? 0)
  const totalSpendScaled = segmentStats.reduce((s, seg) => s + seg.totalSpend, 0) * networkScale

  /* ---- Drill-in detail for expanded segment ---- */
  const segmentDetail = useMemo<SegmentDetail | null>(() => {
    if (!expandedSegment) return null
    const customers = state.customers.filter((c) => c.segment === expandedSegment)
    const count = customers.length
    if (count === 0) return null

    // Top categories (count how often each topCategory appears)
    const catCounts: Record<string, number> = {}
    customers.forEach((c) => {
      catCounts[c.topCategory] = (catCounts[c.topCategory] || 0) + 1
    })
    const topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cnt]) => ({ name, pct: (cnt / count) * 100 }))

    // Life stages
    const lifeStageCounts: Record<string, number> = {}
    customers.forEach((c) => {
      if (c.lifeStage) lifeStageCounts[c.lifeStage] = (lifeStageCounts[c.lifeStage] || 0) + 1
    })
    const lifeStages = Object.entries(lifeStageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cnt]) => ({ name, pct: (cnt / count) * 100 }))

    // Average Share of Wallet
    const avgSoW = customers.reduce((s, c) => s + c.shareOfWallet, 0) / count * 100

    // Health conscious %
    const healthCount = customers.filter((c) => c.healthConscious === 'Yes' || c.healthConscious === 'Y').length
    const healthConsciousPct = (healthCount / count) * 100

    // Channel split
    const totalOnline = customers.reduce((s, c) => s + c.onlineOrders, 0)
    const totalInStore = customers.reduce((s, c) => s + c.inStoreVisits, 0)
    const totalOrders = totalOnline + totalInStore
    const channelSplit = totalOrders > 0
      ? { online: (totalOnline / totalOrders) * 100, inStore: (totalInStore / totalOrders) * 100 }
      : { online: 0, inStore: 100 }

    return { segment: expandedSegment, topCategories, lifeStages, avgSoW, healthConsciousPct, channelSplit }
  }, [expandedSegment, state.customers])

  /* ---- Auto-narrative ---- */
  const narrative = useMemo(() => {
    const power = segmentStats.find((s) => s.segment === 'Power Shoppers')
    const atRisk = segmentStats.find((s) => s.segment === 'At-Risk')
    const total = state.customers.length

    if (!power || !atRisk || total === 0) return ''

    const powerPct = ((power.count / total) * 100).toFixed(1)
    const powerSpendPct = segmentStats.reduce((s, seg) => s + seg.totalSpend, 0) > 0
      ? ((power.totalSpend / segmentStats.reduce((s, seg) => s + seg.totalSpend, 0)) * 100).toFixed(1)
      : '0'
    const atRiskPct = ((atRisk.count / total) * 100).toFixed(1)
    const highestRetSeg = [...segmentStats].sort((a, b) => b.avgRetention - a.avgRetention)[0]
    const lowestRetSeg = [...segmentStats].sort((a, b) => a.avgRetention - b.avgRetention)[0]

    const lines: string[] = []
    lines.push(
      `Power Shoppers represent ${powerPct}% of the ${formatCompact(totalCustomers)} CW network customers but contribute ${powerSpendPct}% of total revenue, making them the highest-value cohort.`,
    )
    lines.push(
      `At-Risk customers account for ${atRiskPct}% of the base (${formatCompact(atRiskCount)} customers) and require targeted re-engagement campaigns to prevent churn.`,
    )
    lines.push(
      `${highestRetSeg?.segment ?? 'Top segment'} lead on retention (${highestRetSeg?.avgRetention.toFixed(0) ?? '—'}% avg score), while ${lowestRetSeg?.segment ?? 'Bottom segment'} trail at ${lowestRetSeg?.avgRetention.toFixed(0) ?? '—'}% \u2014 signalling an opportunity for loyalty interventions.`,
    )

    return lines.join(' ')
  }, [segmentStats, state.customers.length, totalCustomers, atRiskCount])

  /* ---- Pie click handler ---- */
  const handlePieClick = useCallback((_: unknown, index: number) => {
    const clickedSegment = SEGMENTS[index]
    setExpandedSegment((prev) => (prev === clickedSegment ? null : clickedSegment ?? null))
  }, [])

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Segments</h1>
        <p className="text-sm text-slate-500 mt-1">Customer segmentation analysis and targeting.</p>
        <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
          Segments are derived from CBA credit-card transaction data across the Chemist Warehouse network.
          Customers are classified into five behavioural groups based on visit frequency, basket value,
          recency, and retention score. All counts shown are projected to the full CW loyalty network
          ({formatCompact(totalCustomers)} customers) using a statistically representative sample.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard
          title="Total Customers"
          value={formatCompact(totalCustomers)}
          icon={<PieIcon className="w-4 h-4" />}
        />
        <KPICard
          title="Power Shoppers"
          value={`${formatCompact(powerRatio)} (${totalCustomers > 0 ? ((powerRatio / totalCustomers) * 100).toFixed(1) : '0'}%)`}
          icon={<Target className="w-4 h-4" />}
        />
        <KPICard
          title="At-Risk Customers"
          value={`${formatCompact(atRiskCount)} (${totalCustomers > 0 ? ((atRiskCount / totalCustomers) * 100).toFixed(1) : '0'}%)`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          title="Total Customer Spend"
          value={formatCurrency(totalSpendScaled)}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      {/* Auto-Narrative */}
      {narrative && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 animate-fade-in-up">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Key Insights</p>
              <p className="text-sm text-slate-700 leading-relaxed">{narrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Count Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700">Customers by Segment</h3>
          <ChartExplainer text="Proportional split of the CW network customer base across five behavioural segments. Click a slice to drill into segment details below." />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                animationDuration={1000}
                animationBegin={200}
                onClick={handlePieClick}
                cursor="pointer"
              >
                {pieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i]}
                    stroke={expandedSegment === SEGMENTS[i] ? '#1e293b' : undefined}
                    strokeWidth={expandedSegment === SEGMENTS[i] ? 3 : 0}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Segment */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700">Revenue by Segment</h3>
          <ChartExplainer text="Total projected revenue contribution from each customer segment across the CW network, scaled from sample transaction data." />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenuePie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                animationDuration={1000}
                animationBegin={400}
                onClick={handlePieClick}
                cursor="pointer"
              >
                {revenuePie.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i]}
                    stroke={expandedSegment === SEGMENTS[i] ? '#1e293b' : undefined}
                    strokeWidth={expandedSegment === SEGMENTS[i] ? 3 : 0}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Drill-in Detail Card */}
        {segmentDetail && (
          <div className="lg:col-span-2">
            <SegmentDetailCard
              detail={segmentDetail}
              color={PIE_COLORS[SEGMENTS.indexOf(segmentDetail.segment)] ?? '#3B82F6'}
            />
          </div>
        )}

        {/* Retention by Segment */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Avg Retention Score by Segment</h3>
          <ChartExplainer text="Average retention score (0-100) for each segment, calculated from visit recency, frequency, and engagement patterns. Higher scores indicate stronger loyalty." />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={retentionBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Retention Score']}
                labelFormatter={(label: string) => {
                  const match = retentionBySegment.find((r) => r.segment === label)
                  return match?.fullName || label
                }}
              />
              <Bar dataKey="retention" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out">
                {retentionBySegment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Details Table -- mobile-responsive with horizontal scroll */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Segment Summary</h3>
          <span className="text-[10px] text-slate-400 sm:hidden">Scroll horizontally for more</span>
        </div>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Segment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Customers</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">% of Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Basket</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total Spend</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Visits</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Retention</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {segmentStats.map((s) => {
                const scaledCount = scaleN(s.count)
                const scaledSpend = s.totalSpend * networkScale
                const isExpanded = expandedSegment === s.segment
                return (
                  <tr
                    key={s.segment}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedSegment(isExpanded ? null : s.segment)}
                  >
                    <td className="px-4 py-2.5"><SegmentBadge segment={s.segment} /></td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{formatNumber(scaledCount)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">
                      {totalCustomers > 0 ? ((scaledCount / totalCustomers) * 100).toFixed(1) : '0'}%
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(s.avgBasket)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(scaledSpend)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{s.avgVisits.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{formatPercentRaw(s.avgRetention)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 inline" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
