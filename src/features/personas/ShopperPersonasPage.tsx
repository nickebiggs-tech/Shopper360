import { ShieldCheck } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { PersonaPanel } from '../../components/ui/PersonaPanel'

export function ShopperPersonasPage() {
  const { state } = useData()

  return (
    <div className="space-y-5 sm:space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shopper Personas</h1>
          <p className="text-sm text-slate-500 mt-1">
            De-identified shopper profiles across the CW network. Click any chart to drill down.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-emerald-700 font-medium">Privacy Protected — Aggregated Data Only</span>
        </div>
      </div>

      <PersonaPanel
        customers={state.customers}
        title="CW Network Shopper Profile"
      />
    </div>
  )
}
