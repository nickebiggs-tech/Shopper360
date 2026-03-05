import { useState } from 'react'
import { Target, MessageSquare, Mail, Gift, Store, Plus, Calendar, Users } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'sms' | 'email' | 'instore' | 'loyalty'
  segment: string
  status: 'active' | 'completed' | 'scheduled'
  reach: number
  date: string
  response: number
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Lapsed Shopper Recall', type: 'sms', segment: 'At-Risk', status: 'completed', reach: 420, date: '2026-02-15', response: 12.5 },
  { id: '2', name: 'New Member Welcome', type: 'email', segment: 'New Customers', status: 'active', reach: 180, date: '2026-03-01', response: 28.3 },
  { id: '3', name: 'Power Shopper Reward', type: 'loyalty', segment: 'Power Shoppers', status: 'active', reach: 550, date: '2026-03-01', response: 45.0 },
  { id: '4', name: 'Beauty Cross-Sell', type: 'instore', segment: 'Regular Shoppers', status: 'scheduled', reach: 800, date: '2026-03-15', response: 0 },
  { id: '5', name: 'Vitamin Spring Push', type: 'email', segment: 'Occasional Visitors', status: 'scheduled', reach: 1200, date: '2026-03-20', response: 0 },
]

const TYPE_ICONS = {
  sms: MessageSquare,
  email: Mail,
  instore: Store,
  loyalty: Gift,
}

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
}

export function CampaignHistoryPage() {
  const [campaigns] = useState(SAMPLE_CAMPAIGNS)

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage customer outreach campaigns.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{campaigns.filter(c => c.status === 'scheduled').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">Total Reach</p>
          <p className="text-2xl font-bold text-slate-900">{campaigns.reduce((s, c) => s + c.reach, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">Avg Response</p>
          <p className="text-2xl font-bold text-slate-900">
            {(campaigns.filter(c => c.response > 0).reduce((s, c) => s + c.response, 0) / Math.max(campaigns.filter(c => c.response > 0).length, 1)).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((c) => {
          const Icon = TYPE_ICONS[c.type]
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{c.segment}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.reach.toLocaleString()} reach</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.date}</span>
                </div>
              </div>
              <div className="text-right">
                {c.response > 0 ? (
                  <>
                    <p className="text-lg font-bold text-primary">{c.response}%</p>
                    <p className="text-xs text-slate-400">response</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Pending</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
        Campaign execution (SMS, Email, In-Store) is currently a UI preview. Integration with messaging providers is coming soon.
      </div>
    </div>
  )
}
