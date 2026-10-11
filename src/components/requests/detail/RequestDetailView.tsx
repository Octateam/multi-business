import { useCallback, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../layout/AppShell'
import { HdsBadge, HdsButton } from '../../ui/hds'
import { STATUS_META, type RequestStatus } from '../../../data/requests'
import { TODAY, updateRequest, useRequest, type ResolvedRequest } from '../../../data/requestStore'
import {
  BeneficiaryRow,
  Breadcrumb,
  Card,
  InfoRow,
  PayoutSummary,
  ReceiptPanel,
  Section,
  Timeline,
  Toast,
  receiptPreviewSrc,
  type TimelineItem,
  type ToastData,
} from './parts'
import { DocumentPreviewModal, HeroConfirmModal, ReasonModal } from './modals'
import { ApprovePayDrawer, EditRequestDrawer, ProvideDetailsDrawer } from './drawers'
import { hasInAppHistory } from '../../../lib/navHistory'

/**
 * One Request Detail screen for every request state (Figma "06 — Request Detail — …" frames in
 * the Requests section 37453:197545). It reads the request by `?id=` (falling back to the route's
 * own sample request), and derives from that request's status + whose view it is:
 *   - the status badge(s), and the designed header buttons,
 *   - the Expense / Beneficiary / Payout summary content and the Activity timeline,
 *   - the modals and drawers each action opens, which update the shared request state.
 */

export type DetailModal =
  | 'cancel'
  | 'approve-confirm'
  | 'reject'
  | 'request-info'
  | 'pay'
  | 'retry'
  | 'provide'
  | 'edit'
  | 'preview'
  | 'document'
  | null

function buildTimeline({ row, detail, override }: ResolvedRequest): TimelineItem[] {
  const status = row.statusKey
  const isVendor = detail.type === 'Vendor payment'
  const done: TimelineItem[] = [
    { label: 'Submitted by', sublabel: detail.requester.name, date: detail.submittedOn, dot: 'success' },
    { label: 'Document processed', sublabel: isVendor ? 'Invoice details extracted' : 'Receipt details extracted', date: detail.processedOn, dot: 'success' },
  ]
  const pendingApproval: TimelineItem = { label: 'Pending approval', sublabel: 'Waiting for approval from a finance manager.', date: detail.pendingSince, dot: 'success' }
  const approved: TimelineItem = { label: 'Approved', sublabel: detail.approvedBy ? `By ${detail.approvedBy}` : 'John Doe', date: detail.approvedOn, dot: 'success' }
  const todo = {
    approved: { label: 'Approved', sublabel: 'Awaiting a decision.', dot: 'disabled' } as TimelineItem,
    initiated: { label: 'Payment initiated', sublabel: 'Starts once the payment is made.', dot: 'disabled' } as TimelineItem,
    paid: { label: 'Paid', sublabel: 'Confirmed when the money reaches the account.', dot: 'disabled' } as TimelineItem,
  }
  const infoProvided: TimelineItem[] = detail.infoProvided
    ? [
        {
          label: 'Information provided',
          sublabel: (
            <>
              {detail.infoProvided.note}
              {detail.infoProvided.document && (
                <span className="block">
                  Supporting document: <span className="text-[#111927] underline underline-offset-2">{detail.infoProvided.document}</span>
                </span>
              )}
            </>
          ),
          date: detail.infoProvided.date,
          dot: 'success',
        },
      ]
    : []
  const extra: TimelineItem[] = (override.events ?? []).map((e) => ({
    label: e.label,
    sublabel: e.sublabel,
    date: e.date,
    dot: e.tone === 'error' ? 'error' : e.tone === 'muted' ? 'muted' : 'success',
  }))

  switch (status) {
    case 'pending-approval':
      return [...done, ...infoProvided, pendingApproval, ...extra, todo.approved, todo.initiated, todo.paid]
    case 'needs-action':
      return [...done, ...infoProvided, ...extra]
    case 'pending':
    case 'payment-pending':
      return [...done, ...infoProvided, pendingApproval, approved, ...extra, todo.initiated, todo.paid]
    case 'payment-failed':
      return [
        ...done,
        approved,
        ...extra,
        { label: 'Payment failed', sublabel: detail.failure?.reason ?? 'The payment could not be completed.', date: detail.failure?.date, dot: 'error' },
      ]
    case 'paid': {
      const acct = detail.beneficiary.rows.find((r) => r.label === 'Account number')?.value ?? ''
      return [
        ...done,
        pendingApproval,
        approved,
        ...extra,
        { label: 'Payment initiated', sublabel: `Sent from ${override.paidFrom ?? 'USD checking ***234'}`, date: detail.paidOn, dot: 'success' },
        { label: 'Paid', sublabel: `Sent to ${detail.beneficiary.name} ***${acct.slice(-5)}`, date: detail.paidOn === TODAY ? 'Now' : detail.paidOn, dot: 'success' },
      ]
    }
    case 'rejected':
      return [...done, pendingApproval, ...extra, { label: 'Rejected', sublabel: detail.closeReason, date: detail.closedOn, dot: 'error' }]
    case 'cancelled':
      return [...done, ...extra, { label: 'Cancelled', sublabel: detail.closeReason, date: detail.closedOn, dot: 'error' }]
  }
}

export default function RequestDetailView({ fallbackId, initialModal = null }: { fallbackId: string; initialModal?: DetailModal }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryId = params.get('id')
  const id = queryId ?? fallbackId
  const resolved = useRequest(id)
  // A screen's designed "modal open" state only shows when the route is opened on its own.
  // Row ⋯ menu on the list (Figma 37453:198095) deep-links Edit / Cancel request via `?action=`.
  const action = params.get('action')
  const [modal, setModalState] = useState<DetailModal>(queryId ? (action === 'edit' || action === 'cancel' ? action : null) : initialModal)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [beneficiaryOpen, setBeneficiaryOpen] = useState(true)
  const closeToast = useCallback(() => setToast(null), [])
  // Edit opened from the list's row menu (`?action=edit`) came from the list, so its Back returns there;
  // once the user has been on the detail page itself, Back just closes the drawer.
  const [deepLinked, setDeepLinked] = useState(modal !== null && queryId !== null)
  const close = () => {
    setDeepLinked(false)
    setModalState(null)
  }
  const backFromDrawer = () => (deepLinked && hasInAppHistory() ? navigate(-1) : close())
  // Opening a modal or drawer clears any toast so it never sits on top of the overlay.
  const setModal = (m: DetailModal) => {
    setToast(null)
    setDeepLinked(false)
    setModalState(m)
  }

  if (!resolved) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-semibold text-[#111927]">We couldn’t find request {id}</p>
          <HdsButton variant="secondary" size="sm" onClick={() => navigate('/requests')}>
            Back to requests
          </HdsButton>
        </div>
      </AppShell>
    )
  }

  const { row, detail } = resolved
  const status: RequestStatus = row.statusKey
  const role = row.viewerRole
  const isVendor = detail.type === 'Vendor payment'
  const meta = STATUS_META[status]
  const firstName = detail.requester.name.split(' ')[0]

  const notify = (t: ToastData) => setToast(t)
  const set = (patch: Parameters<typeof updateRequest>[1]) => updateRequest(row.id, patch)
  const goList = (t: ToastData) => navigate('/requests', { state: { toast: t } })

  /* ---------------- actions ---------------- */
  const approve = () => {
    close()
    if (isVendor) {
      set({ status: 'payment-pending', approvedBy: 'John Doe', approvedOn: TODAY, billId: detail.billId ?? `BIL-${row.id.slice(4)}`, events: [] })
      notify({ tone: 'success', title: 'Vendor payment approved', message: `A bill was created and payment scheduled to ${detail.payee}.` })
    } else {
      set({ status: 'payment-pending', approvedBy: 'John Doe', approvedOn: TODAY })
      notify({ tone: 'success', title: 'Reimbursement approved', message: 'It’s now ready for payment.' })
    }
  }
  const reject = (reason: string) => {
    set({ status: 'rejected', closeReason: `“${reason}”`, closedOn: TODAY })
    goList({ tone: 'error', title: isVendor ? 'Vendor payment rejected' : 'Reimbursement rejected', message: `${detail.requester.name} has been notified of the decision.` })
  }
  const requestInfo = (message: string) => {
    close()
    set({
      status: 'needs-action',
      viewerRole: 'approver',
      requestedInfo: [{ from: 'John Doe', message, date: TODAY }, ...(detail.requestedInfo ?? [])],
      infoProvided: null,
    })
    notify({ tone: 'success', title: 'Information requested', message: `${firstName} will be asked to respond before you can approve.` })
  }
  const cancelRequest = () => {
    close()
    set({ status: 'cancelled', closeReason: role === 'requester' ? 'Withdrawn by you' : 'Cancelled by John Doe', closedOn: TODAY })
    notify({ tone: 'success', title: 'Request cancelled', message: 'It’s been removed from the approval queue. You can submit it again later.' })
  }
  const paid = (account: string, method: string) => {
    set({ status: 'paid', paidOn: TODAY, paidFrom: `${account} via ${method}`, failure: null })
  }
  /* -------- header buttons, per state & viewer (exactly as designed) -------- */
  type Btn = { label: string; variant: 'primary' | 'secondary' | 'destructive-secondary'; onClick: () => void }
  let buttons: Btn[] = []

  switch (status) {
    case 'pending-approval':
      buttons =
        role === 'requester'
          ? // Figma 42563:369121 — Cancel request / Edit request
            [
              { label: 'Cancel request', variant: 'secondary', onClick: () => setModal('cancel') },
              { label: 'Edit request', variant: 'primary', onClick: () => setModal('edit') },
            ]
          : // Figma 45476:511964 / 42563:372477 — Request information / Review & approve
            [
              { label: 'Request information', variant: 'secondary', onClick: () => setModal('request-info') },
              { label: 'Review & approve', variant: 'primary', onClick: () => setModal('approve-confirm') },
            ]
      break
    case 'needs-action':
      buttons =
        role === 'requester'
          ? // Figma 37463:882 — Provide further details
            [{ label: 'Provide further details', variant: 'primary', onClick: () => setModal('provide') }]
          : // Figma 41715:339991 — Request information / Review & approve
            [
              { label: 'Request information', variant: 'secondary', onClick: () => setModal('request-info') },
              { label: 'Review & approve', variant: 'primary', onClick: () => setModal('approve-confirm') },
            ]
      break
    case 'payment-pending':
      buttons = isVendor
        ? // Figma 37512:19023 — approved vendor payment became a bill
          [{ label: `View bill ${detail.billId ?? ''}`.trim(), variant: 'secondary', onClick: () => navigate('/bills/review/northwind-design-ltd-vendor-info?status=payment-pending') }]
        : // Figma 42563:372084 — Make payment
          [{ label: 'Make payment', variant: 'primary', onClick: () => setModal('pay') }]
      break
    case 'payment-failed':
      // Figma 42563:369947 — Retry payment (opens review with the original account pre-selected)
      buttons = [{ label: 'Retry payment', variant: 'primary', onClick: () => setModal('retry') }]
      break
    // pending, paid, rejected, cancelled: no CTAs in the design.
  }

  const expenseRows: { label: string; value: ReactNode }[] = isVendor
    ? [
        { label: 'Payee (Merchant / vendor)', value: detail.vendorRef ? `${detail.payee} · ${detail.vendorRef}` : detail.payee },
        { label: 'Request type', value: detail.type },
        { label: 'Date created', value: detail.dateCreated },
        { label: 'Due date', value: detail.dueDate },
        { label: 'Invoice date', value: detail.invoiceDate ?? '—' },
        { label: 'Amount', value: detail.amount },
        { label: 'Category', value: detail.category },
        { label: 'Reason', value: detail.description },
        ...(detail.billId && status === 'payment-pending' ? [{ label: 'Bill', value: detail.billId }] : []),
      ]
    : [
        { label: 'Payee (Merchant/vendor)', value: detail.payee },
        { label: 'Request type', value: detail.type },
        { label: 'Date paid', value: detail.datePaid ?? '—' },
        { label: 'Date created', value: detail.dateCreated },
        { label: 'Due date', value: detail.dueDate },
        { label: 'Amount', value: detail.amount },
        { label: 'Tax on receipt', value: detail.tax ?? '—' },
        { label: 'Category', value: detail.category },
        { label: 'Description', value: detail.description },
      ]

  const timeline = buildTimeline(resolved)
  const requested = detail.requestedInfo ?? []
  const latestAsk = requested[0]?.message ?? 'Please provide more detail on this request.'

  return (
    <AppShell>
      <div className="flex w-full flex-col items-start gap-6 bg-[#f8f8f8] pb-[90px] pt-7">
        <Breadcrumb onClick={() => navigate('/requests')} />

        <div className="flex w-full items-start gap-4">
          <div className="flex flex-1 flex-col items-start gap-3">
            <h1 className="font-heading text-[22px] font-semibold text-[#0c2129]">{detail.requester.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <HdsBadge color={meta.color}>{meta.label}</HdsBadge>
              {row.overdue && OPEN_STATUSES_FOR_OVERDUE.includes(status) && <HdsBadge color="red">Overdue</HdsBadge>}
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            {buttons.map((b) => (
              <HdsButton key={b.label} variant={b.variant} onClick={b.onClick}>
                {b.label}
              </HdsButton>
            ))}
          </div>
        </div>

        <div className="flex w-full items-start gap-4">
          <Card>
            <Section title="Expense">
              <div className="flex w-full flex-col">
                {expenseRows.map((r) => (
                  <InfoRow key={r.label} label={r.label} value={r.value} />
                ))}
              </div>
            </Section>

            <Section title="Beneficiary details">
              <BeneficiaryRow initials={initialsOf(detail.beneficiary.name)} name={detail.beneficiary.name} meta={detail.beneficiary.meta} open={beneficiaryOpen} onToggle={() => setBeneficiaryOpen((o) => !o)} />
              {beneficiaryOpen && (
                <div className="flex w-full flex-col">
                  {detail.beneficiary.rows.map((r) => (
                    <InfoRow key={r.label} label={r.label} value={r.value} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Payout summary">
              <PayoutSummary rows={detail.payout} />
            </Section>

            <Section title="Activity">
              <Timeline items={timeline} />
            </Section>

            {requested.length > 0 && (
              <Section title="Requested information">
                <Timeline items={requested.map((m) => ({ label: 'Information requested', sublabel: `${m.from}: “${m.message}”`, date: m.date, dot: 'muted' }))} />
              </Section>
            )}
          </Card>

          <ReceiptPanel filename={detail.receipt.filename} kind={detail.receipt.kind} onView={() => setModal('preview')} />
        </div>
      </div>

      {/* ---------------- modals & drawers ---------------- */}
      {modal === 'cancel' && (
        <HeroConfirmModal
          tone="warning"
          title="Cancel this request?"
          body={role === 'requester' ? 'It’ll be removed from the approval queue. You can submit it again later.' : `It’ll be removed from the payment queue and ${firstName} will be notified.`}
          onClose={close}
          primary={{ label: role === 'requester' ? 'Withdraw' : 'Cancel request', onClick: cancelRequest, destructive: role !== 'requester' }}
        />
      )}
      {modal === 'approve-confirm' && (
        <HeroConfirmModal
          tone="info"
          title={isVendor ? 'Approve vendor payment?' : 'Approve reimbursement?'}
          body={isVendor ? `Once confirmed, a bill will be created and payment scheduled to ${detail.payee}.` : 'Once approved this reimbursement will be ready for payment'}
          onClose={close}
          secondary={{ label: 'Reject', onClick: () => setModal('reject') }}
          primary={{ label: 'Approve', onClick: approve }}
        />
      )}
      {modal === 'reject' && (
        <ReasonModal
          title="Reject request?"
          subtitle="Add a reason so the requester understands why this was rejected"
          fieldLabel="Reason for rejection"
          placeholder="e.g. This was a private meal, not a company expense"
          submitLabel="Reject request"
          destructive
          onClose={close}
          onSubmit={reject}
        />
      )}
      {modal === 'request-info' && (
        <ReasonModal
          title="Request more information"
          subtitle="Specify the additional details needed to continue the review"
          fieldLabel="Information needed"
          placeholder="e.g. We need a clearer image of the receipt"
          submitLabel="Send request"
          onClose={close}
          onSubmit={requestInfo}
        />
      )}
      {(modal === 'pay' || modal === 'retry') && (
        <ApprovePayDrawer
          detail={detail}
          mode={modal === 'retry' ? 'retry' : 'approve'}
          onClose={close}
          onReject={() => setModal('reject')}
          onPaid={paid}
          onReturnHome={() => goList({ tone: 'success', title: 'Payment sent', message: `${detail.amount} is on its way to ${detail.beneficiary.name}.` })}
        />
      )}
      {modal === 'provide' && (
        <ProvideDetailsDrawer
          requested={latestAsk}
          onClose={close}
          onSubmit={(response, file) => {
            close()
            set({
              status: 'pending-approval',
              infoProvided: { note: response || 'Requested information has been provided', document: file ?? undefined, date: TODAY },
            })
            notify({ tone: 'success', title: 'Details sent', message: `${requested[0]?.from ?? 'Your approver'} will review your update.` })
          }}
        />
      )}
      {modal === 'edit' && (
        <EditRequestDrawer
          detail={detail}
          onClose={close}
          onBack={backFromDrawer}
          onDraft={() => {
            close()
            notify({ tone: 'success', title: 'Saved as draft', message: 'Your changes are saved but not yet resubmitted.' })
          }}
          onSave={(edits) => {
            close()
            set({ edits, events: [{ label: 'Request edited', sublabel: `${detail.requester.name} updated the details`, date: TODAY, tone: 'muted' }] })
            notify({ tone: 'success', title: 'Request updated', message: 'Your approver will see the changes.' })
          }}
        />
      )}
      {modal === 'preview' && <DocumentPreviewModal filename={detail.receipt.filename} src={receiptPreviewSrc(detail.receipt.kind)} onClose={close} />}
      {modal === 'document' && detail.infoProvided?.document && <DocumentPreviewModal filename={detail.infoProvided.document} src={receiptPreviewSrc('receipt')} onClose={close} />}

      {toast && <Toast toast={toast} onClose={closeToast} />}
    </AppShell>
  )
}

const OPEN_STATUSES_FOR_OVERDUE: RequestStatus[] = ['pending-approval', 'needs-action', 'payment-pending', 'payment-failed']

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

