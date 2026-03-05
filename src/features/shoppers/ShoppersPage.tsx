import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { SegmentBadge } from '../../components/ui/SegmentBadge'
import { formatCurrencyDecimal, formatNumber } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import type { Customer } from '../../data/types'

export function ShoppersPage() {
  const { state } = useData()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    if (segmentFilter === 'all') return state.customers
    return state.customers.filter((c) => c.segment === segmentFilter)
  }, [state.customers, segmentFilter])

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 100 },
    { accessorKey: 'customerName', header: 'Name', size: 180 },
    {
      accessorKey: 'segment',
      header: 'Segment',
      cell: ({ row }) => <SegmentBadge segment={row.original.segment} />,
      size: 160,
    },
    {
      accessorKey: 'totalVisits',
      header: 'Visits',
      cell: ({ getValue }) => formatNumber(getValue() as number),
      size: 80,
    },
    {
      accessorKey: 'avgBasketValue',
      header: 'Avg Basket',
      cell: ({ getValue }) => formatCurrencyDecimal(getValue() as number),
      size: 100,
    },
    {
      accessorKey: 'totalSpend',
      header: 'Total Spend',
      cell: ({ getValue }) => formatCurrencyDecimal(getValue() as number),
      size: 110,
    },
    {
      accessorKey: 'categoryCount',
      header: 'Categories',
      size: 90,
    },
    {
      accessorKey: 'retentionScore',
      header: 'Retention',
      cell: ({ getValue }) => {
        const v = getValue() as number
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', v >= 70 ? 'bg-emerald-500' : v >= 40 ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${v}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{v}</span>
          </div>
        )
      },
      size: 130,
    },
    {
      accessorKey: 'daysSinceLastVisit',
      header: 'Last Visit',
      cell: ({ getValue }) => `${getValue()} days ago`,
      size: 110,
    },
    {
      accessorKey: 'topCategory',
      header: 'Top Category',
      size: 150,
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const handleExport = () => {
    const headers = columns.map((c) => (c as { accessorKey: string }).accessorKey).join(',')
    const rows = table.getFilteredRowModel().rows.map((r) =>
      columns.map((c) => {
        const key = (c as { accessorKey: string }).accessorKey as keyof Customer
        return r.original[key]
      }).join(','),
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Shopper360_Customers_Export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shoppers</h1>
          <p className="text-sm text-slate-500 mt-1">{formatNumber(filtered.length)} customers</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or postcode..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All Segments</option>
          <option value="Power Shoppers">Power Shoppers</option>
          <option value="Regular Shoppers">Regular Shoppers</option>
          <option value="Occasional Visitors">Occasional Visitors</option>
          <option value="New Customers">New Customers</option>
          <option value="At-Risk">At-Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-200 bg-slate-50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2.5 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
            of {formatNumber(table.getFilteredRowModel().rows.length)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-30 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-30 hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
