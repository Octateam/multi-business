import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { BadgeStatus } from '../../../components/ui/Badge'
import { HdsButton } from '../../../components/ui/hds'
import { setBillStatus, useBillProgress, useBillRecord, type BillRecord, type BillStatus } from '../list/billRecords'
import { billViewPath, deleteBillPath, editBillPath, provideDetailsPath } from '../list/billRoutes'
import { BillPaymentDrawer } from './BillPaymentDrawer'
import { BillsBackLink, VendorHeader } from './shared'
import CancelBillModal from './CancelBillModal'
import receiptPreview from '../../../assets/img/review1-receipt-preview.png'
import downloadIcon from '../../../assets/icons/billview-download.svg'

// ---------------------------------------------------------------------------
// "View bill" stepper for ONE bill, chosen by `?bill=<id>` (list/billRecords).
// Figma: 45033:222571 (step 2 chrome: back link, title, status, stepper,
// white content panel + 340px "Invoice uploaded" card, 76px bottom bar) and
// 45033:219739 (step 1 "Vendor info" / "Payment details" cards).
//   1 Vendor info  -> /bills/review/northwind-design-ltd-vendor-info?bill=<id>
//   2 Bill details -> /bills/review/northwind-design-ltd-bill-details?bill=<id>
//   3 Approval     -> the approval screen for the bill's status (list/billRoutes.approvalRoute)
// The route names keep their Figma (Northwind) names; the content is the
// selected bill's. Without `?bill=` the screens show Northwind NW-2481, and a
// legacy `?status=` (paid / payment-pending / payment-failed / info-needed)
// still sets the status that sample bill is shown in.
// ---------------------------------------------------------------------------

export type BillViewStep = 1 | 2 | 3

const LEGACY_STATUS: Record<string, BillStatus> = {
  paid: 'Paid',
  'payment-pending': 'Payment pending',
  'payment-failed': 'Payment failed',
  'info-needed': 'Needs action',
}

/** Status → Badge tone (same colours as the bills-table status pills). */
export const STATUS_BADGE: Record<string, BadgeStatus> = {
  Overdue: 'pending',
  'Pending approval': 'pending',
  'Needs action': 'info-needed',
  'Payment failed': 'payment-failed',
  'Payment pending': 'info',
  Paid: 'paid',
  Cancelled: 'rejected',
  Draft: 'draft',
}

/**
 * The bill this screen shows. `routeStatus` is the status the route's own Figma frame depicts — used only
 * for the sample bill when the URL names neither a bill nor a status.
 */
export function useBillView(routeStatus?: BillStatus): BillRecord {
  const [params] = useSearchParams()
  const id = params.get('bill')
  const record = useBillRecord(id)
  const legacy = LEGACY_STATUS[params.get('status') ?? '']
  if (id) return record
  const status = legacy ?? routeStatus
  return status ? { ...record, status } : record
}

export { billViewPath }

/** First step of the bill view for a bills-table row. */
export const billViewEntryPath = (row: { id: string; status: string }) => billViewPath(1, row)

/** Back link + vendor name, status badge, created line and the per-status header actions. */
export function BillViewHeader({ bill }: { bill: BillRecord }) {
  return (
    <>
      <BillsBackLink />
      <VendorHeader
        vendorName={bill.vendor}
        status={STATUS_BADGE[bill.status] ?? 'neutral'}
        statusLabel={bill.status}
        createdBy={bill.createdBy ?? 'John Doe'}
        createdDate={bill.createdDate}
        actions={<BillViewActions bill={bill} />}
      />
    </>
  )
}

/**
 * Requester header actions per status — Figma 48121:464618:
 *   Pending approval / Overdue → Cancel bill · Edit bill
 *   Draft → Delete bill · Edit bill
 *   Payment failed → Cancel bill · Retry payment
 *   Needs action → Provide further details
 *   Payment pending / Paid / Cancelled → none
 */
export function BillViewActions({ bill }: { bill: BillRecord }) {
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const { paid } = useBillProgress(bill.id)
  const cancel = (
    <HdsButton key="cancel" variant="destructive-secondary" onClick={() => setCancelling(true)}>
      Cancel bill
    </HdsButton>
  )
  const edit = (
    <HdsButton key="edit" variant="secondary" onClick={() => navigate(editBillPath(bill.id))}>
      Edit bill
    </HdsButton>
  )
  let buttons: ReactNode[] = []
  switch (bill.status) {
    case 'Pending approval':
    case 'Overdue':
      buttons = [cancel, edit]
      break
    case 'Draft':
      buttons = [
        <HdsButton key="delete" variant="destructive-secondary" onClick={() => navigate(deleteBillPath(bill.id))}>
          Delete bill
        </HdsButton>,
        edit,
      ]
      break
    case 'Payment failed':
      buttons = [
        cancel,
        <HdsButton key="retry" variant="primary" onClick={() => setRetrying(true)}>
          Retry payment
        </HdsButton>,
      ]
      break
    case 'Needs action':
      buttons = [
        <HdsButton key="provide" variant="primary" onClick={() => navigate(provideDetailsPath(bill.id))}>
          Provide further details
        </HdsButton>,
      ]
      break
  }
  return (
    <>
      {buttons}
      {retrying && <BillPaymentDrawer bill={bill} paid={paid} mode="retry" onClose={() => setRetrying(false)} />}
      {cancelling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setCancelling(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CancelBillModal
              onClose={() => setCancelling(false)}
              onConfirm={() => {
                setBillStatus(bill.id, 'Cancelled')
                setCancelling(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Page frame: content column + a bottom action bar that sticks to the bottom of
 * the app's scroll area (`sticky bottom-0`), so it is always visible without
 * scrolling and never covers the last card (it sits in flow after the content).
 * `min-h-full` keeps the bar at the viewport bottom when the content is short.
 */
export function BillViewLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex w-full flex-1 flex-col gap-6 pb-10 pt-7">{children}</div>
      {footer}
    </div>
  )
}

/** Clickable stepper — Figma 45033:222682. Completed steps navigate back. */
export function BillViewStepper({ active, bill }: { active: BillViewStep; bill: { id: string; status: string } }) {
  const navigate = useNavigate()
  const steps: { n: BillViewStep; label: string }[] = [
    { n: 1, label: 'Vendor info' },
    { n: 2, label: 'Bill details' },
    { n: 3, label: 'Approval' },
  ]
  return (
    <nav aria-label="Bill steps" className="flex items-center">
      {steps.map((step, i) => {
        const isActive = step.n === active
        const isDone = step.n < active
        const content = (
          <>
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-semibold leading-[14px] tracking-[0.05px] ${ isActive ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#cbd0d8] bg-white text-[#4b5563]' }`}
            >
              {step.n}
            </span>
            <span
              className={`whitespace-nowrap leading-5 ${ isActive ? 'text-sm font-semibold text-text-primary' : 'text-[13px] font-medium text-[#4b5563]' } ${isDone ? 'underline-offset-2 group-hover:text-text-primary group-hover:underline' : ''}`}
            >
              {step.label}
            </span>
          </>
        )
        return (
          <div key={step.n} className="flex items-center">
            {isDone ? (
              <button
                type="button"
                onClick={() => navigate(billViewPath(step.n, bill))}
                className="group flex items-center gap-2 rounded-md"
              >
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-2" aria-current={isActive ? 'step' : undefined}>
                {content}
              </div>
            )}
            {i < steps.length - 1 && (
              <div className="px-3">
                <div className="h-px w-20 bg-[#edeff2]" />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/** Two-column body: white panel holding the cards (left) + the invoice card (right). */
export function BillViewBody({ children, aside, invoiceFile }: { children: ReactNode; aside?: ReactNode; invoiceFile?: string }) {
  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-white px-6 py-8">{children}</div>
      {aside ?? <BillInvoiceCard filename={invoiceFile} />}
    </div>
  )
}

/** Card inside the white panel — Figma "Container" (radius 12, #e3e8eb hairline, 18px padding, 16px semibold title). */
export function BillViewCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]">
      <h2 className="pb-2 text-base font-semibold leading-6 text-text-primary">{title}</h2>
      {children}
    </section>
  )
}

/**
 * "Invoice uploaded" card — Figma 45033:222808: a 340px card (px 16 / py 20,
 * radius 12) with a 308 × 316 preview (object-cover, top-aligned) and a
 * download button. Fixed size so it never stretches with the page.
 */
export function BillInvoiceCard({ filename = 'NW-2481.pdf' }: { filename?: string }) {
  return (
    <div data-invoice-card className="flex w-[340px] shrink-0 flex-col gap-1.5 rounded-xl bg-white px-4 py-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-medium leading-5 text-text-primary">Invoice uploaded</p>
          <p className="truncate text-[11px] leading-4 text-[#4b5563]">{filename}</p>
        </div>
        <a
          href={receiptPreview}
          download={filename.replace(/\.pdf$/i, '.png')}
          aria-label={`Download ${filename}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#cdd5df] transition-colors hover:bg-[#b7c0cc]"
        >
          <img src={downloadIcon} alt="" width={12} height={11.334} />
        </a>
      </div>
      <div data-invoice-preview className="h-[316px] w-[308px] overflow-hidden rounded-lg border border-[#f3f4f6]">
        <img src={receiptPreview} alt="Invoice preview" className="size-full object-cover object-top" />
      </div>
    </div>
  )
}

/**
 * Bottom action bar — Figma 45033:222820 (white, top hairline, 76px tall).
 * Previous sits at the left edge of the cards and Next at their right edge;
 * the trailing 340px spacer lines it up with the invoice column. The white fill
 * + hairline live on a full-bleed ::before so the bar spans the whole content
 * area (the app scroller clips it at the sidebar) even when the page column is
 * narrower than the scroller — e.g. Current Version with the sidebar collapsed.
 */
export function BillViewFooter({ onPrevious, onNext }: { onPrevious?: () => void; onNext?: () => void }) {
  return (
    <div
      data-bill-view-footer
      className="sticky bottom-0 z-20 w-full shrink-0 py-3.5 before:absolute before:inset-y-0 before:-left-[100vw] before:-right-[100vw] before:-z-10 before:border-t before:border-[#e5e7eb] before:bg-white before:content-['']"
    >
      <div className="flex w-full items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center justify-between px-6">
          {onPrevious ? (
            <HdsButton variant="secondary" onClick={onPrevious}>
              Previous
            </HdsButton>
          ) : (
            <span />
          )}
          {onNext && (
            <HdsButton variant="primary" onClick={onNext}>
              Next
            </HdsButton>
          )}
        </div>
        <div className="w-[340px] shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}
