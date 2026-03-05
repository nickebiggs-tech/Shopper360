import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { formatCurrency, formatPercentRaw } from '../../lib/formatters'

export function NationalComparisonPage() {
  const { state } = useData()

  const latest = state.national.length > 0 ? state.national[state.national.length - 1]! : null

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

  const getTier = (yours: number, median: number, p75: number) => {
    if (yours >= p75) return { label: 'Top 25%', color: 'text-emerald-600' }
    if (yours >= median) return { label: 'Above Median', color: 'text-blue-600' }
    return { label: 'Below Median', color: 'text-amber-600' }
  }

  const basketTier = latest ? getTier(latest.avgBasketValue_YourStore, latest.avgBasketValue_Median, latest.avgBasketValue_P75) : null

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">National Benchmarks</h1>
        <p className="text-sm text-slate-500 mt-1">See how the CW network compares to national percentile benchmarks.</p>
      </div>

      {/* KPIs */}
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
          value={basketTier?.label ?? '—'}
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Tier Cards */}
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
                  <p className="text-2xl font-bold text-slate-900">{metric.yours != null ? metric.format(metric.yours) : '—'}</p>
                  <p className="text-xs text-slate-400 mt-1">Median: {metric.median != null ? metric.format(metric.median) : '—'}</p>
                </div>
                {tier && (
                  <span className={`text-sm font-semibold ${tier.color}`}>{tier.label}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Avg Basket Value — CW Network vs National</h3>
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
              <Line type="monotone" dataKey="Your Store" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Retention Rate — CW Network vs National</h3>
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
              <Line type="monotone" dataKey="Your Store" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 chart-card animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Visits Per Customer — CW Network vs National</h3>
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
              <Line type="monotone" dataKey="Your Store" stroke="var(--color-chart-5)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1200} animationEasing="ease-out" animationBegin={450} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
