import { cn } from '../../lib/utils'
import type { Segment } from '../../data/types'

const SEGMENT_STYLES: Record<Segment, string> = {
  'Power Shoppers': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Regular Shoppers': 'bg-blue-50 text-blue-700 border-blue-200',
  'Occasional Visitors': 'bg-amber-50 text-amber-700 border-amber-200',
  'New Customers': 'bg-purple-50 text-purple-700 border-purple-200',
  'At-Risk': 'bg-red-50 text-red-700 border-red-200',
}

interface SegmentBadgeProps {
  segment: Segment
  className?: string
}

export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        SEGMENT_STYLES[segment] || 'bg-slate-50 text-slate-600 border-slate-200',
        className,
      )}
    >
      {segment}
    </span>
  )
}
