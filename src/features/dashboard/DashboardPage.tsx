import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, ShoppingCart, DollarSign, TrendingUp, UserPlus, AlertTriangle } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview for {selectedSummary ? format(selectedSummary.periodMonth, 'MMMM yyyy') : 'current period'}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={segmentCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avg Basket + Retention */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Basket Value & Retention</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="basket" stroke="var(--color-chart-1)" strokeWidth={2} name="Avg Basket ($)" />
              <Line yAxisId="right" type="monotone" dataKey="retention" stroke="var(--color-chart-2)" strokeWidth={2} name="Retention (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Stacked Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Segment Distribution Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={segmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              {['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk'].map((seg, i) => (
                <Bar key={seg} dataKey={seg} stackId="a" fill={PIE_COLORS[i]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
