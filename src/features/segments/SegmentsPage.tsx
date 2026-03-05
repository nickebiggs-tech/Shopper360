import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PieChart as PieIcon, Target, DollarSign, TrendingUp } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { KPICard } from '../../components/ui/KPICard'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrency, formatNumber, formatPercentRaw } from '../../lib/formatters'
import type { Segment } from '../../data/types'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']
const SEGMENTS: Segment[] = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk']

export function SegmentsPage() {
  const { state } = useData()

  const segmentStats = useMemo(() => {
    const stats = SEGMENTS.map((seg) => {
      const customers = state.customers.filter((c) => c.segment === seg)
      const count = customers.length
      const avgBasket = count > 0 ? customers.reduce((s, c) => s + c.avgBasketValue, 0) / count : 0
      const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
      const avgRetention = count > 0 ? customers.reduce((s, c) => s + c.retentionScore, 0) / count : 0
      const avgVisits = count > 0 ? customers.reduce((s, c) => s + c.totalVisits, 0) / count : 0
      return { segment: seg, count, avgBasket, totalSpend, avgRetention, avgVisits }
    })
    return stats
  }, [state.customers])

  const pieData = useMemo(() =>
    segmentStats.map((s) => ({ name: s.segment, value: s.count })),
    [segmentStats],
  )

  const revenuePie = useMemo(() =>
    segmentStats.map((s) => ({ name: s.segment, value: Math.round(s.totalSpend) })),
    [segmentStats],
  )


  const retentionBySegment = useMemo(() =>
    segmentStats.map((s) => ({
      segment: s.segment.length > 12 ? s.segment.slice(0, 12) + '...' : s.segment,
      retention: Math.round(s.avgRetention),
    })),
    [segmentStats],
  )

  const totalCustomers = state.customers.length
  const powerRatio = segmentStats.find((s) => s.segment === 'Power Shoppers')?.count ?? 0
  const atRiskCount = segmentStats.find((s) => s.segment === 'At-Risk')?.count ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Segments</h1>
        <p className="text-sm text-slate-500 mt-1">Customer segmentation analysis and targeting.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Customers"
          value={formatNumber(totalCustomers)}
          icon={<PieIcon className="w-4 h-4" />}
        />
        <KPICard
          title="Power Shoppers"
          value={`${formatNumber(powerRatio)} (${((powerRatio / totalCustomers) * 100).toFixed(1)}%)`}
          icon={<Target className="w-4 h-4" />}
        />
        <KPICard
          title="At-Risk Customers"
          value={`${formatNumber(atRiskCount)} (${((atRiskCount / totalCustomers) * 100).toFixed(1)}%)`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          title="Total Customer Spend"
          value={formatCurrency(segmentStats.reduce((s, seg) => s + seg.totalSpend, 0))}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Count Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customers by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Segment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={revenuePie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {revenuePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Retention by Segment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Avg Retention Score by Segment</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={retentionBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="retention" radius={[4, 4, 0, 0]}>
                {retentionBySegment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Details Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Segment Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Segment</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Customers</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">% of Total</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Basket</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total Spend</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Avg Visits</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Retention</th>
            </tr>
          </thead>
          <tbody>
            {segmentStats.map((s) => (
              <tr key={s.segment} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5"><SegmentBadge segment={s.segment} /></td>
                <td className="px-4 py-2.5 text-right text-slate-700">{formatNumber(s.count)}</td>
                <td className="px-4 py-2.5 text-right text-slate-500">{((s.count / totalCustomers) * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(s.avgBasket)}</td>
                <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(s.totalSpend)}</td>
                <td className="px-4 py-2.5 text-right text-slate-700">{s.avgVisits.toFixed(1)}</td>
                <td className="px-4 py-2.5 text-right text-slate-700">{formatPercentRaw(s.avgRetention)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
