import { cn } from '../../../lib/utils'

interface MessageBubbleProps {
  role: 'user' | 'agent'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div className={cn('flex', role === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          role === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md',
        )}
      >
        {role === 'agent' ? (
          <div
            className="prose prose-sm prose-slate max-w-none [&_strong]:text-slate-900"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
          />
        ) : (
          content
        )}
      </div>
    </div>
  )
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n(\d+)\. /g, '<br/>$1. ')
}
