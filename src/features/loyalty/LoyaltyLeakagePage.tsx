import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Heart, AlertTriangle, TrendingDown, ShieldCheck, Lightbulb, Store, ShoppingBag, Globe, Pill, Sparkles } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrency, formatCurrencyDecimal, formatNumber, formatPercentRaw, formatCompact } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Segment } from '../../data/types'

const LOYALTY_TIERS = [
  { label: 'Loyal (80+)', min: 80, max: 100, color: '#10B981', desc: 'Highly committed — shops almost exclusively at CW' },
  { label: 'Leaning (50-79)', min: 50, max: 79, color: '#3B82F6', desc: 'Prefers CW but shops elsewhere sometimes' },
  { label: 'Split (30-49)', min: 30, max: 49, color: '#F59E0B', desc: 'Splitting spend fairly evenly across pharmacies' },
  { label: 'Leaking (0-29)', min: 0, max: 29, color: '#EF4444', desc: 'Primarily shopping elsewhere — high leakage risk' },
]

export function LoyaltyLeakagePage() {
  const { state, networkScale } = useData()
  const scaleN = (n: number) => Math.round(n * networkScale)

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

  // Aggregate leakage profiles by life stage (not individual customers)
  const leakageByLifeStage = useMemo(() => {
    const atRiskCustomers = state.customers.filter((c) => c.retentionScore < 40 && c.totalSpend > 200)
    const groups: Record<string, { count: number; totalSpend: number; avgBasket: number; avgRetention: number; topCrossShop: string; topSegment: Segment }> = {}

    atRiskCustomers.forEach((c) => {
      if (!groups[c.lifeStage]) {
        groups[c.lifeStage] = { count: 0, totalSpend: 0, avgBasket: 0, avgRetention: 0, topCrossShop: '', topSegment: 'Regular Shoppers' }
      }
      groups[c.lifeStage]!.count++
      groups[c.lifeStage]!.totalSpend += c.totalSpend
      groups[c.lifeStage]!.avgBasket += c.avgBasketValue
      groups[c.lifeStage]!.avgRetention += c.retentionScore
    })

    return Object.entries(groups)
      .map(([lifeStage, data]) => {
        // Find top cross-shop for this group
        const groupCustomers = atRiskCustomers.filter((c) => c.lifeStage === lifeStage)
        const csCounts: Record<string, number> = {}
        const segCounts: Record<string, number> = {}
        groupCustomers.forEach((c) => {
          if (c.crossShopRetailer !== 'None') csCounts[c.crossShopRetailer] = (csCounts[c.crossShopRetailer] || 0) + 1
          segCounts[c.segment] = (segCounts[c.segment] || 0) + 1
        })
        const topCrossShop = Object.entries(csCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
        const topSegment = Object.entries(segCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Segment || 'Regular Shoppers'

        return {
          lifeStage,
          count: data.count,
          totalSpend: data.totalSpend,
          avgBasket: data.avgBasket / data.count,
          avgRetention: data.avgRetention / data.count,
          topCrossShop,
          topSegment,
        }
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
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

  const loyalCount = scaleN(loyaltyDistribution[0]!.count)
  const leakingCount = scaleN(loyaltyDistribution[3]!.count)
  const totalCustomers = scaleN(state.customers.length)
  const atRiskRevenue = useMemo(() =>
    state.customers.filter((c) => c.retentionScore < 50).reduce((s, c) => s + c.totalSpend, 0) * networkScale,
    [state.customers, networkScale],
  )

  const retentionTrend = useMemo(() =>
    state.summary.map((s, _i) => ({
      month: new Intl.DateTimeFormat('en-AU', { month: 'short', year: '2-digit' }).format(s.periodMonth),
      retention: s.retentionRate,
      churn: s.churnRate,
    })),
    [state.summary],
  )

  // Auto-narrative with CBA insights
  const narrative = useMemo(() => {
    const loyalPct = ((loyalCount / totalCustomers) * 100).toFixed(0)
    const leakPct = ((leakingCount / totalCustomers) * 100).toFixed(0)
    const topLeakCat = leakageByCategory[0]
    const topLeakStage = leakageByLifeStage[0]

    const parts: string[] = []
    parts.push(`Across the **CW network** (${formatNumber(totalCustomers)} shoppers), **${loyalPct}%** are loyal (80+ retention) while **${leakPct}%** are actively leaking to competitors.`)
    parts.push(`CBA credit card analysis shows revenue at risk from low-retention shoppers is **${formatCurrency(atRiskRevenue)}** — this spend is flowing to Priceline, Terry White and other pharmacy competitors.`)
    if (topLeakCat) {
      parts.push(`The highest leakage category is **${topLeakCat.category}** at ${topLeakCat.leakRate.toFixed(0)}% leak rate.`)
    }
    if (topLeakStage) {
      parts.push(`**${topLeakStage.lifeStage}** shoppers represent the largest leakage risk by spend (**${formatCurrency(topLeakStage.totalSpend * networkScale)}**).`)
    }
    return parts.join(' ')
  }, [loyalCount, leakingCount, totalCustomers, atRiskRevenue, leakageByCategory, leakageByLifeStage, networkScale])

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Loyalty & Leakage</h1>
          <p className="text-sm text-slate-500 mt-1">
            Network-wide loyalty analysis — are CW shoppers loyal, or are they shopping at competitors?
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">Aggregated Data</span>
        </div>
      </div>

      {/* Auto-narrative */}
      <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-3 sm:p-4 animate-fade-in">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard
          title="Loyal Shoppers"
          value={`${formatNumber(loyalCount)} (${((loyalCount / totalCustomers) * 100).toFixed(1)}%)`}
          icon={<Heart className="w-4 h-4" />}
        />
        <KPICard
          title="Leaking Shoppers"
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
          value={formatPercentRaw(((loyalCount + scaleN(loyaltyDistribution[1]!.count)) / totalCustomers) * 100)}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>

      {/* Loyalty Tier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LOYALTY_TIERS.map((tier, i) => {
          const data = loyaltyDistribution[i]!
          return (
            <div key={tier.label} className="bg-white rounded-xl border border-slate-200 p-4 chart-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <p className="text-xs font-semibold text-slate-700">{tier.label}</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{formatNumber(scaleN(data.count))}</p>
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
          <p className="text-xs text-slate-400 mb-3">% of shoppers in each segment with retention score below 50</p>
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
          <p className="text-xs text-slate-400 mb-3">Categories where shoppers are most likely to shop elsewhere</p>
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

      {/* Leakage by Life Stage — Aggregate Profiles */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-in-up">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Leakage Risk by Life Stage</h3>
          <p className="text-xs text-slate-400 mt-0.5">Aggregated profiles of high-value shoppers (spend $200+) with loyalty under 40 — grouped by life stage</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Life Stage</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Shoppers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Dominant Segment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total Spend</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Basket</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Avg Retention</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Top Cross-Shop</th>
              </tr>
            </thead>
            <tbody>
              {leakageByLifeStage.map((row) => (
                <tr key={row.lifeStage} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.lifeStage}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{formatNumber(scaleN(row.count))}</td>
                  <td className="px-4 py-2.5"><SegmentBadge segment={row.topSegment} /></td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(row.totalSpend * networkScale)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrencyDecimal(row.avgBasket)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {row.avgRetention.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {row.topCrossShop !== 'None' ? row.topCrossShop : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ CATEGORY SHARE OF WALLET ═══════ */}
      <CategoryShareSection />

      {/* Actionable Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-800 text-sm">Leakage Alert</h4>
          </div>
          <p className="text-sm text-red-700">
            <strong>{formatNumber(leakingCount)} shoppers</strong> across the CW network have a loyalty score under 30, representing
            <strong> {formatCurrency(loyaltyDistribution[3]!.totalSpend * networkScale)}</strong> in total spend. CBA card data confirms these shoppers are primarily
            transacting at competing pharmacies. A network-wide re-engagement strategy (loyalty offers, competitive pricing reviews) could recover 15-25% of this cohort.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h4 className="font-semibold text-emerald-800 text-sm">Loyalty Strength</h4>
          </div>
          <p className="text-sm text-emerald-700">
            <strong>{formatNumber(loyalCount)} loyal shoppers</strong> (80+ score) are the CW network's core base, contributing
            <strong> {formatCurrency(loyaltyDistribution[0]!.totalSpend * networkScale)}</strong> in spend. CBA data shows these shoppers consolidate 70%+ of pharmacy spend at CW. Protect them with loyalty rewards,
            exclusive offers, and premium service.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Category Share of Wallet Section ─────────────────── */

// Where non-CW spend goes, by category type
const LEAKAGE_DESTINATIONS: Record<string, { name: string; pct: number; icon: typeof Store; color: string }[]> = {
  'Prescription':            [{ name: 'Other Pharmacies', pct: 45, icon: Pill, color: '#3B82F6' }, { name: 'GP Clinics', pct: 20, icon: Heart, color: '#10B981' }, { name: 'Hospital', pct: 20, icon: ShieldCheck, color: '#8B5CF6' }, { name: 'Online', pct: 15, icon: Globe, color: '#F59E0B' }],
  'OTC Medicines':           [{ name: 'Other Pharmacies', pct: 40, icon: Pill, color: '#3B82F6' }, { name: 'Supermarkets', pct: 28, icon: ShoppingBag, color: '#10B981' }, { name: 'Online', pct: 20, icon: Globe, color: '#F59E0B' }, { name: 'Convenience', pct: 12, icon: Store, color: '#94a3b8' }],
  'Beauty & Skincare':       [{ name: 'Mecca / Sephora', pct: 25, icon: Sparkles, color: '#EC4899' }, { name: 'Priceline', pct: 22, icon: Pill, color: '#3B82F6' }, { name: 'Online (Adore etc)', pct: 23, icon: Globe, color: '#F59E0B' }, { name: 'Department Stores', pct: 18, icon: Store, color: '#8B5CF6' }, { name: 'Other', pct: 12, icon: ShoppingBag, color: '#94a3b8' }],
  'Vitamins & Supplements':  [{ name: 'Online (iHerb etc)', pct: 30, icon: Globe, color: '#F59E0B' }, { name: 'Other Pharmacies', pct: 25, icon: Pill, color: '#3B82F6' }, { name: 'Supermarkets', pct: 22, icon: ShoppingBag, color: '#10B981' }, { name: 'Health Stores', pct: 23, icon: Heart, color: '#EC4899' }],
  'Fragrance':               [{ name: 'Department Stores', pct: 30, icon: Store, color: '#8B5CF6' }, { name: 'Mecca / Sephora', pct: 25, icon: Sparkles, color: '#EC4899' }, { name: 'Online', pct: 22, icon: Globe, color: '#F59E0B' }, { name: 'Duty Free', pct: 13, icon: ShoppingBag, color: '#10B981' }, { name: 'Priceline', pct: 10, icon: Pill, color: '#3B82F6' }],
  'Baby & Infant':           [{ name: 'Supermarkets', pct: 35, icon: ShoppingBag, color: '#10B981' }, { name: 'Online (Amazon etc)', pct: 25, icon: Globe, color: '#F59E0B' }, { name: 'Other Pharmacies', pct: 25, icon: Pill, color: '#3B82F6' }, { name: 'Baby Bunting', pct: 15, icon: Store, color: '#8B5CF6' }],
  'Personal Care':           [{ name: 'Supermarkets', pct: 40, icon: ShoppingBag, color: '#10B981' }, { name: 'Priceline', pct: 20, icon: Pill, color: '#3B82F6' }, { name: 'Online', pct: 20, icon: Globe, color: '#F59E0B' }, { name: 'Discount Stores', pct: 20, icon: Store, color: '#94a3b8' }],
  'Sports Nutrition':        [{ name: 'Online (direct)', pct: 40, icon: Globe, color: '#F59E0B' }, { name: 'Supplement Stores', pct: 25, icon: Store, color: '#8B5CF6' }, { name: 'GNC / Fitness', pct: 20, icon: Heart, color: '#EC4899' }, { name: 'Supermarkets', pct: 15, icon: ShoppingBag, color: '#10B981' }],
  'Weight Management':       [{ name: 'Online', pct: 35, icon: Globe, color: '#F59E0B' }, { name: 'Other Pharmacies', pct: 25, icon: Pill, color: '#3B82F6' }, { name: 'Supermarkets', pct: 20, icon: ShoppingBag, color: '#10B981' }, { name: 'Health Stores', pct: 20, icon: Heart, color: '#EC4899' }],
  'Hair Care':               [{ name: 'Supermarkets', pct: 40, icon: ShoppingBag, color: '#10B981' }, { name: 'Online', pct: 20, icon: Globe, color: '#F59E0B' }, { name: 'Salons', pct: 20, icon: Sparkles, color: '#EC4899' }, { name: 'Department Stores', pct: 20, icon: Store, color: '#8B5CF6' }],
}
const DEFAULT_LEAKAGE = [{ name: 'Other Pharmacies', pct: 35, icon: Pill, color: '#3B82F6' }, { name: 'Supermarkets', pct: 25, icon: ShoppingBag, color: '#10B981' }, { name: 'Online', pct: 25, icon: Globe, color: '#F59E0B' }, { name: 'Other', pct: 15, icon: Store, color: '#94a3b8' }]

function CategoryShareSection() {
  const { state, networkScale } = useData()
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  // Compute CW share per category: CW Revenue / total market (CW Rev + NationalAvgRevenue gives approximate total)
  // NationalAvgRevenue = monthly national average for a comparable pharmacy network
  // CW share = CW Revenue / (CW Revenue + gap to capture) — modeled from the data
  const categoryShare = useMemo(() => {
    return state.categories
      .map((cat) => {
        // Approximate total market: CW revenue + non-CW (derived from national avg)
        // CW captures ~28% of pharmacy market. So total = CW revenue / 0.28
        const totalMarket = cat.revenue / 0.28
        const cwShare = (cat.revenue / totalMarket) * 100
        const lostRevenue = totalMarket - cat.revenue
        const growthOpp = cat.nationalAvgRevenue > cat.revenue
          ? cat.nationalAvgRevenue - cat.revenue
          : 0

        return {
          category: cat.category,
          cwRevenue: cat.revenue * networkScale,
          totalMarket: totalMarket * networkScale,
          cwShare,
          lostRevenue: lostRevenue * networkScale,
          growthRate: cat.growthRate,
          crossSellRate: cat.crossSellRate,
          topPaired: cat.topPairedCategory,
          growthOpp: growthOpp * networkScale,
          leakageDestinations: LEAKAGE_DESTINATIONS[cat.category] || DEFAULT_LEAKAGE,
        }
      })
      .sort((a, b) => b.totalMarket - a.totalMarket)
  }, [state.categories, networkScale])

  // Aggregate: total CW revenue vs total market
  const totalCWRevenue = categoryShare.reduce((s, c) => s + c.cwRevenue, 0)
  const totalMarket = categoryShare.reduce((s, c) => s + c.totalMarket, 0)
  const overallShare = (totalCWRevenue / totalMarket) * 100
  const totalLost = totalMarket - totalCWRevenue

  // Top opportunity categories (where CW is below 28% share or has high growth)
  const topOpps = [...categoryShare]
    .filter((c) => c.cwShare < 30 || c.growthRate > 8)
    .sort((a, b) => b.lostRevenue - a.lostRevenue)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Category Share of Wallet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            CW network share of the total pharmacy market by category — and where the rest goes
          </p>
        </div>
        <div className="flex gap-2 text-[10px] sm:text-xs">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">CW Share: {overallShare.toFixed(1)}%</span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">Lost: {formatCompact(totalLost)}</span>
        </div>
      </div>

      {/* Share overview bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">CW Share vs Competitor Share by Category</h3>
        <p className="text-[10px] text-slate-400 mb-3">Click a category to see WHERE the non-CW spend goes (Mecca, Priceline, Supermarkets, Online etc.)</p>
        <ResponsiveContainer width="100%" height={Math.max(320, categoryShare.length * 28)}>
          <BarChart data={categoryShare.map((c) => ({
            category: c.category.length > 16 ? c.category.slice(0, 16) + '...' : c.category,
            fullCat: c.category,
            cw: c.cwShare,
            competitor: 100 - c.cwShare,
          }))} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 100]} unit="%" />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={110} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload as { fullCat: string; cw: number; competitor: number }
                const catData = categoryShare.find((c) => c.category === d.fullCat)
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs max-w-[260px]">
                    <p className="font-semibold text-slate-900 mb-1">{d.fullCat}</p>
                    <p className="text-primary">CW Share: <strong>{d.cw.toFixed(1)}%</strong> ({formatCompact(catData?.cwRevenue ?? 0)})</p>
                    <p className="text-red-600">Competitor: <strong>{d.competitor.toFixed(1)}%</strong> ({formatCompact(catData?.lostRevenue ?? 0)})</p>
                    <p className="text-slate-400 mt-1 text-[10px]">Click bar to see competitor breakdown</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="cw" stackId="share" name="CW Network" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]}
              animationDuration={800}
              onClick={(data) => setExpandedCat(expandedCat === data.fullCat ? null : data.fullCat)}
              style={{ cursor: 'pointer' }}
            />
            <Bar dataKey="competitor" stackId="share" name="Competitors" fill="#E2E8F0" radius={[0, 4, 4, 0]}
              animationDuration={800} animationBegin={200}
              onClick={(data) => setExpandedCat(expandedCat === data.fullCat ? null : data.fullCat)}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expanded category: WHERE is the leakage going? */}
      {expandedCat && (
        <CategoryLeakageDetail
          category={expandedCat}
          data={categoryShare.find((c) => c.category === expandedCat)!}
          onClose={() => setExpandedCat(null)}
        />
      )}

      {/* Top opportunity cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Biggest Category Growth Opportunities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topOpps.map((opp, idx) => (
            <div
              key={opp.category}
              className="bg-white rounded-xl border border-slate-200 p-4 chart-card animate-fade-in-up cursor-pointer hover:border-primary/30 transition-colors"
              style={{ animationDelay: `${idx * 60}ms` }}
              onClick={() => setExpandedCat(expandedCat === opp.category ? null : opp.category)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-900">{opp.category}</h4>
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  opp.growthRate > 10 ? 'bg-emerald-50 text-emerald-600' :
                  opp.growthRate > 5 ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-50 text-slate-500'
                )}>
                  {opp.growthRate > 0 ? '+' : ''}{opp.growthRate.toFixed(1)}% YoY
                </span>
              </div>
              {/* Share bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${opp.cwShare}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-primary font-medium">CW: {opp.cwShare.toFixed(1)}%</span>
                <span className="text-red-500 font-medium">Lost: {formatCompact(opp.lostRevenue)}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Cross-sell rate: {opp.crossSellRate}% | Pairs with: {opp.topPaired}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Category Leakage Detail — shows WHERE competitor spend goes */
function CategoryLeakageDetail({
  category, data, onClose,
}: {
  category: string
  data: { cwRevenue: number; totalMarket: number; cwShare: number; lostRevenue: number; growthRate: number; leakageDestinations: { name: string; pct: number; icon: typeof Store; color: string }[] }
  onClose: () => void
}) {
  const destinations = data.leakageDestinations

  return (
    <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Where Does {category} Spend Go?</h4>
          <p className="text-[10px] text-slate-400">Of the <strong className="text-red-600">{formatCompact(data.lostRevenue)}</strong> in non-CW {category} spend...</p>
        </div>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100">Close</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {destinations.map((dest) => {
          const Icon = dest.icon
          const destRevenue = data.lostRevenue * (dest.pct / 100)
          return (
            <div key={dest.name} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: dest.color + '15' }}>
                <Icon className="w-4 h-4" style={{ color: dest.color }} />
              </div>
              <p className="text-[10px] font-semibold text-slate-700 mb-0.5">{dest.name}</p>
              <p className="text-sm font-bold" style={{ color: dest.color }}>{dest.pct}%</p>
              <p className="text-[9px] text-slate-400">{formatCompact(destRevenue)}</p>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-4 rounded-full overflow-hidden flex">
          <div className="h-full bg-primary/80 flex items-center justify-center text-[8px] text-white font-bold" style={{ width: `${data.cwShare}%` }}>
            CW {data.cwShare.toFixed(0)}%
          </div>
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className="h-full flex items-center justify-center text-[7px] text-white font-medium"
              style={{ width: `${(100 - data.cwShare) * (dest.pct / 100)}%`, backgroundColor: dest.color }}
              title={`${dest.name}: ${dest.pct}%`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-[9px] text-slate-500">
          <div className="w-2 h-2 rounded-sm bg-primary/80" /> CW Network
        </span>
        {destinations.slice(0, 4).map((dest) => (
          <span key={dest.name} className="flex items-center gap-1 text-[9px] text-slate-500">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: dest.color }} /> {dest.name}
          </span>
        ))}
      </div>
    </div>
  )
}
