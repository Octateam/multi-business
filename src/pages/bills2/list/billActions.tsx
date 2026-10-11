import type { NavigateFunction } from 'react-router-dom'
import type { ActionItem } from '../../../components/ui/hds'
import { MenuGlyph, type BillRow } from './shared'
import { getBillRole } from './billRole'
import { openVendorInfo } from './vendorInfoStore'
import { billViewPath, deleteBillPath, editBillPath, paymentInfoPath, reviewBillPath } from './billRoutes'

import glyphFile from '../../../assets/icons/billrow-file.svg'
import glyphView from '../../../assets/icons/billrow-view.svg'
import glyphUsers from '../../../assets/icons/billrow-users.svg'
import glyphOffice from '../../../assets/icons/billrow-office.svg'
import glyphCard from '../../../assets/icons/billrow-credit-card.svg'
import glyphDelete from '../../../assets/icons/billrow-delete.svg'
import glyphInfo from '../../../assets/icons/billrow-info.svg'
import glyphCheckList from '../../../assets/icons/billrow-check-list.svg'
import glyphPen from '../../../assets/icons/billrow-pen.svg'

/**
 * Per-status row actions — Figma 44840:253001 ("Row actions — open", one menu per status badge).
 * Labels, order, icons and the destructive "Delete bill" are exactly as designed:
 *
 *   Cancelled         View bill · View vendor info
 *   Needs action      View bill · View vendor info · View payment · Check updates
 *   Pending approval  Review bill · View bill · View approvals · View vendor info · View payment · Delete bill
 *   Payment failed    View bill · View vendor info · View payment
 *   Paid              View bill · View payment · View vendor info · View approvals
 *   Payment pending   View bill · Track payment · View vendor info · View approvals
 *   Overdue           Review bill · View bill · View approvals · View vendor info · View payment · Delete bill
 *   Draft             Edit bill · Delete bill
 */
type ActionKey =
  | 'review'
  | 'view'
  | 'vendor'
  | 'payment'
  | 'approvals'
  | 'updates'
  | 'track'
  | 'edit'
  | 'delete'

export const STATUS_ACTIONS: Record<string, ActionKey[]> = {
  Cancelled: ['view', 'vendor'],
  'Needs action': ['view', 'vendor', 'payment', 'updates'],
  'Pending approval': ['review', 'view', 'approvals', 'vendor', 'payment', 'delete'],
  'Payment failed': ['view', 'vendor', 'payment'],
  Paid: ['view', 'payment', 'vendor', 'approvals'],
  'Payment pending': ['view', 'track', 'vendor', 'approvals'],
  Overdue: ['review', 'view', 'approvals', 'vendor', 'payment', 'delete'],
  Draft: ['edit', 'delete'],
}

const META: Record<ActionKey, { label: string; glyph: string; inset: string; danger?: boolean }> = {
  review: { label: 'Review bill', glyph: glyphFile, inset: '5.21% 13.54%' },
  view: { label: 'View bill', glyph: glyphView, inset: '17.71% 5.21%' },
  vendor: { label: 'View vendor info', glyph: glyphOffice, inset: '5.21%' },
  payment: { label: 'View payment', glyph: glyphCard, inset: '0' },
  approvals: { label: 'View approvals', glyph: glyphUsers, inset: '10.42% 2.08%' },
  updates: { label: 'Check updates', glyph: glyphInfo, inset: '5.21%' },
  track: { label: 'Track payment', glyph: glyphCheckList, inset: '12.5% 8.33%' },
  edit: { label: 'Edit bill', glyph: glyphPen, inset: '11.46% 11.46% 11.46% 11.47%' },
  delete: { label: 'Delete bill', glyph: glyphDelete, inset: '5.21% 8.33%', danger: true },
}

/** Where an action goes. View / vendor / approvals open the requester's bill view or the approver's review screen. */
function target(key: ActionKey, row: BillRow): string {
  const approver = getBillRole() === 'approver'
  const view = (step: 1 | 2 | 3) => (approver ? reviewBillPath(row.id, step) : billViewPath(step, row))
  switch (key) {
    case 'review':
      return reviewBillPath(row.id)
    case 'view':
      return view(2)
    case 'vendor':
      return view(1)
    case 'payment':
    case 'track':
      return paymentInfoPath(row)
    case 'approvals':
    case 'updates':
      return view(3)
    case 'edit':
      return editBillPath(row.id)
    case 'delete':
      return deleteBillPath(row.id)
  }
}

/** The ⋯ menu items for a bill in its current status (used by the bills tables and the bill view header). */
export function billActionItems(row: BillRow, navigate: NavigateFunction, opts?: { exclude?: ActionKey[] }): ActionItem[] {
  // "Review bill" is the approver's move — requesters don't get it.
  const exclude = [...(opts?.exclude ?? []), ...(getBillRole() === 'requester' ? (['review'] as ActionKey[]) : [])]
  return (STATUS_ACTIONS[row.status] ?? ['view', 'vendor'])
    .filter((k) => !exclude.includes(k))
    .map((key) => {
      const m = META[key]
      return {
        label: m.label,
        tone: m.danger ? 'danger' : 'default',
        icon: <MenuGlyph src={m.glyph} inset={m.inset} />,
        // "View vendor info" opens the Vendor information sheet over the page (Figma 45033:224707).
        onSelect: () => (key === 'vendor' ? openVendorInfo(row.id) : navigate(target(key, row))),
      }
    })
}
