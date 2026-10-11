import type { ReactNode } from 'react'
import { HdsBadge, HdsButton } from '../ui/hds'
import { STATUS_META, TYPE_COLOR, type RequestRow } from '../../data/requests'
import { CloseButton } from './detail/parts'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-[#f6f6f6] pb-4">
      <p className="text-sm font-medium text-[#525866]">{label}</p>
      {children}
    </div>
  )
}

// Quick view panel — Figma 38133:251019 pattern: the row's key fields, then "View full request".
export default function QuickViewDrawer({ row, onClose, onViewFull }: { row: RequestRow; onClose: () => void; onViewFull: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto rounded-2xl bg-white p-6">
      <div className="flex items-center justify-between pb-6">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Request details</h2>
        <CloseButton onClick={onClose} label="Close quick view panel" />
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Payee">
          <p className="text-sm font-medium text-[#222121]">{row.payee}</p>
          <p className="text-xs text-[#9aa1ac]">{row.refId}</p>
        </Field>
        <Field label="Type">
          <span>
            <HdsBadge color={TYPE_COLOR[row.type]}>{row.type}</HdsBadge>
          </span>
        </Field>
        <Field label="Requested by">
          <p className="text-sm font-medium text-[#222121]">
            {row.requestedBy}
            {row.requestedByIsSelf && <span className="font-normal text-[#6b7280]"> (you)</span>}
          </p>
        </Field>
        <Field label="Amount">
          <p className="text-sm font-medium text-[#0e121b]">{row.amount}</p>
        </Field>
        <Field label="Request date">
          <p className="text-sm font-medium text-[#0e121b]">{row.requestDate}</p>
          <p className="text-xs text-[#9aa1ac]">{row.requestTime}</p>
        </Field>
        <Field label="Due date">
          <p className="text-sm font-medium text-[#0e121b]">{row.dueDate ?? '--'}</p>
          {row.dueNote && <p className="text-xs text-[#6b7280]">{row.dueNote}</p>}
        </Field>
        <Field label="Status">
          <span>
            <HdsBadge color={STATUS_META[row.statusKey].color}>{row.status}</HdsBadge>
          </span>
        </Field>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <HdsButton fullWidth onClick={onViewFull}>
          View full request
        </HdsButton>
        <HdsButton fullWidth variant="secondary" onClick={onClose}>
          Close
        </HdsButton>
      </div>
    </div>
  )
}
