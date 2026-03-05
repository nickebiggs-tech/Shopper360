import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { CalendarDays, TrendingUp, Users, Clock } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatNumber, formatPercentRaw } from '../../lib/formatters'

export function VisitPatternsPage() {
  const { state, selectedSummary, previousSummary } = useData()

  const visitTrend = useMemo(() =>
    state.summary.map((s) => ({
      month: format(s.periodMonth, 'MMM yy'),
      visits: s.visitCount,
      active: s.activeCustomers,
      new: s.newCustomers,
    })),
    [state.summary],
  )

  const retentionTrend = useMemo(() =>
    state.summary.map((s) => ({
      month: format(s.periodMonth, 'MMM yy'),
      retention: s.retentionRate,
      churn: s.churnRate,
    })),
    [state.summary],
  )

  const visitFreqDist = useMemo(() => {
    const buckets = [
      { range: '1-5', min: 1, max: 5, count: 0 },
      { range: '6-15', min: 6, max: 15, count: 0 },
      { range: '16-30', min: 16, max: 30, count: 0 },
      { range: '31-50', min: 31, max: 50, count: 0 },
      { range: '51-75', min: 51, max: 75, count: 0 },
      { range: '76+', min: 76, max: Infinity, count: 0 },
    ]
    state.customers.forEach((c) => {
      const b = buckets.find((b) => c.totalVisits >= b.min && c.totalVisits <= b.max)
      if (b) b.count++
    })
    return buckets
  }, [state.customers])

  const recencyDist = useMemo(() => {
    const buckets = [
      { range: '0-7 days', min: 0, max: 7, count: 0 },
      { range: '8-14 days', min: 8, max: 14, count: 0 },
      { range: '15-30 days', min: 15, max: 30, count: 0 },
      { range: '31-60 days', min: 31, max: 60, count: 0 },
      { range: '61-90 days', min: 61, max: 90, count: 0 },
      { range: '90+ days', min: 91, max: Infinity, count: 0 },
    ]
    state.customers.forEach((c) => {
      const b = buckets.find((b) => c.daysSinceLastVisit >= b.min && c.daysSinceLastVisit <= b.max)
      if (b) b.count++
    })
    return buckets
  }, [state.customers])

  const avgVisitsPerCustomer = useMemo(() => {
    if (!selectedSummary) return 0
    return selectedSummary.activeCustomers > 0
      ? selectedSummary.visitCount / selectedSummary.activeCustomers
      : 0
  }, [selectedSummary])

  const delta = (curr: number | undefined, prev: number | undefined) => {
    if (!curr || !prev || prev === 0) return undefined
    return ((curr - prev) / prev) * 100
  }

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Visit Patterns</h1>
        <p className="text-sm text-slate-500 mt-1">Track foot traffic, visit frequency, and customer retention.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monthly Visits"
          value={formatNumber(selectedSummary?.visitCount ?? 0)}
          delta={delta(selectedSummary?.visitCount, previousSummary?.visitCount)}
          deltaLabel="vs last month"
          icon={<CalendarDays className="w-4 h-4" />}
        />
        <KPICard
          title="Active Shoppers"
          value={formatNumber(selectedSummary?.activeCustomers ?? 0)}
          delta={delta(selectedSummary?.activeCustomers, previousSummary?.activeCustomers)}
          deltaLabel="vs last month"
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          title="Visits / Customer"
          value={avgVisitsPerCustomer.toFixed(1)}
          icon={<Clock className="w-4 h-4" />}
        />
        <KPICard
          title="Retention Rate"
          value={formatPercentRaw(selectedSummary?.retentionRate ?? 0)}
          delta={selectedSummary && previousSummary ? selectedSummary.retentionRate - previousSummary.retentionRate : undefined}
          deltaLabel="pp change"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Volume Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Visit Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={visitTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="visits" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Retention vs Churn */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Retention vs Churn Rate</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="retention" stroke="#10B981" strokeWidth={2} name="Retention %" />
              <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={2} name="Churn %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Visit Frequency Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Visit Frequency Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={visitFreqDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recency Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Days Since Last Visit</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={recencyDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Customers Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">New Customer Acquisition</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={visitTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="new" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} name="New Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
