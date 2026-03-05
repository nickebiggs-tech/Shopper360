import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts'
import {
  Lightbulb, TrendingUp, ShieldCheck, Target, Users, ShoppingCart,
  AlertTriangle, Heart, Sparkles, Package, ArrowRight,
} from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { formatCurrency, formatCurrencyDecimal, formatNumber, formatCompact } from '../../lib/formatters'
import type { Segment } from '../../data/types'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

export function CampaignHistoryPage() {
  const { state, networkScale } = useData()
  const scaleN = (n: number) => Math.round(n * networkScale)

  // Aggregate data for recommendations
  const segmentStats = useMemo(() => {
    const segments: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']
    return segments.map((seg) => {
      const custs = state.customers.filter((c) => c.segment === seg)
      const count = custs.length
      if (count === 0) return { segment: seg, count: 0, avgBasket: 0, avgSoW: 0, avgRetention: 0, totalSpend: 0, healthPct: 0, avgVisits: 0 }
      return {
        segment: seg,
        count,
        avgBasket: custs.reduce((s, c) => s + c.avgBasketValue, 0) / count,
        avgSoW: custs.reduce((s, c) => s + c.shareOfWallet, 0) / count,
        avgRetention: custs.reduce((s, c) => s + c.retentionScore, 0) / count,
        totalSpend: custs.reduce((s, c) => s + c.totalSpend, 0),
        healthPct: (custs.filter((c) => c.healthConscious === 'Y').length / count) * 100,
        avgVisits: custs.reduce((s, c) => s + c.totalVisits, 0) / count,
      }
    })
  }, [state.customers])

  const networkKPIs = useMemo(() => {
    const count = state.customers.length
    if (count === 0) return { count: 0, avgBasket: 0, avgSoW: 0, totalRevenue: 0, atRiskCount: 0, atRiskRevenue: 0 }
    const atRisk = state.customers.filter((c) => c.segment === 'At-Risk')
    return {
      count,
      avgBasket: state.customers.reduce((s, c) => s + c.avgBasketValue, 0) / count,
      avgSoW: state.customers.reduce((s, c) => s + c.shareOfWallet, 0) / count,
      totalRevenue: state.customers.reduce((s, c) => s + c.totalSpend, 0),
      atRiskCount: atRisk.length,
      atRiskRevenue: atRisk.reduce((s, c) => s + c.totalSpend, 0),
    }
  }, [state.customers])

  // Cross-shopping analysis
  const crossShopData = useMemo(() => {
    const counts: Record<string, number> = {}
    state.customers.forEach((c) => {
      if (c.crossShopRetailer && c.crossShopRetailer !== 'None') {
        counts[c.crossShopRetailer] = (counts[c.crossShopRetailer] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: ((value / state.customers.length) * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [state.customers])

  // Supplier opportunities
  const supplierOpps = useMemo(() => {
    return state.suppliers
      .map((sup) => {
        const shareGap = sup.yourStoreShare - sup.mfrMarketSharePct
        return { ...sup, shareGap }
      })
      .sort((a, b) => a.shareGap - b.shareGap)
      .slice(0, 5)
  }, [state.suppliers])

  // Category leakage
  const categoryData = useMemo(() => {
    const catMap: Record<string, { count: number; leaking: number; totalSpend: number }> = {}
    state.customers.forEach((c) => {
      if (!catMap[c.topCategory]) catMap[c.topCategory] = { count: 0, leaking: 0, totalSpend: 0 }
      catMap[c.topCategory]!.count++
      catMap[c.topCategory]!.totalSpend += c.totalSpend
      if (c.retentionScore < 50) catMap[c.topCategory]!.leaking++
    })
    return Object.entries(catMap)
      .map(([cat, data]) => ({
        category: cat.length > 14 ? cat.slice(0, 14) + '...' : cat,
        fullName: cat,
        leakRate: (data.leaking / data.count) * 100,
        totalSpend: data.totalSpend,
      }))
      .sort((a, b) => b.leakRate - a.leakRate)
      .slice(0, 8)
  }, [state.customers])

  // Generate network-level recommendations
  const networkRecs = useMemo(() => {
    const recs: { title: string; icon: typeof Lightbulb; color: string; narrative: string; impact: string }[] = []

    // 1. At-risk recovery
    const atRiskStats = segmentStats.find((s) => s.segment === 'At-Risk')
    if (atRiskStats && atRiskStats.count > 0) {
      recs.push({
        title: 'At-Risk Recovery Program',
        icon: AlertTriangle,
        color: '#EF4444',
        narrative: `**${formatNumber(scaleN(atRiskStats.count))} shoppers** are classified At-Risk across the CW network, with avg retention score of ${atRiskStats.avgRetention.toFixed(0)}. CBA card data shows these shoppers have shifted spend to competitors — representing **${formatCurrency(atRiskStats.totalSpend * networkScale)}** in annual revenue at risk. A network-wide re-engagement strategy could recover 15-25% of this cohort.`,
        impact: `Potential recovery: ${formatCurrency(atRiskStats.totalSpend * networkScale * 0.2)}`,
      })
    }

    // 2. Share of wallet growth
    const lowSoWSegments = segmentStats.filter((s) => s.avgSoW < 40)
    if (lowSoWSegments.length > 0) {
      const totalLow = lowSoWSegments.reduce((s, seg) => s + seg.count, 0)
      recs.push({
        title: 'Share of Wallet Expansion',
        icon: TrendingUp,
        color: '#3B82F6',
        narrative: `CBA credit card analysis reveals **${formatNumber(scaleN(totalLow))} shoppers** across ${lowSoWSegments.map((s) => s.segment).join(', ')} segments have avg share of wallet under 40% at CW. These shoppers are spending significantly at Priceline, Terry White & other pharmacy competitors. Category range reviews, loyalty incentives, and competitive price matching could lift SoW by 5-10pp.`,
        impact: `Target: +5pp SoW across ${formatNumber(scaleN(totalLow))} shoppers`,
      })
    }

    // 3. Health-conscious opportunity
    const healthStats = state.customers.filter((c) => c.healthConscious === 'Y')
    const healthPct = (healthStats.length / state.customers.length) * 100
    if (healthPct > 30) {
      const healthAvgBasket = healthStats.reduce((s, c) => s + c.avgBasketValue, 0) / healthStats.length
      recs.push({
        title: 'Wellness & Health Focus',
        icon: Heart,
        color: '#EC4899',
        narrative: `**${healthPct.toFixed(0)}%** of the CW network (${formatNumber(scaleN(healthStats.length))} shoppers) are health-conscious, with avg basket of **${formatCurrencyDecimal(healthAvgBasket)}**. CBA spend data shows this cohort indexes 1.4x on supplement and wellness categories. Expanding vitamin, natural health, and wellness ranges can drive basket growth and retention.`,
        impact: `${formatNumber(scaleN(healthStats.length))} health-conscious shoppers`,
      })
    }

    // 4. Cross-shopping defence
    if (crossShopData.length > 0) {
      const topCompetitor = crossShopData[0]!
      recs.push({
        title: 'Competitive Defence Strategy',
        icon: ShieldCheck,
        color: '#F59E0B',
        narrative: `CBA card-linked data identifies **${topCompetitor.name}** as the #1 cross-shopping competitor — **${topCompetitor.pct}%** of CW shoppers (${formatNumber(scaleN(topCompetitor.value))}) also transact there. Focus on price competitiveness in overlapping OTC & personal care categories, exclusive CW-only product lines, and loyalty benefits that reduce switching.`,
        impact: `Defend against ${topCompetitor.name} (${formatNumber(scaleN(topCompetitor.value))} shared shoppers)`,
      })
    }

    // 5. Power Shopper retention
    const powerStats = segmentStats.find((s) => s.segment === 'Power Shoppers')
    if (powerStats && powerStats.count > 0) {
      recs.push({
        title: 'Power Shopper Retention',
        icon: Sparkles,
        color: '#8B5CF6',
        narrative: `**${formatNumber(scaleN(powerStats.count))} Power Shoppers** are CW's most valuable cohort — avg basket **${formatCurrencyDecimal(powerStats.avgBasket)}**, avg **${powerStats.avgSoW.toFixed(0)}% share of wallet** (CBA data). They contribute **${formatCurrency(powerStats.totalSpend * networkScale)}** annually. VIP loyalty perks, early access to promotions, and personalised health consultations protect this revenue base.`,
        impact: `Protect ${formatCurrency(powerStats.totalSpend * networkScale)} in Power Shopper revenue`,
      })
    }

    return recs
  }, [segmentStats, crossShopData, state.customers])

  // Supplier recommendations
  const supplierRecs = useMemo(() => {
    return supplierOpps.map((sup) => ({
      name: sup.mfrName,
      shareGap: sup.shareGap,
      nationalShare: sup.mfrMarketSharePct,
      cwShare: sup.yourStoreShare,
      totalValue: sup.totalTYValue,
      categories: sup.topCategories,
      narrative: `**${sup.mfrName}** is under-indexed at CW by **${Math.abs(sup.shareGap).toFixed(1)}pp** vs national (${sup.yourStoreShare.toFixed(1)}% vs ${sup.mfrMarketSharePct.toFixed(1)}% national). Expanding ${sup.topCategories.slice(0, 2).join(' & ')} range and improving shelf presence could capture incremental revenue of **${formatCompact(sup.totalTYValue * Math.abs(sup.shareGap) / 100)}**.`,
    }))
  }, [supplierOpps])

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Strategic Recommendations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-driven recommendations for the CW network and supplier partners — aggregated insights only
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">Aggregated Data</span>
        </div>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard title="CW Network Shoppers" value={formatNumber(scaleN(networkKPIs.count))} icon={<Users className="w-4 h-4" />} color="text-slate-900" />
        <KPICard title="Avg Basket Value" value={formatCurrencyDecimal(networkKPIs.avgBasket)} icon={<ShoppingCart className="w-4 h-4" />} color="text-slate-900" />
        <KPICard title="Avg Share of Wallet" value={`${networkKPIs.avgSoW.toFixed(0)}%`} icon={<Target className="w-4 h-4" />} color="text-slate-900" />
        <KPICard title="At-Risk Revenue" value={formatCurrency(networkKPIs.atRiskRevenue)} icon={<AlertTriangle className="w-4 h-4" />} color="text-red-600" />
      </div>

      {/* Network-Level Recommendations */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          CW Network Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {networkRecs.map((rec, idx) => {
            const Icon = rec.icon
            return (
              <div
                key={rec.title}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 chart-card animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: rec.color + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: rec.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{rec.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold mb-3"
                  dangerouslySetInnerHTML={{ __html: rec.narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                  <ArrowRight className="w-3 h-3 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-primary">{rec.impact}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts: Segment Spend & Category Leakage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Segment Spend */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Segment Revenue Contribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={segmentStats.map((s) => ({ name: s.segment.length > 12 ? s.segment.slice(0, 12) + '...' : s.segment, spend: s.totalSpend, fullName: s.segment }))} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={100} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as { fullName: string; spend: number }
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p>Revenue: {formatCurrency(d.spend)}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="spend" radius={[0, 4, 4, 0]} animationDuration={800}>
                {segmentStats.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Leakage */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Highest Leakage Categories</h3>
          <p className="text-xs text-slate-400 mb-3">Categories where shoppers are most likely to shop elsewhere</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={100} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as typeof categoryData[number]
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p>Leakage Rate: {d.leakRate.toFixed(1)}%</p>
                      <p>Total Spend: {formatCurrency(d.totalSpend)}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="leakRate" radius={[0, 4, 4, 0]} animationDuration={800}>
                {categoryData.map((d, i) => (
                  <Cell key={i} fill={d.leakRate > 50 ? '#EF4444' : d.leakRate > 40 ? '#F59E0B' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cross-Shopping */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Cross-Shopping Risk</h3>
          <p className="text-xs text-slate-400 mb-3">Where CW network shoppers also transact</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={crossShopData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                cornerRadius={3}
                animationDuration={800}
                label={({ name, pct }) => `${name} (${pct}%)`}
              >
                {crossShopData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [formatNumber(v), 'Shoppers']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Share of Wallet */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Share of Wallet by Segment</h3>
          <p className="text-xs text-slate-400 mb-3">Avg % of pharmacy spend at CW</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={segmentStats.map((s) => ({ name: s.segment.length > 12 ? s.segment.slice(0, 12) + '...' : s.segment, sow: s.avgSoW }))} margin={{ bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
              <Tooltip />
              <Bar dataKey="sow" name="Share of Wallet %" radius={[4, 4, 0, 0]} animationDuration={800}>
                {segmentStats.map((s, i) => (
                  <Cell key={i} fill={s.avgSoW > 50 ? '#10B981' : s.avgSoW > 35 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Recommendations */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" />
          Supplier Growth Opportunities
        </h2>
        <p className="text-xs text-slate-400 mb-4">Suppliers where CW network is under-indexed vs national — highest growth potential</p>
        <div className="space-y-3">
          {supplierRecs.map((sup, idx) => (
            <div
              key={sup.name}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 chart-card animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900">{sup.name}</h4>
                    <span className="text-xs text-red-600 font-medium">{sup.shareGap.toFixed(1)}pp gap</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold mb-2"
                    dangerouslySetInnerHTML={{ __html: sup.narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {sup.categories.map((cat) => (
                      <span key={cat} className="px-2 py-0.5 bg-slate-50 rounded-full text-[10px] text-slate-500 border border-slate-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right hidden sm:block shrink-0">
                  <p className="text-xs text-slate-400">National Value</p>
                  <p className="text-sm font-bold text-slate-900">{formatCompact(sup.totalValue)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          All recommendations are based on aggregated, de-identified CW network data. No individual customer targeting is involved.
          Recommendations should be implemented at the network/category level through range, pricing, and promotional strategies.
        </p>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase">{title}</p>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
