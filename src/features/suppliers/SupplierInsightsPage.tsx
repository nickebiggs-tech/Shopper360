import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { Factory, TrendingUp, Package, DollarSign, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { PersonaPanel } from '../../components/ui/PersonaPanel'
import { formatCurrency, formatCompact, formatNumber } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Supplier, Customer } from '../../data/types'

const COLORS = ['#0A8BA8', '#10B39B', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4', '#E11D48', '#7C3AED', '#D97706', '#0284C7']

export function SupplierInsightsPage() {
  const { state } = useData()
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null)

  const suppliers = state.suppliers
  const totalMarketValue = useMemo(() => suppliers.reduce((s, sup) => s + sup.totalTYValue, 0), [suppliers])
  const totalYourStoreRev = useMemo(() => suppliers.reduce((s, sup) => s + sup.yourStoreRevenue, 0), [suppliers])
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

  const yourShareVsNational = useMemo(() =>
    suppliers.map((s) => ({
      name: s.mfrName.length > 12 ? s.mfrName.slice(0, 12) + '...' : s.mfrName,
      national: s.mfrMarketSharePct,
      yourStore: s.yourStoreShare,
    })),
    [suppliers],
  )

  const toggleExpand = (name: string) => {
    setExpandedSupplier(expandedSupplier === name ? null : name)
  }

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Supplier Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Key supplier performance, market share, and your store's alignment with top manufacturers.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard title="Top 15 Market Value" value={formatCompact(totalMarketValue)} icon={<Factory className="w-4 h-4" />} />
        <KPICard title="Your Store Revenue" value={formatCurrency(totalYourStoreRev)} icon={<DollarSign className="w-4 h-4" />} />
        <KPICard title="Avg YoY Growth" value={`${avgGrowth.toFixed(1)}%`} delta={avgGrowth} icon={<TrendingUp className="w-4 h-4" />} />
        <KPICard title="Suppliers Tracked" value={String(suppliers.length)} icon={<Package className="w-4 h-4" />} />
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

        {/* Your Store vs National Share */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Your Share vs National Share</h3>
          <p className="text-xs text-slate-400 mb-3">Compare your store's supplier mix to the national average.</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yourShareVsNational} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
              <Tooltip />
              <Bar dataKey="national" fill="#94a3b8" name="National %" radius={[0, 4, 4, 0]} animationDuration={800} />
              <Bar dataKey="yourStore" fill="var(--color-chart-1)" name="Your Store %" radius={[0, 4, 4, 0]} animationDuration={800} animationBegin={200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Cards with expandable details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Supplier Details & Product Ranges</h3>
        <div className="space-y-2">
          {suppliers.map((sup, idx) => (
            <div key={sup.mfrName} className="bg-white rounded-xl border border-slate-200 overflow-hidden chart-card">
              <button
                onClick={() => toggleExpand(sup.mfrName)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                >
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{sup.mfrName}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{sup.mfrMarketSharePct}% market share</span>
                    <span className={sup.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {sup.yoyGrowth > 0 ? '+' : ''}{sup.yoyGrowth}% YoY
                    </span>
                    <span className="hidden sm:inline">{formatCompact(sup.totalTYValue)} total value</span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-primary">{formatCurrency(sup.yourStoreRevenue)}</p>
                  <p className="text-xs text-slate-400">your store</p>
                </div>
                {expandedSupplier === sup.mfrName ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {expandedSupplier === sup.mfrName && (
                <SupplierDetail supplier={sup} customers={state.customers} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SupplierDetail({ supplier, customers }: { supplier: Supplier; customers: Customer[] }) {
  const [showPersona, setShowPersona] = useState(false)
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

  return (
    <div className="border-t border-slate-200 p-4 bg-slate-50 animate-fade-in space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <span key={cat} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {isUnderIndex && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <strong>Opportunity:</strong> Your store is under-indexed on {supplier.mfrName} by {Math.abs(shareGap).toFixed(1)}pp.
          Consider expanding their product range in {supplier.topCategories[0]} and {supplier.topCategories[1] || supplier.topCategories[0]} to capture additional revenue.
        </div>
      )}
      {isOverIndex && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
          <strong>Strong performer:</strong> Your store over-indexes on {supplier.mfrName} by +{shareGap.toFixed(1)}pp vs national.
          This supplier is a key traffic driver — protect with good shelf placement and promotional support.
        </div>
      )}

      {/* Shopper Persona Toggle */}
      <button
        onClick={() => setShowPersona(!showPersona)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <Users className="w-3.5 h-3.5" />
        {showPersona ? 'Hide' : 'View'} {supplier.mfrName} Shopper Persona
        <span className="text-white/60 ml-1">({formatNumber(supplierCustomers.length)} shoppers)</span>
      </button>

      {showPersona && supplierCustomers.length > 0 && (
        <div className="mt-3 animate-fade-in-up">
          <PersonaPanel
            customers={supplierCustomers}
            title={`${supplier.mfrName} Shopper Profile`}
            compact={true}
          />
        </div>
      )}
    </div>
  )
}
