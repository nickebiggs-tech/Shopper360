import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, ReferenceLine, ComposedChart, Area,
} from 'recharts'
import { BarChart3, TrendingUp, Award, Target, ShoppingCart, Landmark, TrendingDown } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatPercentRaw, formatCompact } from '../../lib/formatters'

/* ------------------------------------------------------------------ */
/*  Small helper: description paragraph below chart titles             */
/* ------------------------------------------------------------------ */
function ChartDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs italic text-slate-400 mt-1 mb-4 leading-relaxed max-w-3xl">
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip for the interest-rate / spend chart (dual-axis)     */
/* ------------------------------------------------------------------ */
function RateSpendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">
            {p.dataKey === 'rbaRate' ? `${p.value.toFixed(2)}%` : p.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip for basket trend with annotations                   */
/* ------------------------------------------------------------------ */
function BasketTrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs max-w-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
      {row?.annotation && (
        <p className="mt-2 pt-1.5 border-t border-slate-100 text-slate-500 italic">{row.annotation}</p>
      )}
    </div>
  )
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export function NationalComparisonPage() {
  const { state, networkScale } = useData()

  const latest = state.national.length > 0 ? state.national[state.national.length - 1]! : null

  /* ---------- existing trend data ---------- */
  const basketTrend = useMemo(() =>
    state.national.map((n) => ({
      month: format(n.periodMonth, 'MMM yy'),
      P25: n.avgBasketValue_P25,
      Median: n.avgBasketValue_Median,
      P75: n.avgBasketValue_P75,
      'CW Network': n.avgBasketValue_YourStore,
    })),
    [state.national],
  )

  const retentionTrend = useMemo(() =>
    state.national.map((n) => ({
      month: format(n.periodMonth, 'MMM yy'),
      P25: n.retentionRate_P25,
      Median: n.retentionRate_Median,
      P75: n.retentionRate_P75,
      'CW Network': n.retentionRate_YourStore,
    })),
    [state.national],
  )

  const visitsTrend = useMemo(() =>
    state.national.map((n) => ({
      month: format(n.periodMonth, 'MMM yy'),
      P25: n.visitsPerCustomer_P25,
      Median: n.visitsPerCustomer_Median,
      P75: n.visitsPerCustomer_P75,
      'CW Network': n.visitsPerCustomer_YourStore,
    })),
    [state.national],
  )

  /* ---------- Basket Composition from categories ---------- */
  const basketComposition = useMemo(() => {
    if (!state.categories.length) return []
    const sorted = [...state.categories].sort((a, b) => b.revenue - a.revenue)
    const top = sorted.slice(0, 10)
    const totalRev = sorted.reduce((s, c) => s + c.revenue, 0)
    return top.map(c => ({
      category: c.category,
      revenue: c.revenue * networkScale,
      pctOfBasket: totalRev > 0 ? (c.revenue / totalRev) * 100 : 0,
      transactions: c.transactions * networkScale,
      avgItems: c.avgItemsPerBasket,
      crossSellRate: c.crossSellRate,
      topPair: c.topPairedCategory,
      growth: c.growthRate,
    }))
  }, [state.categories, networkScale])

  /* ---------- Interest Rate vs Consumer Spend (synthetic) ---------- */
  const interestRateData = useMemo(() => {
    const months = [
      { label: 'Apr 25', rbaRate: 4.35, cwSpend: 100.0, discretionary: 100.0, essential: 100.0 },
      { label: 'May 25', rbaRate: 4.35, cwSpend: 101.2, discretionary: 99.5, essential: 101.8 },
      { label: 'Jun 25', rbaRate: 4.35, cwSpend: 104.8, discretionary: 97.2, essential: 108.1 },
      { label: 'Jul 25', rbaRate: 4.35, cwSpend: 106.3, discretionary: 96.8, essential: 111.4 },
      { label: 'Aug 25', rbaRate: 4.35, cwSpend: 105.1, discretionary: 96.1, essential: 109.8 },
      { label: 'Sep 25', rbaRate: 4.35, cwSpend: 102.4, discretionary: 95.4, essential: 106.2 },
      { label: 'Oct 25', rbaRate: 4.35, cwSpend: 101.8, discretionary: 95.0, essential: 105.1 },
      { label: 'Nov 25', rbaRate: 4.35, cwSpend: 103.5, discretionary: 96.8, essential: 106.8 },
      { label: 'Dec 25', rbaRate: 4.35, cwSpend: 108.2, discretionary: 103.5, essential: 107.4 },
      { label: 'Jan 26', rbaRate: 4.35, cwSpend: 99.4, discretionary: 94.1, essential: 103.2 },
      { label: 'Feb 26', rbaRate: 4.10, cwSpend: 102.6, discretionary: 97.8, essential: 104.9 },
      { label: 'Mar 26', rbaRate: 4.10, cwSpend: 104.1, discretionary: 99.2, essential: 106.3 },
    ]
    return months
  }, [])

  /* ---------- Basket Value Trend with annotations ---------- */
  const basketValueAnnotated = useMemo(() => {
    const months = [
      { label: 'Apr 25', value: 42.10, annotation: '' },
      { label: 'May 25', value: 42.80, annotation: '' },
      { label: 'Jun 25', value: 44.60, annotation: 'Cold & flu season starts -- OTC and scripts lift basket value' },
      { label: 'Jul 25', value: 45.90, annotation: 'Peak cold & flu -- cough/cold, vitamins, tissues drive bundles' },
      { label: 'Aug 25', value: 45.20, annotation: 'Cold & flu waning -- still elevated vs baseline' },
      { label: 'Sep 25', value: 43.80, annotation: '' },
      { label: 'Oct 25', value: 43.20, annotation: 'Spring allergy season provides a mild lift' },
      { label: 'Nov 25', value: 44.10, annotation: 'Christmas gifting starts -- fragrance, beauty & gift sets' },
      { label: 'Dec 25', value: 46.50, annotation: 'Holiday peak -- gifting + suncare + travel health kits' },
      { label: 'Jan 26', value: 41.80, annotation: 'Post-holiday dip -- consumers pull back on discretionary' },
      { label: 'Feb 26', value: 43.40, annotation: 'RBA rate cut to 4.10% -- early signs of consumer confidence returning' },
      { label: 'Mar 26', value: 44.20, annotation: 'Basket recovery continues -- essentials stable, discretionary rebounding' },
    ]
    return months
  }, [])

  /* ---------- tier helper ---------- */
  const getTier = (yours: number, median: number, p75: number) => {
    if (yours >= p75) return { label: 'Top 25%', color: 'text-emerald-600' }
    if (yours >= median) return { label: 'Above Median', color: 'text-blue-600' }
    return { label: 'Below Median', color: 'text-amber-600' }
  }

  const basketTier = latest ? getTier(latest.avgBasketValue_YourStore, latest.avgBasketValue_Median, latest.avgBasketValue_P75) : null

  /* ---------- total network revenue for display ---------- */
  const totalNetworkRevenue = useMemo(() => {
    return state.categories.reduce((s, c) => s + c.revenue, 0) * networkScale
  }, [state.categories, networkScale])

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">National Benchmarks</h1>
        <p className="text-sm text-slate-500 mt-1">
          See how the CW network compares to national percentile benchmarks across basket value, retention, and visit frequency.
          Drill into basket composition, macro-economic overlays, and seasonal trends below.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  KPI Cards                                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard
          title="CW Avg Basket"
          value={formatCurrency(latest?.avgBasketValue_YourStore ?? 0)}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <KPICard
          title="National Median Basket"
          value={formatCurrency(latest?.avgBasketValue_Median ?? 0)}
          icon={<Target className="w-4 h-4" />}
        />
        <KPICard
          title="CW Retention"
          value={formatPercentRaw(latest?.retentionRate_YourStore ?? 0)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          title="Basket Ranking"
          value={basketTier?.label ?? '\u2014'}
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* ============================================================ */}
      {/*  Tier Comparison Cards                                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { title: 'Avg Basket Value', yours: latest?.avgBasketValue_YourStore, median: latest?.avgBasketValue_Median, p75: latest?.avgBasketValue_P75, format: formatCurrency },
          { title: 'Retention Rate', yours: latest?.retentionRate_YourStore, median: latest?.retentionRate_Median, p75: latest?.retentionRate_P75, format: (v: number) => formatPercentRaw(v) },
          { title: 'Visits / Customer', yours: latest?.visitsPerCustomer_YourStore, median: latest?.visitsPerCustomer_Median, p75: latest?.visitsPerCustomer_P75, format: (v: number) => v.toFixed(1) },
        ].map((metric) => {
          const tier = metric.yours != null && metric.median != null && metric.p75 != null
            ? getTier(metric.yours, metric.median, metric.p75) : null
          return (
            <div key={metric.title} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">{metric.title}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metric.yours != null ? metric.format(metric.yours) : '\u2014'}</p>
                  <p className="text-xs text-slate-400 mt-1">Median: {metric.median != null ? metric.format(metric.median) : '\u2014'}</p>
                </div>
                {tier && (
                  <span className={`text-sm font-semibold ${tier.color}`}>{tier.label}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ============================================================ */}
      {/*  Existing Benchmark Charts (with descriptions)               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">

        {/* --- Avg Basket Value --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700">Avg Basket Value \u2014 CW Network vs National</h3>
          <ChartDescription>
            Tracks CW's average transaction value against national pharmacy percentiles (P25, Median, P75).
            CW consistently outperforms the median \u2014 driven by a broader product range, competitive pricing on OTC staples,
            and strong cross-selling in vitamins and personal care. Look for seasonal lifts during winter cold/flu
            and December gifting periods.
          </ChartDescription>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={basketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="P25" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" />
              <Line type="monotone" dataKey="Median" stroke="#64748b" strokeWidth={1.5} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={150} />
              <Line type="monotone" dataKey="P75" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
              <Line type="monotone" dataKey="CW Network" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Retention Rate --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700">Retention Rate \u2014 CW Network vs National</h3>
          <ChartDescription>
            Measures the percentage of shoppers returning within 90 days. CW retention benefits from a well-structured
            loyalty program, convenient store locations, and strong price perception relative to competitors.
            A widening gap above the median signals that CW is winning the "habit loop" \u2014 customers are choosing
            CW as their default pharmacy rather than shopping around.
          </ChartDescription>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="P25" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" />
              <Line type="monotone" dataKey="Median" stroke="#64748b" strokeWidth={1.5} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={150} />
              <Line type="monotone" dataKey="P75" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
              <Line type="monotone" dataKey="CW Network" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Visits Per Customer --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700">Visits Per Customer \u2014 CW Network vs National</h3>
          <ChartDescription>
            Average annual visits per customer. CW's above-median frequency reflects its positioning as a destination
            for both scripts and retail \u2014 shoppers come for prescriptions but stay for everyday health, beauty, and
            wellness. Higher visit frequency also creates more cross-sell opportunities and deepens brand loyalty.
          </ChartDescription>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="P25" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" />
              <Line type="monotone" dataKey="Median" stroke="#64748b" strokeWidth={1.5} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={150} />
              <Line type="monotone" dataKey="P75" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
              <Line type="monotone" dataKey="CW Network" stroke="var(--color-chart-5)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  NEW: What's in the CW Basket?                                */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
        <div className="flex items-center gap-2 mb-0.5">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-slate-700">What's in the CW Basket?</h3>
        </div>
        <ChartDescription>
          Breakdown of the top 10 product categories by network revenue. This reveals the composition of a typical
          CW basket and where the revenue centre of gravity sits. Prescription and OTC medicines anchor the basket,
          while vitamins, beauty, and personal care act as high-margin cross-sell drivers.
          Categories with strong cross-sell rates indicate natural bundle opportunities for promotional strategy.
        </ChartDescription>

        {basketComposition.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal bar chart */}
            <div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={basketComposition}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]?.payload
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                          <p className="font-semibold text-slate-700 mb-1">{d.category}</p>
                          <p className="text-slate-500">Revenue share: <span className="font-medium text-slate-800">{d.pctOfBasket.toFixed(1)}%</span></p>
                          <p className="text-slate-500">Network revenue: <span className="font-medium text-slate-800">{formatCompact(d.revenue)}</span></p>
                          <p className="text-slate-500">Avg items/basket: <span className="font-medium text-slate-800">{d.avgItems.toFixed(1)}</span></p>
                          <p className="text-slate-500">Cross-sell rate: <span className="font-medium text-slate-800">{(d.crossSellRate * 100).toFixed(0)}%</span></p>
                          <p className="text-slate-500">Top pair: <span className="font-medium text-slate-800">{d.topPair}</span></p>
                        </div>
                      )
                    }}
                  />
                  <Bar
                    dataKey="pctOfBasket"
                    fill="var(--color-chart-1)"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-3 font-semibold text-slate-600">Category</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-600">Revenue</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-600">% Share</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-600">Items/Basket</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-600">Growth</th>
                    <th className="text-left py-2 pl-2 font-semibold text-slate-600">Top Pair</th>
                  </tr>
                </thead>
                <tbody>
                  {basketComposition.map((c, i) => (
                    <tr key={c.category} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                      <td className="py-1.5 pr-3 font-medium text-slate-700">{c.category}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{formatCompact(c.revenue)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{c.pctOfBasket.toFixed(1)}%</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{c.avgItems.toFixed(1)}</td>
                      <td className={`py-1.5 px-2 text-right font-medium ${c.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {c.growth >= 0 ? '+' : ''}{(c.growth * 100).toFixed(1)}%
                      </td>
                      <td className="py-1.5 pl-2 text-slate-500">{c.topPair}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400 mt-2">
                Network revenue scaled from sample data ({'\u00D7'}{formatCompact(networkScale)} factor).
                Total network revenue: {formatCompact(totalNetworkRevenue)}.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Category data not yet loaded.</p>
        )}
      </div>

      {/* ============================================================ */}
      {/*  NEW: Interest Rate vs Consumer Spend                         */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
        <div className="flex items-center gap-2 mb-0.5">
          <Landmark className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-slate-700">RBA Cash Rate vs CW Consumer Spend Index</h3>
        </div>
        <ChartDescription>
          As the RBA held rates at 4.35% through mid-2025 before cutting to 4.10% in February 2026, CW network spend
          showed resilience with a slight dip in discretionary categories (beauty, fragrance) but stability in
          essentials (OTC, prescription). The rate cut in February coincided with an uptick in discretionary spend,
          suggesting early consumer confidence recovery. The "Essential Index" (green) remains structurally insulated
          from rate movements, while the "Discretionary Index" (amber) is the most rate-sensitive line to watch.
        </ChartDescription>

        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={interestRateData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            {/* Left axis: Spend Index */}
            <YAxis
              yAxisId="spend"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              domain={[88, 115]}
              label={{ value: 'Spend Index (100 = base)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8' }, offset: 10 }}
            />
            {/* Right axis: Interest Rate */}
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              domain={[3.8, 4.6]}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              label={{ value: 'RBA Cash Rate %', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#94a3b8' }, offset: 10 }}
            />
            <Tooltip content={<RateSpendTooltip />} />
            <Legend />

            {/* Reference line for rate cut */}
            <ReferenceLine
              yAxisId="spend"
              x="Feb 26"
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'RBA Rate Cut', position: 'top', style: { fontSize: 10, fill: '#6366f1', fontWeight: 600 } }}
            />

            {/* RBA Rate as area with step */}
            <Area
              yAxisId="rate"
              type="stepAfter"
              dataKey="rbaRate"
              name="RBA Cash Rate"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* CW Overall Spend */}
            <Line
              yAxisId="spend"
              type="monotone"
              dataKey="cwSpend"
              name="CW Total Spend"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              animationDuration={1200}
              animationEasing="ease-out"
              animationBegin={200}
            />

            {/* Discretionary */}
            <Line
              yAxisId="spend"
              type="monotone"
              dataKey="discretionary"
              name="Discretionary (Beauty, Fragrance)"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2.5 }}
              animationDuration={1200}
              animationEasing="ease-out"
              animationBegin={400}
            />

            {/* Essential */}
            <Line
              yAxisId="spend"
              type="monotone"
              dataKey="essential"
              name="Essentials (OTC, Scripts)"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2.5 }}
              animationDuration={1200}
              animationEasing="ease-out"
              animationBegin={600}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Key insights callout */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-indigo-50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase mb-1">Rate-Sensitive Signal</p>
            <p className="text-xs text-indigo-800">
              Discretionary categories dropped ~5% during the rate-hold period (Apr-Jan), with beauty and fragrance
              most affected as households trimmed non-essential spending.
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1">Essentials Resilience</p>
            <p className="text-xs text-emerald-800">
              The essential index stayed above 100 throughout, peaking at 111 during cold/flu season.
              Pharmacy essentials remain structurally insulated from monetary policy changes.
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1">Post-Cut Recovery</p>
            <p className="text-xs text-amber-800">
              The Feb 2026 rate cut to 4.10% coincided with discretionary spend rebounding to 99+.
              If further cuts materialise, expect beauty and wellness categories to recover first.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  NEW: Basket Value Trend with Annotations                     */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
        <div className="flex items-center gap-2 mb-0.5">
          <TrendingDown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-slate-700">Basket Value Trend \u2014 Annotated</h3>
        </div>
        <ChartDescription>
          Average basket value over 12 months with contextual annotations explaining the drivers behind each movement.
          Hover over any data point to see what was influencing basket size at that moment \u2014 from seasonal
          health needs (cold/flu, allergies) to macro events (RBA rate decisions) and retail calendar events
          (Christmas gifting). Understanding these drivers is critical for promotional planning and ranging decisions.
        </ChartDescription>

        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={basketValueAnnotated} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="basketGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              domain={[38, 50]}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip content={<BasketTrendTooltip />} />

            {/* Key event reference lines */}
            <ReferenceLine
              x="Jun 25"
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Cold/flu season', position: 'top', style: { fontSize: 9, fill: '#10B981' } }}
            />
            <ReferenceLine
              x="Dec 25"
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Holiday peak', position: 'top', style: { fontSize: 9, fill: '#F59E0B' } }}
            />
            <ReferenceLine
              x="Feb 26"
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'RBA cut', position: 'top', style: { fontSize: 9, fill: '#6366f1' } }}
            />

            <Area
              type="monotone"
              dataKey="value"
              fill="url(#basketGradient)"
              stroke="none"
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Avg Basket Value"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-chart-1)', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Seasonal pattern summary */}
        <div className="mt-4 bg-slate-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Seasonal Patterns at a Glance</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="font-medium text-emerald-600">Jun\u2013Aug: Cold & Flu</p>
              <p className="text-slate-500">Basket peaks at ~$46 as OTC cough/cold, tissues, and vitamins drive multi-item transactions.</p>
            </div>
            <div>
              <p className="font-medium text-amber-600">Oct\u2013Nov: Spring Allergy + Pre-Xmas</p>
              <p className="text-slate-500">Allergy relief provides a mild lift; gifting sets (fragrance, beauty) enter baskets from November.</p>
            </div>
            <div>
              <p className="font-medium text-red-500">Dec: Holiday Peak</p>
              <p className="text-slate-500">Highest basket of the year ($46.50) driven by gift sets, suncare, and travel health kits.</p>
            </div>
            <div>
              <p className="font-medium text-indigo-600">Jan\u2013Feb: Post-Holiday Reset</p>
              <p className="text-slate-500">Basket dips to ~$42 as discretionary spend contracts. February rate cut aids recovery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
