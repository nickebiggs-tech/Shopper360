import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ScatterChart, Scatter, ZAxis,
  PieChart, Pie,
} from 'recharts'
import {
  Factory, TrendingUp, Package, DollarSign, ChevronDown, Users,
  Lightbulb, Store, Monitor, ShoppingBag, Target, ShieldCheck,
  ArrowRight, Megaphone, BarChart3, Heart,
} from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { PersonaPanel } from '../../components/ui/PersonaPanel'
import { formatCurrency, formatCurrencyDecimal, formatCompact, formatNumber } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Supplier, Customer } from '../../data/types'

const COLORS = ['#0A8BA8', '#10B39B', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4', '#E11D48', '#7C3AED', '#D97706', '#0284C7']

export function SupplierInsightsPage() {
  const { state, networkScale } = useData()
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  const suppliers = state.suppliers
  const totalMarketValue = useMemo(() => suppliers.reduce((s, sup) => s + sup.totalTYValue, 0), [suppliers])
  const totalCWRev = useMemo(() => suppliers.reduce((s, sup) => s + sup.yourStoreRevenue, 0), [suppliers])
  const avgGrowth = useMemo(() => {
    const sum = suppliers.reduce((s, sup) => s + sup.yoyGrowth, 0)
    return sum / (suppliers.length || 1)
  }, [suppliers])

  const marketShareData = useMemo(() =>
    suppliers.map((s) => ({
      name: s.mfrName.length > 15 ? s.mfrName.slice(0, 15) + '...' : s.mfrName,
      fullName: s.mfrName,
      share: s.mfrMarketSharePct,
      value: s.totalTYValue,
    })),
    [suppliers],
  )

  const growthData = useMemo(() =>
    [...suppliers]
      .sort((a, b) => b.yoyGrowth - a.yoyGrowth)
      .map((s) => ({
        name: s.mfrName.length > 15 ? s.mfrName.slice(0, 15) + '...' : s.mfrName,
        growth: s.yoyGrowth,
      })),
    [suppliers],
  )

  const scatterData = useMemo(() =>
    suppliers.map((s) => ({
      name: s.mfrName,
      share: s.mfrMarketSharePct,
      growth: s.yoyGrowth,
      revenue: s.totalTYValue,
    })),
    [suppliers],
  )

  const cwShareVsNational = useMemo(() =>
    suppliers.map((s) => ({
      name: s.mfrName.length > 12 ? s.mfrName.slice(0, 12) + '...' : s.mfrName,
      national: s.mfrMarketSharePct,
      cwNetwork: s.yourStoreShare,
    })),
    [suppliers],
  )

  const activeSupplier = useMemo(() =>
    suppliers.find((s) => s.mfrName === selectedSupplier) ?? null,
    [suppliers, selectedSupplier],
  )

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Supplier Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Key supplier performance, market share, and CW network alignment with top manufacturers.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard title="Top 15 Market Value" value={formatCompact(totalMarketValue)} icon={<Factory className="w-4 h-4" />} />
        <KPICard title="CW Network Revenue" value={formatCurrency(totalCWRev)} icon={<DollarSign className="w-4 h-4" />} />
        <KPICard title="Avg YoY Growth" value={`${avgGrowth.toFixed(1)}%`} delta={avgGrowth} icon={<TrendingUp className="w-4 h-4" />} />
        <KPICard title="Suppliers Tracked" value={String(suppliers.length)} icon={<Package className="w-4 h-4" />} />
      </div>

      {/* Supplier Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-slate-700">Select Supplier to View Shopper Personas</label>
          </div>
          <div className="relative flex-1 sm:max-w-sm">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              <option value="">Choose a supplier...</option>
              {suppliers.map((s) => (
                <option key={s.mfrName} value={s.mfrName}>{s.mfrName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Selected supplier detail + persona */}
        {activeSupplier && (
          <SupplierPersonaView supplier={activeSupplier} customers={state.customers} networkScale={networkScale} />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Market Share Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Market Share (%) — Top 15 Consumer Health</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={marketShareData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={110} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as typeof marketShareData[number]
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p>Market Share: {d.share}%</p>
                      <p>Total Value: {formatCompact(d.value)}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="share" radius={[0, 6, 6, 0]} animationDuration={800}>
                {marketShareData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth vs Share Scatter */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Growth vs Market Share</h3>
          <p className="text-xs text-slate-400 mb-3">Bubble size = total revenue. Top-right = strong & growing.</p>
          <ResponsiveContainer width="100%" height={370}>
            <ScatterChart margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="share" name="Market Share %" tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: 'Market Share %', position: 'insideBottom', offset: -5, fontSize: 11 }} />
              <YAxis dataKey="growth" name="YoY Growth %" tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: 'YoY Growth %', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis dataKey="revenue" range={[60, 500]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as typeof scatterData[number]
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.name}</p>
                      <p>Share: {d.share}% | Growth: {d.growth}%</p>
                      <p>Revenue: {formatCompact(d.revenue)}</p>
                    </div>
                  )
                }}
              />
              <Scatter data={scatterData} animationDuration={1000}>
                {scatterData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* YoY Growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Year-on-Year Growth (%)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={growthData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={110} />
              <Tooltip />
              <Bar dataKey="growth" radius={[0, 6, 6, 0]} animationDuration={800}>
                {growthData.map((d, i) => (
                  <Cell key={i} fill={d.growth >= 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CW Network vs National Share */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">CW Network Share vs National Share</h3>
          <p className="text-xs text-slate-400 mb-3">Compare CW network's supplier mix to the national average.</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cwShareVsNational} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
              <Tooltip />
              <Bar dataKey="national" fill="#94a3b8" name="National %" radius={[0, 4, 4, 0]} animationDuration={800} />
              <Bar dataKey="cwNetwork" fill="var(--color-chart-1)" name="CW Network %" radius={[0, 4, 4, 0]} animationDuration={800} animationBegin={200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Supplier Persona View ─────────────────── */

const LIFE_STAGE_COLORS: Record<string, string> = {
  'Young Adult': '#8B5CF6',
  'Young Family': '#EC4899',
  'Established Family': '#3B82F6',
  'Empty Nester': '#F59E0B',
  'Retiree': '#EF4444',
  'Mature Singles': '#10B981',
}

const CHANNEL_ICONS: Record<string, typeof Store> = {
  'In-Store': Store,
  'Online': Monitor,
  'Click & Collect': ShoppingBag,
}

function SupplierPersonaView({ supplier, customers, networkScale }: { supplier: Supplier; customers: Customer[]; networkScale: number }) {
  const scaleN = (n: number) => Math.round(n * networkScale)
  const shareGap = supplier.yourStoreShare - supplier.mfrMarketSharePct
  const isOverIndex = shareGap > 0
  const isUnderIndex = shareGap < -0.3

  // Filter customers who buy in this supplier's categories
  const supplierCustomers = useMemo(() => {
    const cats = new Set(supplier.topCategories)
    return customers.filter((c) =>
      cats.has(c.topCategory) || cats.has(c.secondCategory) || cats.has(c.thirdCategory)
    )
  }, [supplier.topCategories, customers])

  // Persona analytics for investment recs
  const analytics = useMemo(() => {
    const custs = supplierCustomers
    const count = custs.length
    if (count === 0) return null

    // Life stage breakdown
    const lifeStages: Record<string, number> = {}
    custs.forEach((c) => { lifeStages[c.lifeStage] = (lifeStages[c.lifeStage] || 0) + 1 })
    const lifeStageSorted = Object.entries(lifeStages)
      .map(([name, value]) => ({ name, value, pct: (value / count) * 100 }))
      .sort((a, b) => b.value - a.value)

    // Channel split
    const channels: Record<string, number> = {}
    custs.forEach((c) => { channels[c.preferredChannel] = (channels[c.preferredChannel] || 0) + 1 })
    const channelSorted = Object.entries(channels)
      .map(([name, value]) => ({ name, value, pct: (value / count) * 100 }))
      .sort((a, b) => b.value - a.value)

    // Cross-shopping
    const crossShop: Record<string, number> = {}
    custs.forEach((c) => {
      if (c.crossShopRetailer && c.crossShopRetailer !== 'None')
        crossShop[c.crossShopRetailer] = (crossShop[c.crossShopRetailer] || 0) + 1
    })
    const crossShopSorted = Object.entries(crossShop)
      .map(([name, value]) => ({ name, value, pct: (value / count) * 100 }))
      .sort((a, b) => b.value - a.value)

    // Health-conscious %
    const healthPct = (custs.filter((c) => c.healthConscious === 'Y').length / count) * 100

    // Avg metrics
    const avgBasket = custs.reduce((s, c) => s + c.avgBasketValue, 0) / count
    const avgSoW = custs.reduce((s, c) => s + c.shareOfWallet, 0) / count
    const avgVisits = custs.reduce((s, c) => s + c.totalVisits, 0) / count
    const avgGrocery = custs.reduce((s, c) => s + c.avgMonthlyGrocerySpend, 0) / count
    const inStorePct = (custs.filter((c) => c.preferredChannel === 'In-Store').length / count) * 100
    const onlinePct = (custs.filter((c) => c.preferredChannel === 'Online').length / count) * 100

    // Segment breakdown
    const segments: Record<string, number> = {}
    custs.forEach((c) => { segments[c.segment] = (segments[c.segment] || 0) + 1 })
    const topSegment = Object.entries(segments).sort((a, b) => b[1] - a[1])[0]

    // Category adjacencies (what else they buy beyond this supplier's cats)
    const adjacentCats: Record<string, number> = {}
    const supplierCats = new Set(supplier.topCategories)
    custs.forEach((c) => {
      ;[c.topCategory, c.secondCategory, c.thirdCategory].forEach((cat) => {
        if (cat && !supplierCats.has(cat)) {
          adjacentCats[cat] = (adjacentCats[cat] || 0) + 1
        }
      })
    })
    const adjacentSorted = Object.entries(adjacentCats)
      .map(([name, value]) => ({ name, value, pct: (value / count) * 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      count,
      lifeStageSorted,
      channelSorted,
      crossShopSorted,
      healthPct,
      avgBasket,
      avgSoW,
      avgVisits,
      avgGrocery,
      inStorePct,
      onlinePct,
      topSegment: topSegment ? { name: topSegment[0], count: topSegment[1] } : null,
      adjacentSorted,
    }
  }, [supplierCustomers, supplier.topCategories])

  // Generate investment recommendations
  const investmentRecs = useMemo(() => {
    if (!analytics) return []
    const recs: { title: string; icon: typeof Lightbulb; color: string; narrative: string; priority: 'high' | 'medium' | 'low' }[] = []
    const name = supplier.mfrName

    // 1. Channel investment allocation
    const channelRec = analytics.channelSorted[0]
    if (channelRec) {
      if (analytics.inStorePct > 60) {
        recs.push({
          title: 'In-Store Merchandising',
          icon: Store,
          color: '#0A8BA8',
          narrative: `**${analytics.inStorePct.toFixed(0)}%** of ${name} shoppers prefer in-store. Invest in **endcap displays**, gondola-end promotions, and shelf-talkers in ${supplier.topCategories[0]} aisle. Consider in-store sampling events — CBA data shows these shoppers have avg grocery spend of **${formatCurrencyDecimal(analytics.avgGrocery)}/month**, indicating high foot traffic value.`,
          priority: 'high',
        })
      } else if (analytics.onlinePct > 35) {
        recs.push({
          title: 'Digital-First Strategy',
          icon: Monitor,
          color: '#3B82F6',
          narrative: `**${analytics.onlinePct.toFixed(0)}%** of ${name} shoppers are digital-first. Invest in **CW online banner ads**, sponsored product listings, and email inclusion in health & wellness newsletters. Optimise product imagery and descriptions for the CW app/website — these shoppers convert well with targeted digital offers.`,
          priority: 'high',
        })
      } else {
        recs.push({
          title: 'Omnichannel Activation',
          icon: ShoppingBag,
          color: '#8B5CF6',
          narrative: `${name} shoppers are split across channels (${analytics.channelSorted.map((c) => `${c.name}: ${c.pct.toFixed(0)}%`).join(', ')}). Invest in an **omnichannel strategy** — in-store displays paired with CW app push notifications and online promotions to capture shoppers wherever they prefer to buy.`,
          priority: 'high',
        })
      }
    }

    // 2. Life stage targeting
    const topLS = analytics.lifeStageSorted[0]
    const secondLS = analytics.lifeStageSorted[1]
    if (topLS) {
      const narrativeMap: Record<string, string> = {
        'Young Adult': `Your core shopper is the **Young Adult** (${topLS.pct.toFixed(0)}%) — trend-driven, digitally savvy, responsive to social media and influencer marketing. Invest in **CW social media collaborations**, student/young professional pricing, and eye-catching packaging that stands out on shelf and in Instagram feeds.`,
        'Young Family': `Your core shopper is the **Young Family** (${topLS.pct.toFixed(0)}%) — high-frequency buyers focused on health, baby care, and household essentials. Invest in **family bundle deals**, loyalty point multipliers, and cross-merchandising with baby & personal care. CBA data shows avg basket of **${formatCurrencyDecimal(analytics.avgBasket)}**.`,
        'Established Family': `Your core shopper is the **Established Family** (${topLS.pct.toFixed(0)}%) — brand-loyal, mid-high basket value. Invest in **value packs**, loyalty rewards, and seasonal promotions. These families respond well to trusted brand positioning and health education campaigns.`,
        'Empty Nester': `Your core shopper is the **Empty Nester** (${topLS.pct.toFixed(0)}%) — premium health & wellness buyer with high disposable income. Invest in **premium product placement**, health consultation partnerships, and wellness event sponsorships at CW stores. Avg grocery spend: **${formatCurrencyDecimal(analytics.avgGrocery)}/month**.`,
        'Retiree': `Your core shopper is the **Retiree** (${topLS.pct.toFixed(0)}%) — consistent, loyal buyer focused on health maintenance. Invest in **clear product information**, pharmacist recommendation programs, and loyalty benefits. In-store engagement is critical — ${analytics.inStorePct.toFixed(0)}% shop in-store.`,
        'Mature Singles': `Your core shopper is the **Mature Singles** (${topLS.pct.toFixed(0)}%) — independent, self-care focused, often brand explorers. Invest in **trial-size options**, singles-friendly pack sizes, and wellness/self-improvement themed merchandising. This cohort responds well to "treat yourself" messaging.`,
      }
      recs.push({
        title: 'Target Life Stage',
        icon: Users,
        color: LIFE_STAGE_COLORS[topLS.name] || '#3B82F6',
        narrative: narrativeMap[topLS.name] || `**${topLS.name}** represents ${topLS.pct.toFixed(0)}% of ${name} shoppers${secondLS ? `, followed by ${secondLS.name} (${secondLS.pct.toFixed(0)}%)` : ''}. Tailor merchandising and promotional messaging to this life stage.`,
        priority: 'high',
      })
    }

    // 3. Cross-shopping defence
    const topCompetitor = analytics.crossShopSorted[0]
    if (topCompetitor && topCompetitor.pct > 10) {
      recs.push({
        title: 'Competitive Defence',
        icon: ShieldCheck,
        color: '#EF4444',
        narrative: `CBA card data shows **${topCompetitor.pct.toFixed(0)}%** of ${name} shoppers also buy at **${topCompetitor.name}** (${formatNumber(scaleN(topCompetitor.value))} shoppers). Invest in **CW-exclusive SKUs or pack sizes**, competitive price matching on key products, and loyalty point incentives on ${supplier.topCategories[0]} to reduce switching.`,
        priority: topCompetitor.pct > 20 ? 'high' : 'medium',
      })
    }

    // 4. Health-conscious opportunity
    if (analytics.healthPct > 40) {
      recs.push({
        title: 'Wellness Positioning',
        icon: Heart,
        color: '#EC4899',
        narrative: `**${analytics.healthPct.toFixed(0)}%** of ${name} shoppers are health-conscious. Invest in **"clean label" callouts**, wellness-focused shelf branding, and CW pharmacist recommendation programs. Consider sponsoring CW health events or wellness content — this audience indexes 1.4x on supplement spend.`,
        priority: 'medium',
      })
    }

    // 5. Share of wallet growth
    if (analytics.avgSoW < 45) {
      recs.push({
        title: 'Share of Wallet Growth',
        icon: Target,
        color: '#F59E0B',
        narrative: `${name} shoppers only give CW **${analytics.avgSoW.toFixed(0)}% share of wallet** — significant upside. Invest in **cross-category bundling** (pair ${supplier.topCategories[0]} with ${analytics.adjacentSorted[0]?.name || 'complementary categories'}), loyalty point multiplier promotions, and range expansion to capture more of the **${formatCurrencyDecimal(analytics.avgBasket * 12 * (100 / analytics.avgSoW))}** annual pharmacy spend per shopper.`,
        priority: analytics.avgSoW < 35 ? 'high' : 'medium',
      })
    }

    // 6. Category adjacency / cross-sell
    if (analytics.adjacentSorted.length > 0) {
      const top3Adjacent = analytics.adjacentSorted.slice(0, 3)
      recs.push({
        title: 'Cross-Category Bundling',
        icon: Package,
        color: '#6366F1',
        narrative: `${name} shoppers also purchase **${top3Adjacent.map((a) => a.name).join(', ')}** at CW. Create **cross-merchandising displays** and bundle offers pairing ${supplier.topCategories[0]} with these adjacent categories. Example: "${supplier.topCategories[0]} + ${top3Adjacent[0]!.name} combo save" — drives basket size and locks in multi-category loyalty.`,
        priority: 'medium',
      })
    }

    // 7. Under-indexed growth
    if (isUnderIndex) {
      recs.push({
        title: 'Range Expansion',
        icon: BarChart3,
        color: '#0284C7',
        narrative: `CW is **under-indexed by ${Math.abs(shareGap).toFixed(1)}pp** vs national on ${name}. Invest in **expanding product range** (currently ${formatNumber(supplier.productCount)} SKUs) — add trending products, introduce new pack sizes, and negotiate better shelf space in ${supplier.topCategories.slice(0, 2).join(' & ')}. Potential incremental revenue: **${formatCompact(supplier.totalTYValue * Math.abs(shareGap) / 100)}**.`,
        priority: 'high',
      })
    }

    // 8. Promotional strategy
    recs.push({
      title: 'Promotional Calendar',
      icon: Megaphone,
      color: '#D97706',
      narrative: `With **${formatNumber(scaleN(analytics.count))} shoppers** and avg **${analytics.avgVisits.toFixed(1)} visits/year**, ${name} should invest in **quarterly CW promotional bursts** — catalogue features, CW app spotlight deals, and in-store POS materials. Peak invest around seasonal health events (flu season for OTC, New Year for wellness, Back to School for family health).`,
      priority: 'low',
    })

    return recs
  }, [analytics, supplier, isUnderIndex, shareGap, networkScale])

  // Life stage pie data for mini chart
  const lifeStageChartData = analytics?.lifeStageSorted.map((ls) => ({
    name: ls.name,
    value: ls.value,
    pct: ls.pct.toFixed(0),
  })) || []

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in space-y-5">
      {/* Supplier Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <p className="text-xs text-slate-500">National Value</p>
          <p className="text-sm font-bold text-slate-900">{formatCompact(supplier.totalTYValue)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Products</p>
          <p className="text-sm font-bold text-slate-900">{formatNumber(supplier.productCount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Avg Price</p>
          <p className="text-sm font-bold text-slate-900">${supplier.avgPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">CW Revenue</p>
          <p className="text-sm font-bold text-primary">{formatCurrency(supplier.yourStoreRevenue)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Share Gap</p>
          <p className={cn('text-sm font-bold', isOverIndex ? 'text-emerald-600' : isUnderIndex ? 'text-red-600' : 'text-slate-700')}>
            {shareGap > 0 ? '+' : ''}{shareGap.toFixed(1)}pp {isOverIndex ? '(over-indexed)' : isUnderIndex ? '(under-indexed)' : '(aligned)'}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">Key Categories</p>
        <div className="flex flex-wrap gap-1.5">
          {supplier.topCategories.map((cat) => (
            <span key={cat} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {isUnderIndex && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <strong>Opportunity:</strong> CW network is under-indexed on {supplier.mfrName} by {Math.abs(shareGap).toFixed(1)}pp.
          Consider expanding their product range in {supplier.topCategories[0]} and {supplier.topCategories[1] || supplier.topCategories[0]} to capture additional revenue.
        </div>
      )}
      {isOverIndex && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
          <strong>Strong performer:</strong> CW network over-indexes on {supplier.mfrName} by +{shareGap.toFixed(1)}pp vs national.
          This supplier is a key traffic driver — protect with good shelf placement and promotional support.
        </div>
      )}

      {/* ─── Who Buys This Supplier's Products? ─── */}
      {analytics && analytics.count > 0 && (
        <>
          {/* Quick Shopper Snapshot */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/[0.02] border border-primary/20 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Who Buys {supplier.mfrName}?
              <span className="text-xs font-normal text-slate-400 ml-1">({formatNumber(scaleN(analytics.count))} CW shoppers)</span>
            </h3>

            {/* Snapshot grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Primary Life Stage</p>
                <p className="text-sm font-bold" style={{ color: LIFE_STAGE_COLORS[analytics.lifeStageSorted[0]?.name || ''] || '#334155' }}>
                  {analytics.lifeStageSorted[0]?.name || '—'}
                </p>
                <p className="text-[10px] text-slate-400">{analytics.lifeStageSorted[0]?.pct.toFixed(0)}% of shoppers</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Avg Basket</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrencyDecimal(analytics.avgBasket)}</p>
                <p className="text-[10px] text-slate-400">{analytics.avgVisits.toFixed(1)} visits/yr</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Share of Wallet</p>
                <p className={cn('text-sm font-bold', analytics.avgSoW > 50 ? 'text-emerald-600' : analytics.avgSoW < 35 ? 'text-red-600' : 'text-amber-600')}>
                  {analytics.avgSoW.toFixed(0)}%
                </p>
                <p className="text-[10px] text-slate-400">at CW network</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Health-Conscious</p>
                <p className="text-sm font-bold text-pink-600">{analytics.healthPct.toFixed(0)}%</p>
                <p className="text-[10px] text-slate-400">wellness-focused</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Top Channel</p>
                <p className="text-sm font-bold text-slate-900">{analytics.channelSorted[0]?.name || '—'}</p>
                <p className="text-[10px] text-slate-400">{analytics.channelSorted[0]?.pct.toFixed(0)}% preference</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[10px] text-slate-500">Top Competitor</p>
                <p className="text-sm font-bold text-red-600">{analytics.crossShopSorted[0]?.name || 'None'}</p>
                <p className="text-[10px] text-slate-400">{analytics.crossShopSorted[0]?.pct.toFixed(0) || 0}% cross-shop</p>
              </div>
            </div>

            {/* Mini life stage & channel visuals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Life stage mini-pie */}
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold text-slate-600 mb-1">Life Stage Split</p>
                <div className="flex items-center gap-3">
                  <div className="w-[100px] h-[100px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={lifeStageChartData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={2} dataKey="value" cornerRadius={2}>
                          {lifeStageChartData.map((entry) => (
                            <Cell key={entry.name} fill={LIFE_STAGE_COLORS[entry.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1">
                    {analytics.lifeStageSorted.slice(0, 4).map((ls) => (
                      <div key={ls.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: LIFE_STAGE_COLORS[ls.name] || '#94a3b8' }} />
                        <span className="text-[10px] text-slate-600 flex-1 truncate">{ls.name}</span>
                        <span className="text-[10px] font-semibold text-slate-700">{ls.pct.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Channel split bars */}
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold text-slate-600 mb-2">Channel Preference</p>
                <div className="space-y-2">
                  {analytics.channelSorted.map((ch) => {
                    const Icon = CHANNEL_ICONS[ch.name] || Store
                    return (
                      <div key={ch.name} className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-600 w-20 truncate">{ch.name}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all duration-500"
                            style={{ width: `${ch.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 w-8 text-right">{ch.pct.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
                {analytics.adjacentSorted.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 mb-1">Also buys at CW:</p>
                    <div className="flex flex-wrap gap-1">
                      {analytics.adjacentSorted.slice(0, 4).map((a) => (
                        <span key={a.name} className="px-1.5 py-0.5 bg-primary/5 rounded text-[9px] text-primary font-medium">
                          {a.name} ({a.pct.toFixed(0)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Investment Recommendations ─── */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              What Should {supplier.mfrName} Invest In?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Data-driven recommendations to grow {supplier.mfrName} sales through the CW network
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investmentRecs.map((rec, idx) => {
                const Icon = rec.icon
                return (
                  <div
                    key={rec.title}
                    className="bg-white rounded-xl border border-slate-200 p-4 chart-card animate-fade-in-up hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: rec.color + '15' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: rec.color }} />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 flex-1">{rec.title}</h4>
                      <span className={cn(
                        'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                        rec.priority === 'high' ? 'bg-red-50 text-red-600' :
                        rec.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-500'
                      )}>
                        {rec.priority}
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-slate-600 leading-relaxed [&_strong]:text-slate-900 [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: rec.narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Summary action bar */}
            <div className="mt-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Summary</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed flex-1">
                {supplier.mfrName} reaches <strong>{formatNumber(scaleN(analytics.count))}</strong> CW shoppers — primarily <strong>{analytics.lifeStageSorted[0]?.name}</strong> ({analytics.lifeStageSorted[0]?.pct.toFixed(0)}%) with <strong>{formatCurrencyDecimal(analytics.avgBasket)}</strong> avg basket and <strong>{analytics.avgSoW.toFixed(0)}%</strong> CW share of wallet.
                {isUnderIndex ? ` CW is under-indexed by ${Math.abs(shareGap).toFixed(1)}pp — prioritise range expansion and shelf presence.` : ''}
                {analytics.crossShopSorted[0] ? ` Biggest competitor risk: ${analytics.crossShopSorted[0].name} (${analytics.crossShopSorted[0].pct.toFixed(0)}% cross-shop).` : ''}
                {analytics.healthPct > 50 ? ' Strong wellness alignment — lean into health positioning.' : ''}
              </p>
            </div>
          </div>

          {/* ─── Full Persona Drill-Down ─── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-slate-700">
                {supplier.mfrName} Full Shopper Persona
              </h3>
              <span className="text-xs text-slate-400">({formatNumber(scaleN(analytics.count))} shoppers)</span>
            </div>
            <PersonaPanel
              customers={supplierCustomers}
              title={`${supplier.mfrName} Shopper Profile`}
              compact={true}
              networkScale={networkScale}
            />
          </div>
        </>
      )}

      {supplierCustomers.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-400">
          No matching shoppers found for this supplier's categories
        </div>
      )}
    </div>
  )
}
