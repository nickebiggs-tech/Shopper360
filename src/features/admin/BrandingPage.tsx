import { useTheme } from '../../theme/ThemeProvider'
import { Check, Palette, Monitor, Paintbrush } from 'lucide-react'
import { cn } from '../../lib/utils'

export function BrandingPage() {
  const { livery, setLivery, liveryOptions } = useTheme()

  return (
    <div className="space-y-5 sm:space-y-6 page-enter max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings &amp; Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage branding, themes, and display preferences.</p>
      </div>

      {/* Brand Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Paintbrush className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Brand Livery</h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">Select a brand theme to apply across the entire application.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveryOptions.map((opt) => {
            const isActive = livery.id === opt.id
            const primary = opt.colors['theme-primary'] ?? '#0A8BA8'
            const accent = opt.colors['theme-accent'] ?? '#10B39B'
            const sidebarFrom = opt.colors['theme-sidebar-from'] ?? '#0F172A'

            return (
              <button
                key={opt.id}
                onClick={() => setLivery(opt.id)}
                className={cn(
                  'relative bg-white rounded-xl border-2 p-5 text-left transition-all hover:shadow-md group',
                  isActive ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-slate-200',
                )}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Logo preview on dark background */}
                <div className="rounded-lg p-3 mb-4 flex items-center justify-center" style={{ backgroundColor: sidebarFrom }}>
                  <img src={opt.logoWhite} alt={opt.name} className="h-8 object-contain" />
                </div>

                <div className="mb-3">
                  <p className="font-semibold text-slate-900">{opt.name}</p>
                  <p className="text-xs text-slate-500">{opt.tagline}</p>
                </div>

                {/* Color swatches */}
                <div className="flex gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md border border-slate-100" style={{ backgroundColor: primary }} title="Primary" />
                  <div className="w-8 h-8 rounded-md border border-slate-100" style={{ backgroundColor: accent }} title="Accent" />
                  <div className="w-8 h-8 rounded-md border border-slate-100" style={{ backgroundColor: sidebarFrom }} title="Sidebar" />
                </div>

                {/* Preview gradient bar */}
                <div className="h-2 rounded-full overflow-hidden flex">
                  <div className="flex-1" style={{ backgroundColor: primary }} />
                  <div className="flex-1" style={{ backgroundColor: accent }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Theme Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Active Theme Preview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark preview */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Dark Background (Sidebar / Hero)</p>
            <div
              className="rounded-xl p-6 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${livery.colors['theme-sidebar-from']}, ${livery.colors['theme-sidebar-to']})`,
              }}
            >
              <img src={livery.logoWhite} alt={livery.name} className="h-10 object-contain" />
            </div>
          </div>

          {/* Light preview */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Light Background (Content)</p>
            <div className="rounded-xl p-6 bg-slate-50 border border-slate-200 flex items-center justify-center">
              <img src={livery.logoColor} alt={livery.name} className="h-10 object-contain" />
            </div>
          </div>
        </div>

        {/* Theme properties grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Name</p>
            <p className="text-sm font-medium text-slate-900">{livery.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Tagline</p>
            <p className="text-sm font-medium text-slate-900">{livery.tagline}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Font</p>
            <p className="text-sm font-medium text-slate-900" style={{ fontFamily: livery.fontFamily }}>
              {livery.fontFamily.split(',')[0]?.replace(/"/g, '')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Logo Text</p>
            <p className="text-sm font-medium text-slate-900">{livery.logoText}</p>
          </div>
        </div>

        {/* Full color palette */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Color Palette</p>
          <div className="flex flex-wrap gap-2">
            {['theme-primary', 'theme-accent', 'theme-chart-1', 'theme-chart-2', 'theme-chart-3', 'theme-chart-4', 'theme-chart-5'].map((key) => (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-md border border-slate-200"
                  style={{ backgroundColor: livery.colors[key] }}
                />
                <span className="text-[10px] text-slate-400 font-mono">{livery.colors[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Colors */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Segment Colors</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: 'theme-seg-power', label: 'Power Shoppers' },
            { key: 'theme-seg-regular', label: 'Regular' },
            { key: 'theme-seg-occasional', label: 'Occasional' },
            { key: 'theme-seg-new', label: 'New' },
            { key: 'theme-seg-atrisk', label: 'At-Risk' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: livery.colors[key] }} />
              <span className="text-xs text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
