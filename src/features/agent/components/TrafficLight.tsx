import type { ConfidenceLevel } from '../types'
import { cn } from '../../../lib/utils'

const STYLES: Record<ConfidenceLevel, { bg: string; label: string; desc: string }> = {
  GREEN: { bg: 'bg-emerald-500', label: 'High Confidence', desc: 'Answer sourced directly from your data' },
  AMBER: { bg: 'bg-amber-500', label: 'Moderate Confidence', desc: 'Partially inferred — verify on the relevant page' },
  RED: { bg: 'bg-red-500', label: 'Low Confidence', desc: 'Could not fully answer — try rephrasing' },
}

export function TrafficLight({ level }: { level: ConfidenceLevel }) {
  const style = STYLES[level]
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2.5 h-2.5 rounded-full', style.bg)} />
      <span className="text-xs font-medium text-slate-600">{style.label}</span>
      <span className="text-xs text-slate-400">— {style.desc}</span>
    </div>
  )
}
