import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import { Users, ShoppingCart, DollarSign, TrendingUp, UserPlus, Shield } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

const ANIM = { duration: 1200, easing: 'ease-out' as const }
const BAR_ANIM = { animationDuration: 800, animationEasing: 'ease-out' as const }

export function DashboardPage() {
  const { state, selectedSummary, previousSummary } = useData()

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    state.customers.forEach((c) => {
      counts[c.segment] = (counts[c.segment] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      </div>
    </div>
  )
}
