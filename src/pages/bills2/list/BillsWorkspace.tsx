import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import {
  BillsPageHeader,
  BillsPagination,
  BillsSearchFilterBar,
  BillsSelectionBar,
  BillsStatCards,
  BillsTable,
  BillsTabs,
  type BillRow,
} from './shared'
import { BILL_TABS, isTabKey, rowsForTab, startReview, useAllBills, type BillsTabKey } from './billRecords'
import { billEntryPath, reviewSelectionPath, vendorProfilePath } from './billRoutes'
import { useBillRole } from './billRole'
import { VendorInfoSheetHost } from './VendorInfoSheet'
import { billActionItems } from './billActions'

const matches = (r: BillRow, q: string) =>
  !q || [r.bill, r.invoice, r.vendor, r.vendorCode, r.createdBy, r.amount, r.status].some((v) => v?.toLowerCase().includes(q))

/**
 * Search / filter + tabs + table + pagination + "n Selected | Review" bar, all driven by the live bill store:
 *  - each tab shows only the statuses that belong to it (billRecords.BILL_TABS) with that tab's columns;
 *    the active tab carries the count (Figma shows the count pill on the active tab only);
 *  - the tab lives in `?tab=` so Back returns to the same tab;
 *  - row click opens that bill's details, ⋯ shows the per-status actions (Figma 44840:253001);
 *  - selecting rows raises the selection bar (Figma 41310:643438) → Review opens the multi-bill review queue.
 */
export function BillsWorkspace({
  defaultTab = 'queue',
  pagination = true,
  onFilterClick,
  filterCount,
  filter,
  filterActions,
}: {
  defaultTab?: BillsTabKey
  pagination?: boolean
  onFilterClick?: () => void
  filterCount?: number
  /** Extra narrowing (e.g. the "filters applied" frame). */
  filter?: (r: BillRow) => boolean
  filterActions?: ReactNode
}) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const tab: BillsTabKey = isTabKey(tabParam) ? tabParam : defaultTab
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const role = useBillRole()

  const all = useAllBills()
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((r) => (!filter || filter(r)) && matches(r, q))
  }, [all, query, filter])
  const rows = useMemo(() => rowsForTab(visible, tab), [visible, tab])
  const tabDef = BILL_TABS.find((t) => t.key === tab)!
  // Selection only ever refers to rows on screen.
  const selectedOnScreen = rows.filter((r) => selected.includes(r.id)).map((r) => r.id)

  const changeTab = (key: string) => {
    setSelected([])
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.set('tab', key)
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <BillsSearchFilterBar query={query} onQueryChange={setQuery} onFilterClick={onFilterClick} filterCount={filterCount} />
        {filterActions}
      </div>
      <BillsTabs
        active={tab}
        onChange={changeTab}
        tabs={BILL_TABS.map((t) => ({ key: t.key, label: t.label, count: t.key === tab ? rowsForTab(visible, t.key).length : undefined }))}
      />
      <BillsTable
        rows={rows}
        columns={tabDef.columns}
        selectable={role === 'approver'}
        selected={selectedOnScreen}
        onSelectedChange={setSelected}
        onRowClick={(row) => navigate(billEntryPath(row, role))}
        rowActions={(row) => billActionItems(row, navigate)}
        vendorClickable={(row) => !!vendorProfilePath(row)}
        onVendorClick={(row) => {
          const to = vendorProfilePath(row)
          if (to) navigate(to)
        }}
        emptyMessage={query ? `No bills match “${query}” in ${tabDef.label}.` : `No ${tabDef.label.toLowerCase()} bills right now.`}
      />
      {pagination && <BillsPagination total={rows.length} />}
      <VendorInfoSheetHost />
      {/* Reviewing is the approver's job: one selected bill opens on its own, several open the review queue. */}
      {role === 'approver' && (
        <BillsSelectionBar
          count={selectedOnScreen.length}
          onClear={() => setSelected([])}
          onReview={() => {
            startReview(selectedOnScreen)
            navigate(reviewSelectionPath(selectedOnScreen))
          }}
        />
      )}
    </div>
  )
}

/** The Bills page frame (header, stat cards) around the workspace. `overlay` renders drawers / toasts / modals on top. */
export function BillsListPage({
  defaultTab,
  pagination,
  subtitle = 'Review, approve, and pay what you owe vendors — one-off or recurring.',
  overlay,
  footer,
  workspace,
}: {
  defaultTab?: BillsTabKey
  pagination?: boolean
  subtitle?: string
  overlay?: ReactNode
  footer?: ReactNode
  workspace?: Partial<Parameters<typeof BillsWorkspace>[0]>
}) {
  const navigate = useNavigate()
  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        {overlay}
        <BillsPageHeader subtitle={subtitle} onAddBill={() => navigate('/bills/add/manual-entry-empty')} />
        <BillsStatCards />
        <BillsWorkspace
          defaultTab={defaultTab}
          pagination={pagination}
          onFilterClick={() => navigate('/bills/list/filter-panel-empty')}
          {...workspace}
        />
        {footer}
      </main>
    </AppShell>
  )
}
