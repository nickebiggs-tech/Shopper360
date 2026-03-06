import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts'
import { ShoppingCart, TrendingUp, ArrowRightLeft, Package } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'

// CW brand-aligned palette: Navy, Red, Gold, Blue, Green, then supporting
const COLORS = ['#003B73', '#E30613', '#F7C600', '#0072CE', '#10B981', '#EC4899', '#F97316', '#8B5CF6', '#06B6D4', '#84CC16', '#003B73', '#E30613', '#7C3AED', '#D97706', '#0284C7']

export function BasketAnalysisPage() {
  const { state } = useData()

  const sortedByRevenue = useMemo(() =>
    [...state.categories].sort((a, b) => b.revenue - a.revenue),
    [state.categories],
  )

  const crossSellData = useMemo(() =>
    state.categories.map((c) => ({
      category: c.category,
      crossSellRate: c.crossSellRate,
      transactions: c.transactions,
      paired: c.topPairedCategory,
      revenue: c.revenue,
    })),
    [state.categories],
  )

  const avgItemsData = useMemo(() =>
    state.categories.map((c) => ({
      category: c.category.length > 12 ? c.category.slice(0, 12) + '...' : c.category,
      items: c.avgItemsPerBasket,
    })),
    [state.categories],
  )

  const totalRevenue = useMemo(() => state.categories.reduce((sum, c) => sum + c.revenue, 0), [state.categories])
  const totalTransactions = useMemo(() => state.categories.reduce((sum, c) => sum + c.transactions, 0), [state.categories])
  const avgCrossSell = useMemo(() => {
    const sum = state.categories.reduce((s, c) => s + c.crossSellRate, 0)
    return sum / (state.categories.length || 1)
  }, [state.categories])

  const growthData = useMemo(() =>
    [...state.categories]
      .sort((a, b) => b.growthRate - a.growthRate)
      .map((c) => ({
        category: c.category.length > 15 ? c.category.slice(0, 15) + '...' : c.category,
        growth: c.growthRate,
      })),
    [state.categories],
  )

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Basket Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Category performance, cross-selling opportunities, and basket composition.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<ShoppingCart className="w-4 h-4" />} />
        <KPICard title="Transactions" value={formatNumber(totalTransactions)} icon={<Package className="w-4 h-4" />} />
        <KPICard title="Avg Cross-Sell Rate" value={formatPercentRaw(avgCrossSell)} icon={<ArrowRightLeft className="w-4 h-4" />} />
        <KPICard title="Categories" value={String(state.categories.length)} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sortedByRevenue} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                width={95}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} animationDuration={800} animationEasing="ease-out">
                {sortedByRevenue.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cross-Sell Scatter */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Cross-Sell Opportunities</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="transactions" name="Transactions" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="crossSellRate" name="Cross-Sell %" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <ZAxis dataKey="revenue" range={[50, 400]} name="Revenue" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as typeof crossSellData[number]
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.category}</p>
                      <p>Cross-sell: {d.crossSellRate}%</p>
                      <p>Best paired: {d.paired}</p>
                      <p>Transactions: {formatNumber(d.transactions)}</p>
                    </div>
                  )
                }}
              />
              <Scatter data={crossSellData} fill="var(--color-chart-1)" animationDuration={1000}>
                {crossSellData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Items Per Basket */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Avg Items Per Basket by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgItemsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 9 }} height={60} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="items" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Category Growth Rate (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={95} />
              <Tooltip />
              <Bar dataKey="growth" radius={[0, 4, 4, 0]} animationDuration={800} animationEasing="ease-out">
                {growthData.map((d, i) => (
                  <Cell key={i} fill={d.growth >= 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Sell Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Cross-Sell Pairings</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Best Paired With</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Cross-Sell Rate</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Growth</th>
            </tr>
          </thead>
          <tbody>
            {sortedByRevenue.map((c) => (
              <tr key={c.category} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-700">{c.category}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.topPairedCategory}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{c.crossSellRate}%</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(c.revenue)}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${c.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {c.growthRate > 0 ? '+' : ''}{c.growthRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
