import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface KPICardProps {
  title: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ title, value, delta, deltaLabel, icon, className }: KPICardProps) {
  const trend = delta !== undefined ? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat') : null

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-5 animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {delta !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          {trend === 'flat' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-red-600',
              trend === 'flat' && 'text-slate-400',
            )}
          >
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-xs text-slate-400">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}
