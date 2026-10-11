import { useState } from 'react'
import { HdsButton, HdsCheckbox, HdsInput, HdsSelect, type SelectOption } from '../ui/hds'
import { CloseButton } from './detail/parts'
import type { RequestRow, RequestStatus, RequestType } from '../../data/requests'
import calendarIcon from '../../assets/icons/dashboard-calendar.svg'

/*
 * Filter panel — Figma 41617:132341. Type, Status (the 8 designed options), Date (request / due date
 * + From/To), Amount (Min/Max) and Requester. Everything is a draft until "Apply filter".
 */

export type StatusFilter = 'cancelled' | 'needs-action' | 'overdue' | 'paid' | 'pending-approval' | 'payment-pending' | 'payment-failed' | 'rejected'

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'needs-action', label: 'Needs action' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending-approval', label: 'Pending approval' },
  { value: 'payment-pending', label: 'Payment pending' },
  { value: 'payment-failed', label: 'Payment failed' },
  { value: 'rejected', label: 'Rejected' },
]

export type RequestFilters = {
  types: RequestType[]
  statuses: StatusFilter[]
  dateField: 'request' | 'due' | null
  from: string
  to: string
  min: string
  max: string
  requester: string | null
}

export const EMPTY_FILTERS: RequestFilters = { types: [], statuses: [], dateField: null, from: '', to: '', min: '', max: '', requester: null }

/** The exact values shown in the Figma filter panel (used when /requests/filters opens on its own). */
export const DESIGNED_FILTERS: RequestFilters = {
  types: ['Vendor payment'],
  statuses: ['cancelled'],
  dateField: 'request',
  from: '12/04/2026',
  to: '03/06/2026',
  min: '50.00',
  max: '7,500.00',
  requester: 'Dana Avery',
}

export function countFilters(f: RequestFilters) {
  return f.types.length + f.statuses.length + (f.dateField && (f.from || f.to) ? 1 : 0) + (f.min || f.max ? 1 : 0) + (f.requester ? 1 : 0)
}

const parseInputDate = (v: string) => {
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime() : null
}

export function applyFilters(rows: RequestRow[], f: RequestFilters): RequestRow[] {
  const statusMatch = (r: RequestRow) =>
    f.statuses.some((s) =>
      s === 'overdue'
        ? !!r.overdue || /overdue/i.test(r.dueNote ?? '')
        : s === 'pending-approval'
          ? r.statusKey === 'pending-approval' || r.statusKey === 'pending'
          : r.statusKey === (s as RequestStatus),
    )
  const from = parseInputDate(f.from)
  const to = parseInputDate(f.to)
  const min = Number(f.min.replace(/[^\d.]/g, '')) || null
  const max = Number(f.max.replace(/[^\d.]/g, '')) || null
  return rows.filter((r) => {
    if (f.types.length && !f.types.includes(r.type)) return false
    if (f.statuses.length && !statusMatch(r)) return false
    if (f.requester && r.requestedBy !== f.requester) return false
    if (min !== null && r.amountValue < min) return false
    if (max !== null && r.amountValue > max) return false
    if (f.dateField && (from !== null || to !== null)) {
      const raw = f.dateField === 'request' ? r.requestDate : r.dueDate
      const t = raw ? new Date(raw).getTime() : NaN
      if (Number.isNaN(t)) return false
      if (from !== null && t < from) return false
      if (to !== null && t > to) return false
    }
    return true
  })
}

const dateOk = (v: string) => !v || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)

export default function FilterDrawer({
  initial,
  requesters,
  onClose,
  onApply,
}: {
  initial: RequestFilters
  requesters: string[]
  onClose: () => void
  onApply: (filters: RequestFilters) => void
}) {
  const [draft, setDraft] = useState<RequestFilters>(initial)
  const set = <K extends keyof RequestFilters>(k: K, v: RequestFilters[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const requesterOptions: SelectOption[] = [{ value: '__any', label: 'Any requester' }, ...requesters.map((r) => ({ value: r, label: r }))]
  const minN = Number(draft.min.replace(/[^\d.]/g, ''))
  const maxN = Number(draft.max.replace(/[^\d.]/g, ''))
  const amountError = draft.min && draft.max && minN > maxN ? 'Max must be more than min' : undefined
  const dateError = !dateOk(draft.from) || !dateOk(draft.to) ? 'Use DD/MM/YYYY' : undefined
  const canApply = !amountError && !dateError
  const calendar = <img src={calendarIcon} alt="" className="size-4" />

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto rounded-2xl bg-white p-6">
      <div className="flex items-center justify-between pb-6">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Filter</h2>
        <CloseButton onClick={onClose} label="Close filter panel" />
      </div>

      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3 border-b border-[#f6f6f6] pb-4">
          <legend className="pb-3 text-sm font-medium text-[#111927]">Type</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['Reimbursement', 'Vendor payment'] as RequestType[]).map((t) => (
              <HdsCheckbox key={t} size="md" label={t} checked={draft.types.includes(t)} onChange={() => set('types', toggle(draft.types, t))} />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-b border-[#f6f6f6] pb-4">
          <legend className="pb-3 text-sm font-medium text-[#111927]">Status</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
            {STATUS_FILTER_OPTIONS.map((s) => (
              <HdsCheckbox key={s.value} size="md" label={s.label} checked={draft.statuses.includes(s.value)} onChange={() => set('statuses', toggle(draft.statuses, s.value))} />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-b border-[#f6f6f6] pb-4">
          <legend className="pb-3 text-sm font-medium text-[#111927]">Date</legend>
          <div className="grid grid-cols-2 gap-3">
            <HdsCheckbox size="md" label="Request date" checked={draft.dateField === 'request'} onChange={(c) => set('dateField', c ? 'request' : null)} />
            <HdsCheckbox size="md" label="Due date" checked={draft.dateField === 'due'} onChange={(c) => set('dateField', c ? 'due' : null)} />
          </div>
          <div className="flex gap-2">
            <HdsInput containerClassName="min-w-0 flex-1" label="From" placeholder="DD/MM/YYYY" value={draft.from} disabled={!draft.dateField} onChange={(e) => set('from', e.target.value)} trailingIcon={calendar} error={!dateOk(draft.from) ? 'Use DD/MM/YYYY' : undefined} />
            <HdsInput containerClassName="min-w-0 flex-1" label="To" placeholder="DD/MM/YYYY" value={draft.to} disabled={!draft.dateField} onChange={(e) => set('to', e.target.value)} trailingIcon={calendar} error={!dateOk(draft.to) ? 'Use DD/MM/YYYY' : undefined} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2 border-b border-[#f6f6f6] pb-4">
          <legend className="pb-2 text-sm font-medium text-[#111927]">Amount</legend>
          <div className="flex items-start gap-4">
            <HdsInput containerClassName="min-w-0 flex-1" label="Min" prefix="$" inputMode="decimal" placeholder="0.00" value={draft.min} onChange={(e) => set('min', e.target.value.replace(/[^\d.,]/g, ''))} />
            <HdsInput containerClassName="min-w-0 flex-1" label="Max" prefix="$" inputMode="decimal" placeholder="0.00" value={draft.max} onChange={(e) => set('max', e.target.value.replace(/[^\d.,]/g, ''))} error={amountError} />
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 border-b border-[#f6f6f6] pb-4">
          <HdsSelect
            label="Requester"
            placeholder="Any requester"
            options={requesterOptions}
            value={draft.requester}
            onChange={(v) => set('requester', v === '__any' ? null : v)}
          />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <HdsButton fullWidth disabled={!canApply} onClick={() => onApply(draft)}>
          Apply filter
        </HdsButton>
        <HdsButton
          fullWidth
          variant="secondary"
          onClick={() => {
            setDraft(EMPTY_FILTERS)
            onApply(EMPTY_FILTERS)
          }}
        >
          Clear filter
        </HdsButton>
      </div>
    </div>
  )
}
