import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Heart, AlertTriangle, TrendingDown, ShieldCheck } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'
import type { Segment } from '../../data/types'

const LOYALTY_TIERS = [
  { label: 'Loyal (80+)', min: 80, max: 100, color: '#10B981', desc: 'Highly committed — shops almost exclusively here' },
  { label: 'Leaning (50-79)', min: 50, max: 79, color: '#3B82F6', desc: 'Prefers your pharmacy but shops elsewhere sometimes' },
  { label: 'Split (30-49)', min: 30, max: 49, color: '#F59E0B', desc: 'Splitting spend fairly evenly across pharmacies' },
  { label: 'Leaking (0-29)', min: 0, max: 29, color: '#EF4444', desc: 'Primarily shopping elsewhere — high leakage risk' },
]

function getLoyaltyTier(retentionScore: number) {
  return LOYALTY_TIERS.find((t) => retentionScore >= t.min && retentionScore <= t.max) ?? LOYALTY_TIERS[3]!
}

export function LoyaltyLeakagePage() {
  const { state } = useData()

  const loyaltyDistribution = useMemo(() => {
    return LOYALTY_TIERS.map((tier) => {
      const customers = state.customers.filter((c) => c.retentionScore >= tier.min && c.retentionScore <= tier.max)
      const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
      const avgBasket = customers.length > 0 ? customers.reduce((s, c) => s + c.avgBasketValue, 0) / customers.length : 0
      return {
        name: tier.label,
        count: customers.length,
        totalSpend,
        avgBasket,
        color: tier.color,
        desc: tier.desc,
      }
    })
  }, [state.customers])

  const leakingBySegment = useMemo(() => {
    const segments: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']
    return segments.map((seg) => {
      const customers = state.customers.filter((c) => c.segment === seg)
      const leaking = customers.filter((c) => c.retentionScore < 50)
      return {
        segment: seg.length > 12 ? seg.slice(0, 12) + '...' : seg,
        fullName: seg,
        total: customers.length,
        leaking: leaking.length,
        leakRate: customers.length > 0 ? (leaking.length / customers.length) * 100 : 0,
      }
    })
  }, [state.customers])

  const topLeakageRisk = useMemo(() => {
    return [...state.customers]
      .filter((c) => c.retentionScore < 40 && c.totalSpend > 200)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 15)
  }, [state.customers])

  const leakageByCategory = useMemo(() => {
    const catMap: Record<string, { loyal: number; leaking: number }> = {}
    state.customers.forEach((c) => {
      const cat = c.topCategory
      if (!cat) return
      if (!catMap[cat]) catMap[cat] = { loyal: 0, leaking: 0 }
      if (c.retentionScore >= 50) catMap[cat]!.loyal++
      else catMap[cat]!.leaking++
    })
    return Object.entries(catMap)
      .map(([cat, data]) => ({
        category: cat.length > 14 ? cat.slice(0, 14) + '...' : cat,
        loyal: data.loyal,
        leaking: data.leaking,
        leakRate: ((data.leaking / (data.loyal + data.leaking)) * 100),
      }))
      .sort((a, b) => b.leakRate - a.leakRate)
  }, [state.customers])

  const loyalCount = loyaltyDistribution[0]!.count
  const leakingCount = loyaltyDistribution[3]!.count
  const totalCustomers = state.customers.length
  const atRiskRevenue = useMemo(() =>
    state.customers.filter((c) => c.retentionScore < 50).reduce((s, c) => s + c.totalSpend, 0),
    [state.customers],
  )

  const retentionTrend = useMemo(() =>
    state.summary.map((s, _i) => ({
      month: new Intl.DateTimeFormat('en-AU', { month: 'short', year: '2-digit' }).format(s.periodMonth),
      retention: s.retentionRate,
      churn: s.churnRate,
    })),
    [state.summary],
  )

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Loyalty & Leakage</h1>
        <p className="text-sm text-slate-500 mt-1">
          Are your customers loyal, or are they shopping at other pharmacies? Track loyalty tiers and identify leakage risks.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard
          title="Loyal Customers"
          value={`${formatNumber(loyalCount)} (${((loyalCount / totalCustomers) * 100).toFixed(1)}%)`}
          icon={<Heart className="w-4 h-4" />}
        />
        <KPICard
          title="Leaking Customers"
          value={`${formatNumber(leakingCount)} (${((leakingCount / totalCustomers) * 100).toFixed(1)}%)`}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <KPICard
          title="Revenue at Risk"
          value={formatCurrency(atRiskRevenue)}
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <KPICard
          title="Loyalty Rate"
          value={formatPercentRaw(((loyalCount + loyaltyDistribution[1]!.count) / totalCustomers) * 100)}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>

      {/* Loyalty Tier explanation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LOYALTY_TIERS.map((tier, i) => {
          const data = loyaltyDistribution[i]!
          return (
            <div key={tier.label} className="bg-white rounded-xl border border-slate-200 p-4 chart-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <p className="text-xs font-semibold text-slate-700">{tier.label}</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{formatNumber(data.count)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{tier.desc}</p>
              <div className="mt-2 text-xs text-slate-500">
                <span>Avg basket: {formatCurrency(data.avgBasket)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Loyalty Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Loyalty Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loyaltyDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                cornerRadius={4}
                dataKey="count"
                animationDuration={1000}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {loyaltyDistribution.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leakage by Segment */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Leakage Rate by Segment</h3>
          <p className="text-xs text-slate-400 mb-3">% of customers in each segment with retention score below 50</p>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={leakingBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="segment" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as typeof leakingBySegment[number]
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p>{d.leaking} of {d.total} leaking ({d.leakRate.toFixed(1)}%)</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="leakRate" name="Leak Rate %" radius={[4, 4, 0, 0]} animationDuration={800}>
                {leakingBySegment.map((d, i) => (
                  <Cell key={i} fill={d.leakRate > 50 ? '#EF4444' : d.leakRate > 30 ? '#F59E0B' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Retention Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={retentionTrend}>
              <defs>
                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="retention" stroke="#10B981" strokeWidth={2.5} fill="url(#retGrad)" name="Retention %" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leakage by Top Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Leakage by Top Category</h3>
          <p className="text-xs text-slate-400 mb-3">Categories where customers are most likely to shop elsewhere</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={leakageByCategory.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={100} />
              <Tooltip />
              <Bar dataKey="leakRate" name="Leak %" radius={[0, 4, 4, 0]} animationDuration={800}>
                {leakageByCategory.slice(0, 10).map((d, i) => (
                  <Cell key={i} fill={d.leakRate > 50 ? '#EF4444' : d.leakRate > 40 ? '#F59E0B' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Leakage Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-in-up">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Top 15 High-Value Leakage Risks</h3>
          <p className="text-xs text-slate-400 mt-0.5">Customers spending $200+ but with loyalty score under 40 — likely shopping elsewhere.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Segment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total Spend</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Basket</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Loyalty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Last Visit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Top Category</th>
              </tr>
            </thead>
            <tbody>
              {topLeakageRisk.map((c) => {
                const tier = getLoyaltyTier(c.retentionScore)
                return (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-900">{c.customerName}</p>
                      <p className="text-xs text-slate-400">{c.id}</p>
                    </td>
                    <td className="px-4 py-2.5"><SegmentBadge segment={c.segment} /></td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(c.totalSpend)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(c.avgBasketValue)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: tier.color + '15', color: tier.color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        {c.retentionScore}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{c.daysSinceLastVisit}d ago</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.topCategory}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-800 text-sm">Leakage Alert</h4>
          </div>
          <p className="text-sm text-red-700">
            <strong>{formatNumber(leakingCount)} customers</strong> have a loyalty score under 30, representing
            <strong> {formatCurrency(loyaltyDistribution[3]!.totalSpend)}</strong> in total spend. These shoppers are primarily
            going to other pharmacies. A targeted recall campaign (SMS + $5 voucher) could recover 15-25% of this group.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h4 className="font-semibold text-emerald-800 text-sm">Loyalty Strength</h4>
          </div>
          <p className="text-sm text-emerald-700">
            <strong>{formatNumber(loyalCount)} loyal customers</strong> (80+ score) are your core base, contributing
            <strong> {formatCurrency(loyaltyDistribution[0]!.totalSpend)}</strong> in spend. Protect them with loyalty rewards,
            exclusive offers, and personalised service. They are your best advocates for word-of-mouth referrals.
          </p>
        </div>
      </div>
    </div>
  )
}
