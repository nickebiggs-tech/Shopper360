import { useTheme } from '../../theme/ThemeProvider'
import { Check, Palette } from 'lucide-react'
import { cn } from '../../lib/utils'

export function BrandingPage() {
  const { livery, setLivery, liveryOptions } = useTheme()

  return (
    <div className="space-y-5 sm:space-y-6 page-enter max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin — Branding</h1>
        <p className="text-sm text-slate-500 mt-1">Switch between pharmacy brand themes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {liveryOptions.map((opt) => {
          const isActive = livery.id === opt.id
          const primary = opt.colors['theme-primary'] ?? '#0A8BA8'
          const accent = opt.colors['theme-accent'] ?? '#10B39B'

          return (
            <button
              key={opt.id}
              onClick={() => setLivery(opt.id)}
              className={cn(
                'relative bg-white rounded-xl border-2 p-5 text-left transition-all hover:shadow-md',
                isActive ? 'border-primary shadow-md' : 'border-slate-200',
              )}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{opt.name}</p>
                  <p className="text-xs text-slate-500">{opt.tagline}</p>
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: primary }} title="Primary" />
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: accent }} title="Accent" />
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: opt.colors['theme-sidebar-from'] }} title="Sidebar" />
              </div>

              {/* Preview bar */}
              <div className="h-2 rounded-full overflow-hidden flex">
                <div className="flex-1" style={{ backgroundColor: primary }} />
                <div className="flex-1" style={{ backgroundColor: accent }} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Current Theme Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Name</p>
            <p className="font-medium text-slate-900">{livery.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Tagline</p>
            <p className="font-medium text-slate-900">{livery.tagline}</p>
          </div>
          <div>
            <p className="text-slate-500">Font</p>
            <p className="font-medium text-slate-900" style={{ fontFamily: livery.fontFamily }}>{livery.fontFamily.split(',')[0]?.replace(/"/g, '')}</p>
          </div>
          <div>
            <p className="text-slate-500">Logo Text</p>
            <p className="font-medium text-slate-900">{livery.logoText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
