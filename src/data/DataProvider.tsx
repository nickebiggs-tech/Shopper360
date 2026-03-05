import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { format } from 'date-fns'
import type { Customer, StoreSummary, NationalBenchmark, CategoryData, SegmentBreakdown, Supplier, Cohort } from './types'
import { loadCustomers, loadSummary, loadNational, loadCategories, loadSegments, loadSuppliers } from './csv-loader'

interface DataState {
  customers: Customer[]
  summary: StoreSummary[]
  national: NationalBenchmark[]
  categories: CategoryData[]
  segmentBreakdown: SegmentBreakdown[]
  suppliers: Supplier[]
  cohorts: Cohort[]
  selectedMonth: string
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_SUMMARY'; payload: StoreSummary[] }
  | { type: 'SET_NATIONAL'; payload: NationalBenchmark[] }
  | { type: 'SET_CATEGORIES'; payload: CategoryData[] }
  | { type: 'SET_SEGMENTS'; payload: SegmentBreakdown[] }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'SET_COHORTS'; payload: Cohort[] }
  | { type: 'ADD_COHORT'; payload: Cohort }
  | { type: 'REMOVE_COHORT'; payload: string }
  | { type: 'SET_SELECTED_MONTH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }

const initialState: DataState = {
  customers: [],
  summary: [],
  national: [],
  categories: [],
  segmentBreakdown: [],
  suppliers: [],
  cohorts: [],
  selectedMonth: '2026-03',
  loading: true,
  error: null,
}

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case 'SET_CUSTOMERS': return { ...state, customers: action.payload }
    case 'SET_SUMMARY': return { ...state, summary: action.payload }
    case 'SET_NATIONAL': return { ...state, national: action.payload }
    case 'SET_CATEGORIES': return { ...state, categories: action.payload }
    case 'SET_SEGMENTS': return { ...state, segmentBreakdown: action.payload }
    case 'SET_SUPPLIERS': return { ...state, suppliers: action.payload }
    case 'SET_COHORTS': return { ...state, cohorts: action.payload }
    case 'ADD_COHORT': return { ...state, cohorts: [...state.cohorts, action.payload] }
    case 'REMOVE_COHORT': return { ...state, cohorts: state.cohorts.filter(c => c.id !== action.payload) }
    case 'SET_SELECTED_MONTH': return { ...state, selectedMonth: action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false }
    default: return state
  }
}

interface DataContextValue {
  state: DataState
  dispatch: React.Dispatch<Action>
  selectedSummary: StoreSummary | undefined
  previousSummary: StoreSummary | undefined
  /** Scale factor from sample (8K rows) to full CW network (3.2M+). Multiply sample counts by this to get network-level numbers. */
  networkScale: number
  addCohort: (cohort: Cohort) => void
  removeCohort: (id: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

const COHORT_STORAGE_KEY = 'shopper360-cohorts'

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    async function load() {
      try {
        const [customers, summary, national, categories, segments, suppliers] = await Promise.all([
          loadCustomers(),
          loadSummary(),
          loadNational(),
          loadCategories(),
          loadSegments(),
          loadSuppliers(),
        ])
        dispatch({ type: 'SET_CUSTOMERS', payload: customers })
        dispatch({ type: 'SET_SUMMARY', payload: summary })
        dispatch({ type: 'SET_NATIONAL', payload: national })
        dispatch({ type: 'SET_CATEGORIES', payload: categories })
        dispatch({ type: 'SET_SEGMENTS', payload: segments })
        dispatch({ type: 'SET_SUPPLIERS', payload: suppliers })

        // Load saved cohorts
        const saved = localStorage.getItem(COHORT_STORAGE_KEY)
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Cohort[]
            dispatch({ type: 'SET_COHORTS', payload: parsed })
          } catch { /* ignore corrupt data */ }
        }

        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load data' })
      }
    }
    load()
  }, [])

  const selectedSummary = useMemo(() =>
    state.summary.find(s => format(s.periodMonth, 'yyyy-MM') === state.selectedMonth),
    [state.summary, state.selectedMonth],
  )

  const previousSummary = useMemo(() => {
    const idx = state.summary.findIndex(s => format(s.periodMonth, 'yyyy-MM') === state.selectedMonth)
    return idx > 0 ? state.summary[idx - 1] : undefined
  }, [state.summary, state.selectedMonth])

  const addCohort = useCallback((cohort: Cohort) => {
    dispatch({ type: 'ADD_COHORT', payload: cohort })
    const updated = [...state.cohorts, cohort]
    localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(updated))
  }, [state.cohorts])

  const removeCohort = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_COHORT', payload: id })
    const updated = state.cohorts.filter(c => c.id !== id)
    localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(updated))
  }, [state.cohorts])

  // Scale factor: summary data has true CW network customer counts (3.2M+), sample has ~8K rows
  const networkScale = useMemo(() => {
    const sampleSize = state.customers.length
    const latestSummary = state.summary.length > 0 ? state.summary[state.summary.length - 1] : undefined
    if (!sampleSize || !latestSummary) return 1
    return latestSummary.totalCustomers / sampleSize
  }, [state.customers.length, state.summary])

  return (
    <DataContext.Provider value={{ state, dispatch, selectedSummary, previousSummary, networkScale, addCohort, removeCohort }}>
      {state.loading ? (
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 text-sm">Loading Shopper360 data...</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-700 font-medium">Failed to load data</p>
            <p className="text-red-500 text-sm mt-1">{state.error}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
