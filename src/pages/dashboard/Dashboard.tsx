import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import RequestsPageHeader from '../../components/requests/RequestsPageHeader'
import ExpenseOverview from '../../components/requests/ExpenseOverview'
import RequestsTabs, { type RequestsTab } from '../../components/requests/RequestsTabs'
import RequestsTable from '../../components/requests/RequestsTable'
import FilterDrawer, { applyFilters, countFilters, EMPTY_FILTERS, type RequestFilters, type StatusFilter } from '../../components/requests/FilterDrawer'
import QuickViewDrawer from '../../components/requests/QuickViewDrawer'
import NewRequestsDrawer from '../../components/requests/NewRequestsDrawer'
import { Toast, type ToastData } from '../../components/requests/detail/parts'
import { CLOSED_STATUSES, expenseCategories, OPEN_STATUSES, type RequestType } from '../../data/requests'
import { detailPathFor, useRequestRows } from '../../data/requestStore'

export type RequestsScreenProps = {
  /** Open the Filter panel on load, pre-filled with these (draft) values — Figma 41617:132341. */
  initialFilterDraft?: RequestFilters
  /** Open the Type column menu on load — Figma 42563:368496. */
  typeMenuOpen?: boolean
  /** Open the Quick view panel for this request on load — Figma 38133:251019. */
  quickViewId?: string
  /** Open the Submit expense drawer on load — Figma 42967:150236. */
  submitOpen?: boolean
  /** Show this toast on load — e.g. Figma 42563:376054 ("Reimbursement rejected"). */
  initialToast?: ToastData
}

const STAT_TO_FILTER: Record<string, StatusFilter> = {
  'Pending approvals': 'pending-approval',
  Overdue: 'overdue',
  'Payment failed': 'payment-failed',
  'Needs action': 'needs-action',
}

// The Requests screen itself, without the app shell. Exported so the Submit-expense flows (pay a
// vendor, claim a reimbursement) can keep this exact screen behind their drawer, with a dark overlay.
export function RequestsScreen({ initialFilterDraft, typeMenuOpen, quickViewId, submitOpen, initialToast }: RequestsScreenProps = {}) {
  const navigate = useNavigate()
  const location = useLocation() as {
    state?: { reimbursementSubmitted?: boolean; vendorPaymentSubmitted?: boolean; toast?: ToastData; stat?: string }
  }
  const rows = useRequestRows()

  const submittedKind = location.state?.vendorPaymentSubmitted ? 'vendor payment' : location.state?.reimbursementSubmitted ? 'reimbursement' : null
  const [toast, setToast] = useState<ToastData | null>(
    location.state?.toast ??
      (submittedKind ? { tone: 'success', title: 'Request submitted', message: `Your ${submittedKind} request has been sent for approval.` } : (initialToast ?? null)),
  )
  const closeToast = useCallback(() => setToast(null), [])

  const [tab, setTab] = useState<RequestsTab>('all')
  const [search, setSearch] = useState('')
  const statFilter = location.state?.stat ? STAT_TO_FILTER[location.state.stat] : undefined
  const [filters, setFilters] = useState<RequestFilters>(statFilter ? { ...EMPTY_FILTERS, statuses: [statFilter] } : EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(!!initialFilterDraft)
  const [filterDraftSeed, setFilterDraftSeed] = useState<RequestFilters | undefined>(initialFilterDraft)
  const [quickId, setQuickId] = useState<string | null>(quickViewId ?? null)
  const [newOpen, setNewOpen] = useState(false)
  const closeNew = useCallback(() => setNewOpen(false), [])

  const requesters = useMemo(() => Array.from(new Set(rows.map((r) => r.requestedBy))).sort(), [rows])

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => OPEN_STATUSES.includes(r.statusKey)).length,
    closed: rows.filter((r) => CLOSED_STATUSES.includes(r.statusKey)).length,
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = rows
    if (tab === 'pending') list = list.filter((r) => OPEN_STATUSES.includes(r.statusKey))
    if (tab === 'closed') list = list.filter((r) => CLOSED_STATUSES.includes(r.statusKey))
    if (q) list = list.filter((r) => `${r.payee} ${r.refId} ${r.requestedBy} ${r.status} ${r.type}`.toLowerCase().includes(q))
    return applyFilters(list, filters)
  }, [rows, tab, search, filters])

  const liveStats = [
    { label: 'Pending approvals', value: String(rows.filter((r) => r.statusKey === 'pending-approval').length) },
    { label: 'Overdue', value: String(rows.filter((r) => r.overdue || /overdue/i.test(r.dueNote ?? '')).length) },
    { label: 'Payment failed', value: String(rows.filter((r) => r.statusKey === 'payment-failed').length) },
    { label: 'Needs action', value: String(rows.filter((r) => r.statusKey === 'needs-action').length) },
  ]

  const quickRow = quickId ? rows.find((r) => r.id === quickId) : undefined
  const panelOpen = filterOpen || !!quickRow

  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFilterOpen(false)
        setQuickId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  return (
    <main className="relative flex w-full flex-col items-start gap-6 pb-10 pt-10">
      <div className="flex w-full flex-col gap-8">
        <RequestsPageHeader initialSubmitOpen={submitOpen} />
        <ExpenseOverview
          total="$12,790.65"
          newRequestsLabel={`${rows.length} new requests`}
          onNewRequests={() => setNewOpen(true)}
          categories={expenseCategories}
          statTiles={liveStats}
          onStatClick={(label) => {
            const s = STAT_TO_FILTER[label]
            if (s) {
              setTab('all')
              setFilters({ ...EMPTY_FILTERS, statuses: [s] })
            }
          }}
        />
        <RequestsTabs active={tab} counts={counts} onChange={setTab} />
      </div>
      <RequestsTable
        rows={visible}
        search={search}
        onSearch={setSearch}
        filterCount={countFilters(filters)}
        onFilterClick={() => {
          setFilterDraftSeed(undefined)
          setFilterOpen(true)
        }}
        typeValues={filters.types}
        onTypeChange={(types: RequestType[]) => setFilters((f) => ({ ...f, types }))}
        typeMenuInitiallyOpen={typeMenuOpen}
        onQuickView={(row) => setQuickId(row.id)}
        selectedRowId={quickRow?.id}
      />

      {panelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 animate-[fadeIn_160ms_ease-out] bg-[#111927]/50"
            aria-hidden="true"
            onClick={() => {
              setFilterOpen(false)
              setQuickId(null)
            }}
          />
          <div className="fixed bottom-10 right-10 top-10 z-50 w-[465px] max-w-[calc(100vw-80px)] animate-[rise_220ms_ease-out] shadow-2xl">
            {filterOpen ? (
              <FilterDrawer
                initial={filterDraftSeed ?? filters}
                requesters={requesters}
                onClose={() => setFilterOpen(false)}
                onApply={(f) => {
                  setFilters(f)
                  setFilterOpen(false)
                }}
              />
            ) : (
              quickRow && <QuickViewDrawer row={quickRow} onClose={() => setQuickId(null)} onViewFull={() => navigate(detailPathFor(quickRow))} />
            )}
          </div>
        </>
      )}

      <NewRequestsDrawer open={newOpen} rows={rows} onClose={closeNew} />
      {toast && <Toast toast={toast} onClose={closeToast} />}
    </main>
  )
}

export default function Dashboard() {
  return (
    <AppShell>
      <RequestsScreen />
    </AppShell>
  )
}
