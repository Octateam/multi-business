import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsAlert, HdsBadge, HdsButton, HdsInput, HdsSwitch, HdsTextarea, type BadgeColor } from '../../../components/ui/hds'
import {
  ACCOUNT_TYPE_OPTIONS,
  BANK_OPTIONS,
  COUNTRY_OPTIONS,
  KitSelect,
  PAYMENT_METHOD_OPTIONS,
  VENDOR_CATEGORY_OPTIONS,
  VENDOR_TYPE_OPTIONS,
  toOptions,
} from '../hdsKit'
import {
  APPROVABLE_STATUSES,
  approveVendor,
  decideBill,
  money,
  setBillPaused,
  setBillStatus,
  useBillProgress,
  useBillRecord,
  useReviewQueue,
  type BillRecord,
  type ReviewDecision,
} from '../list/billRecords'
import { BillsBackLink, ReviewHeader, UploadPreviewBox, VendorHeader, VendorSummaryCardBody, withValue } from './shared'
import { STATUS_BADGE } from './billViewShell'
import { BillPaymentDrawer, type PaymentMode } from './BillPaymentDrawer'
import CancelBillModal from './CancelBillModal'
import PauseBillConfirmModal from './PauseBillConfirmModal'
import { ApprovalContent, BillDetailsContent, VendorInfoCards } from './billViewContent'
import queueCaret from '../../../assets/icons/review-queue-caret.svg'

// ---------------------------------------------------------------------------
// Multi-bill review queue — Figma 45033:208459 ("Bill review — queue (new
// vendor details form)"). Opened from the bills table's "n Selected | Review"
// bar (41310:643438) or a row's "Review bill": the left "Review queue" lists
// exactly the picked bills (count + total), the active one opens on the right
// and is stepped through Vendor info → Bill details → Approval, then approved
// / rejected / sent back with "Request information"; the queue moves on to the
// next bill still waiting for a decision. Active bill + step live in the URL
// (`?bill=&step=`) so Back/refresh-free navigation keeps your place; the
// picked bills and decisions live in the bills store (list/billRecords).
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'Vendor info' },
  { n: 2, label: 'Bill details' },
  { n: 3, label: 'Approval' },
]

const STATUS_COLOR: Record<string, BadgeColor> = {
  Overdue: 'amber',
  'Pending approval': 'amber',
  'Needs action': 'navy',
  'Payment failed': 'red',
  'Payment pending': 'navy',
  Paid: 'green',
  Cancelled: 'red',
  Draft: 'grey',
}
const DECISION_COLOR: Record<ReviewDecision, BadgeColor> = {
  Approved: 'green',
  Rejected: 'red',
  'Info requested': 'navy',
  'Vendor rejected': 'red',
}

// Not specified in Figma — US states for an ACH payee address.
const US_STATE_OPTIONS = toOptions(['California', 'Colorado', 'Florida', 'Georgia', 'Illinois', 'Massachusetts', 'New Jersey', 'New York', 'Texas', 'Washington'])

/* ------------------------------------------------------------------ */
/*  Left rail — "Review queue" (Figma 45033:208690)                    */
/* ------------------------------------------------------------------ */

function ReviewQueueRail({
  bills,
  activeId,
  decisions,
  onSelect,
}: {
  bills: BillRecord[]
  activeId: string
  decisions: Record<string, ReviewDecision>
  onSelect: (id: string) => void
}) {
  const total = bills.reduce((s, b) => s + b.total, 0)
  return (
    <aside aria-label="Review queue" className="flex w-[272px] shrink-0 flex-col gap-[12.8px] rounded-2xl bg-white px-[12.8px] py-4">
      <div className="flex flex-col gap-2 border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-1">
          <p className="font-heading text-xl font-medium leading-7 tracking-[-0.2px] text-[#111927]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
            Review queue
          </p>
          <span data-queue-count className="contents">
            <HdsBadge color="grey" size="sm">
              {bills.length}
            </HdsBadge>
          </span>
        </div>
        <p className="text-sm font-medium text-[#6b7280]">
          Total of <span className="text-[#111927]" data-queue-total>{money(total, bills[0]?.symbol ?? '$')}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {bills.map((b) => {
          const active = b.id === activeId
          const decision = decisions[b.id]
          return (
            <button
              key={b.id}
              type="button"
              data-queue-item={b.id}
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelect(b.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl py-2 pl-3 pr-3 text-left transition-colors ${ active ? 'bg-[#f8fafc]' : 'hover:bg-[#f8fafc]' }`}
            >
              <span className="flex min-w-0 flex-col gap-[1.6px]">
                <span className={`truncate text-sm leading-5 text-[#384250] ${active ? 'font-semibold' : 'font-medium'}`}>{b.vendor}</span>
                <span className="text-sm leading-5 text-[#4b5563]">{b.amount}</span>
                <span className="flex flex-wrap gap-0.5">
                  {decision ? (
                    <HdsBadge color={DECISION_COLOR[decision]} size="sm">
                      {decision}
                    </HdsBadge>
                  ) : (
                    <HdsBadge color={STATUS_COLOR[b.status] ?? 'grey'} size="sm">
                      {b.status}
                    </HdsBadge>
                  )}
                  {b.vendorInfo.isNew && !decision && (
                    <HdsBadge color="navy" size="sm">
                      New vendor
                    </HdsBadge>
                  )}
                </span>
              </span>
              {active && (
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <img src={queueCaret} alt="" width={9.3335} height={5.33333} className="-rotate-90" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Stepper (Figma 45033:208657)                                       */
/* ------------------------------------------------------------------ */

function QueueStepper({ step, maxStep, onStep }: { step: Step; maxStep: Step; onStep: (s: Step) => void }) {
  return (
    <nav aria-label="Bill steps" className="flex items-center">
      {STEPS.map((s, i) => {
        const active = s.n === step
        const reachable = s.n <= maxStep && !active
        const content = (
          <>
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-semibold leading-[14px] ${ active ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#cbd0d8] bg-white text-[#4b5563]' }`}
            >
              {s.n}
            </span>
            <span className={`whitespace-nowrap leading-5 ${active ? 'text-sm font-semibold text-[#111927]' : 'text-[13px] font-medium text-[#4b5563]'}`}>{s.label}</span>
          </>
        )
        return (
          <div key={s.n} className="flex items-center">
            {reachable ? (
              <button type="button" onClick={() => onStep(s.n)} className="flex items-center gap-2 rounded-md hover:[&>span:last-child]:underline">
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
                {content}
              </div>
            )}
            {i < STEPS.length - 1 && (
              <div className="px-3">
                <div className="h-px w-[88px] bg-[#edeff2]" />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 1 for a new vendor — editable vendor details form             */
/* ------------------------------------------------------------------ */

type VendorForm = {
  vendorType: string
  firstName: string
  lastName: string
  businessName: string
  category: string
  country: string
  method: string
  accountName: string
  bankName: string
  routing: string
  accountNumber: string
  accountType: string
  address: string
  state: string
  city: string
  postalCode: string
  hasTaxId: boolean
  taxId: string
  email: string
  phone: string
  contactAddress: string
}

const vendorFormFrom = (b: BillRecord): VendorForm => ({
  vendorType: b.vendorInfo.type,
  firstName: b.vendorInfo.firstName ?? '',
  lastName: b.vendorInfo.lastName ?? '',
  businessName: b.vendorInfo.name,
  category: b.vendorInfo.category,
  country: b.payment.country === 'United States of America' ? 'United States' : b.payment.country,
  method: b.payment.method,
  accountName: b.payment.accountName,
  bankName: b.payment.bank,
  routing: b.payment.codes.find(([k]) => /routing|sort/i.test(k))?.[1] ?? '',
  accountNumber: b.payment.accountNumber,
  accountType: b.payment.accountType,
  address: b.payment.address,
  state: b.payment.state ?? '',
  city: b.payment.city,
  postalCode: b.payment.postalCode,
  hasTaxId: !!b.payment.taxId && b.payment.taxId !== '—',
  taxId: b.payment.taxId,
  email: b.contact.email,
  phone: b.contact.phone,
  contactAddress: b.contact.address,
})

const vendorFormValid = (f: VendorForm) => {
  const names = f.vendorType === 'Individual' ? [f.firstName, f.lastName] : [f.businessName]
  const required = [...names, f.category, f.country, f.method, f.accountName, f.bankName, f.routing, f.accountNumber, f.accountType, f.address, f.city, f.postalCode, f.email, f.phone]
  return required.every((v) => v.trim() !== '') && (!f.hasTaxId || f.taxId.trim() !== '')
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="border-b border-[#f3f4f6] pb-2 text-sm font-semibold leading-5 text-[#111927]">{children}</p>
}

function NewVendorForm({ form, onChange }: { form: VendorForm; onChange: (patch: Partial<VendorForm>) => void }) {
  const input = (key: keyof VendorForm, label: string, extra?: { optional?: boolean; helper?: string; placeholder?: string }) => (
    <HdsInput
      label={label}
      required={!extra?.optional}
      optional={extra?.optional}
      helper={extra?.helper}
      placeholder={extra?.placeholder ?? `Enter ${label.toLowerCase()}`}
      containerClassName="min-w-0 flex-1"
      value={String(form[key])}
      onChange={(e) => onChange({ [key]: e.target.value } as Partial<VendorForm>)}
    />
  )
  const select = (key: keyof VendorForm, label: string, options: { value: string; label: string }[], helper?: string) => (
    <KitSelect
      label={label}
      required
      helper={helper}
      className="min-w-0 flex-1"
      options={withValue(options, String(form[key]))}
      value={String(form[key]) || null}
      onChange={(v) => onChange({ [key]: v } as Partial<VendorForm>)}
    />
  )
  return (
    <div className="flex flex-col gap-4" data-new-vendor-form>
      {select('vendorType', 'Vendor type', VENDOR_TYPE_OPTIONS)}
      {form.vendorType === 'Individual' ? (
        <div className="flex gap-4">
          {input('firstName', 'First name')}
          {input('lastName', 'Last name')}
        </div>
      ) : (
        input('businessName', 'Business name')
      )}
      {select('category', 'Category', VENDOR_CATEGORY_OPTIONS)}

      <SectionTitle>Payment details</SectionTitle>
      {select('country', 'Country', COUNTRY_OPTIONS, 'Where the vendor’s account is held')}
      {select('method', 'Payment method', PAYMENT_METHOD_OPTIONS)}
      {input('accountName', 'Account name')}
      <div className="flex gap-4">
        <KitSelect
          label="Bank name"
          required
          className="min-w-0 flex-1"
          options={withValue(BANK_OPTIONS, form.bankName)}
          value={form.bankName || null}
          onChange={(v) => onChange({ bankName: v })}
          searchable
          searchPlaceholder="Search bank"
        />
        {input('routing', 'Routing number')}
      </div>
      <div className="flex gap-4">
        {input('accountNumber', 'Account number')}
        {select('accountType', 'Account type', ACCOUNT_TYPE_OPTIONS)}
      </div>
      {input('address', 'Address line 1')}
      {form.state !== '' && select('state', 'State', US_STATE_OPTIONS)}
      <div className="flex gap-4">
        {input('city', 'City')}
        {input('postalCode', 'Postal code')}
      </div>
      <HdsSwitch label="This vendor has a tax ID" checked={form.hasTaxId} onChange={(v) => onChange({ hasTaxId: v })} />
      {form.hasTaxId && input('taxId', 'Tax identification number')}

      <SectionTitle>Contact details</SectionTitle>
      {input('email', 'Email')}
      {input('phone', 'Phone')}
      {input('contactAddress', 'Address', { optional: true })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Modals (dark full-screen overlay)                                  */
/* ------------------------------------------------------------------ */

function Modal({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="flex w-[520px] max-w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-xl font-semibold text-[#111927]">{title}</p>
          <p className="text-sm text-[#6b7280]">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

function ReasonModal({
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  destructive,
  onClose,
  onConfirm,
}: {
  title: string
  description: string
  label: string
  placeholder: string
  confirmLabel: string
  destructive?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Modal title={title} description={description} onClose={onClose}>
      <HdsTextarea label={label} required value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder={placeholder} maxChars={240} />
      <div className="flex justify-end gap-3">
        <HdsButton variant="secondary" onClick={onClose}>
          Cancel
        </HdsButton>
        <HdsButton variant={destructive ? 'destructive' : 'primary'} disabled={!reason.trim()} onClick={() => onConfirm(reason)}>
          {confirmLabel}
        </HdsButton>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

type ModalKind = 'approve' | 'reject' | 'info' | 'vendor-reject' | 'cancel' | 'pause' | null

/**
 * Approver header actions for the bill's status — Figma 48121:459876:
 *   awaiting approval (Pending approval / Overdue / Needs action) → Request information · Review & approve
 *   Payment failed → Cancel bill · Retry payment
 *   Payment pending (approved, unpaid) → Make payment, or Pay balance once part of it has been paid
 *   Paid recurring bill → Cancel bill · Pause bill (paused: Cancel · Resume)
 *   anything else (paid one-time, cancelled, draft) → no actions
 */
function ApproverActions({
  bill,
  approvable,
  canApprove,
  paused,
  paid,
  onModal,
  onPay,
}: {
  bill: BillRecord
  approvable: boolean
  canApprove: boolean
  paused: boolean
  paid: number
  onModal: (m: ModalKind) => void
  onPay: (mode: PaymentMode) => void
}) {
  if (approvable)
    return (
      <>
        <HdsButton variant="secondary" onClick={() => onModal('info')}>
          Request information
        </HdsButton>
        <HdsButton variant="primary" disabled={!canApprove} onClick={() => onModal('approve')}>
          Review &amp; approve
        </HdsButton>
      </>
    )
  if (bill.status === 'Payment failed')
    return (
      <>
        <HdsButton variant="destructive-secondary" onClick={() => onModal('cancel')}>
          Cancel bill
        </HdsButton>
        <HdsButton variant="primary" onClick={() => onPay('retry')}>
          Retry payment
        </HdsButton>
      </>
    )
  if (bill.status === 'Payment pending')
    return paid > 0 ? (
      <HdsButton variant="primary" onClick={() => onPay('balance')}>
        Pay balance
      </HdsButton>
    ) : (
      <HdsButton variant="primary" onClick={() => onPay('pay')}>
        Make payment
      </HdsButton>
    )
  if (bill.status === 'Paid' && bill.billType === 'Recurring')
    return paused ? (
      <>
        <HdsButton variant="destructive-secondary" onClick={() => onModal('cancel')}>
          Cancel
        </HdsButton>
        <HdsButton variant="primary" onClick={() => setBillPaused(bill.id, false)}>
          Resume
        </HdsButton>
      </>
    ) : (
      <>
        <HdsButton variant="destructive-secondary" onClick={() => onModal('cancel')}>
          Cancel bill
        </HdsButton>
        <HdsButton variant="primary" onClick={() => onModal('pause')}>
          Pause bill
        </HdsButton>
      </>
    )
  return null
}

/** Multi-bill review queue (two or more bills selected). */
export default function QueueNewVendorDetailsForm() {
  return <ApproverReview />
}

/**
 * The approver's review screen. With `single` it shows ONE bill (`?bill=`) without the review queue, and the
 * top area carries the vendor name, status, created date and the status's actions like the requester view.
 */
export function ApproverReview({ single = false }: { single?: boolean }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const queue = useReviewQueue()
  const singleBill = useBillRecord(params.get('bill'))
  const bills = single ? [singleBill] : queue.records
  const { decisions, approvedVendors } = queue

  const activeId = bills.some((b) => b.id === params.get('bill')) ? params.get('bill')! : (bills[0]?.id ?? '')
  const bill = bills.find((b) => b.id === activeId)
  const stepParam = Number(params.get('step'))
  const step: Step = stepParam === 2 || stepParam === 3 ? stepParam : 1

  // Furthest step reached per bill — completed steps stay clickable in the stepper.
  const [reached, setReached] = useState<Record<string, Step>>({})
  const maxStep = Math.max(reached[activeId] ?? 1, step) as Step
  // Vendor details per bill, seeded from the bill (edits survive switching bills).
  const [forms, setForms] = useState<Record<string, VendorForm>>({})
  const form = useMemo(() => (bill ? (forms[bill.id] ?? vendorFormFrom(bill)) : null), [bill, forms])
  const [modal, setModal] = useState<ModalKind>(null)
  const [payment, setPayment] = useState<PaymentMode | null>(null)
  const progress = useBillProgress(bill?.id ?? '')

  const go = (id: string, s: Step = 1) => {
    setReached((r) => ({ ...r, [id]: Math.max(r[id] ?? 1, s) as Step }))
    setParams({ bill: id, step: String(s) }, { replace: single })
  }

  if (!bill || !form) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 p-16 text-center">
          <p className="font-heading text-xl font-semibold text-[#111927]">Nothing to review</p>
          <p className="text-sm text-[#6b7280]">Select bills on the Bills list, then choose Review.</p>
          <HdsButton onClick={() => navigate('/bills')}>Back to bills</HdsButton>
        </div>
      </AppShell>
    )
  }

  const decision = decisions[bill.id]
  const approvable = APPROVABLE_STATUSES.includes(bill.status) && !decision
  const newVendor = !!bill.vendorInfo.isNew
  const vendorApproved = !newVendor || approvedVendors.includes(bill.id)
  const formValid = vendorFormValid(form)
  const pendingCount = bills.filter((b) => !decisions[b.id]).length
  const nextUndecided = (after: string) => {
    const idx = bills.findIndex((b) => b.id === after)
    const rest = [...bills.slice(idx + 1), ...bills.slice(0, idx)]
    return rest.find((b) => !decisions[b.id] && b.id !== after)
  }
  const nextBill = bills[bills.findIndex((b) => b.id === bill.id) + 1]

  const decide = (d: ReviewDecision, status: Parameters<typeof decideBill>[2]) => {
    decideBill(bill.id, d, status)
    setModal(null)
    if (single) return
    const next = nextUndecided(bill.id)
    if (next) go(next.id, 1)
  }
  const actions = (
    <ApproverActions
      bill={bill}
      approvable={approvable}
      canApprove={step === 3 && vendorApproved}
      paused={progress.paused}
      paid={progress.paid}
      onModal={setModal}
      onPay={setPayment}
    />
  )

  const canNext = step === 1 ? (!approvable || vendorApproved) : true
  const footer = (
    <div className="sticky bottom-0 z-20 w-full border-t border-[#e5e7eb] bg-white py-3.5">
      <div className="flex w-full items-center justify-center gap-4">
        {!single && <div className="w-[272px] shrink-0" aria-hidden="true" />}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          {step > 1 && (
            <HdsButton variant="secondary" onClick={() => go(bill.id, (step - 1) as Step)}>
              Previous
            </HdsButton>
          )}
          {step < 3 && (
            <HdsButton variant="primary" disabled={!canNext} onClick={() => go(bill.id, (step + 1) as Step)}>
              Next
            </HdsButton>
          )}
          {step === 3 && approvable && (
            <>
              <HdsButton variant="destructive-secondary" onClick={() => setModal('reject')}>
                Reject
              </HdsButton>
              <HdsButton variant="primary" disabled={!vendorApproved} onClick={() => setModal('approve')}>
                Approve
              </HdsButton>
            </>
          )}
          {step === 3 && !approvable && (!single && nextBill ? (
            <HdsButton variant="primary" onClick={() => go(nextBill.id, 1)}>
              Next bill
            </HdsButton>
          ) : (
            <HdsButton variant="primary" onClick={() => navigate('/bills')}>
              Back to bills
            </HdsButton>
          ))}
        </div>
        <div className="w-[272px] shrink-0" aria-hidden="true" />
      </div>
    </div>
  )

  return (
    <AppShell>
      <div className="flex min-h-full w-full flex-col">
        {single ? (
          <div className="flex flex-col gap-6 pt-7">
            <BillsBackLink />
            <VendorHeader
              vendorName={bill.vendor}
              status={STATUS_BADGE[bill.status] ?? 'neutral'}
              statusLabel={progress.paused ? `${bill.status} · Paused` : bill.status}
              createdBy={bill.createdBy ?? 'John Doe'}
              createdDate={bill.createdDate}
              actions={actions}
            />
          </div>
        ) : (
          <ReviewHeader title="Review bill" subtitle="Go through the details and take action" actions={actions} />
        )}

        <div className="flex flex-1 items-start justify-center gap-4 py-5">
          {!single && <ReviewQueueRail bills={bills} activeId={bill.id} decisions={decisions} onSelect={(id) => go(id, 1)} />}

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <QueueStepper step={step} maxStep={maxStep} onStep={(s) => go(bill.id, s)} />

            {!single && pendingCount === 0 && (
              <HdsAlert tone="green" title={`All ${bills.length} bills reviewed`}>
                {Object.values(decisions).filter((d) => d === 'Approved').length} approved ·{' '}
                {Object.values(decisions).filter((d) => d === 'Rejected').length} rejected ·{' '}
                {Object.values(decisions).filter((d) => d === 'Info requested' || d === 'Vendor rejected').length} sent back.{' '}
                <button type="button" className="font-semibold underline" onClick={() => navigate('/bills')}>
                  Back to bills
                </button>
              </HdsAlert>
            )}
            {decision && (
              <HdsAlert tone={decision === 'Approved' ? 'green' : decision === 'Info requested' ? 'blue' : 'red'} title={`${decision} — ${bill.vendor}`}>
                {decision === 'Approved'
                  ? `This bill is now ${bill.status.toLowerCase()}.`
                  : decision === 'Rejected'
                    ? 'This bill was rejected and moved to Closed.'
                    : 'The requester has been asked for more details; the bill is in Needs action.'}
              </HdsAlert>
            )}
            {progress.paused && (
              <HdsAlert tone="blue" title="This recurring bill is paused">
                No new cycles will be created until you resume it.
              </HdsAlert>
            )}

            <div className="flex flex-col gap-4 rounded-2xl bg-white px-6 py-8" data-queue-step={step}>
              {step === 1 && newVendor && approvable ? (
                <>
                  <div className="flex flex-col gap-6">
                    <p className="font-heading text-lg font-medium text-[#111927]">Vendor</p>
                    <HdsBadge color={vendorApproved ? 'green' : 'navy'} size="sm">
                      {vendorApproved ? 'Vendor approved' : 'New vendor'}
                    </HdsBadge>
                  </div>
                  <NewVendorForm form={form} onChange={(patch) => setForms((f) => ({ ...f, [bill.id]: { ...form, ...patch } }))} />
                </>
              ) : step === 1 ? (
                <VendorInfoCards bill={bill} contact />
              ) : step === 2 ? (
                <BillDetailsContent bill={bill} />
              ) : (
                <ApprovalContent bill={bill} />
              )}
            </div>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-5">
            <UploadPreviewBox label="Invoice uploaded" filename={bill.invoiceFile} />
            <div className="flex w-full flex-col gap-4 rounded-2xl bg-white pb-4">
              <p className="border-b border-[#f3f4f6] px-4 py-2.5 text-sm font-semibold text-[#111927]">Vendor summary</p>
              <div className="px-4">
                <VendorSummaryCardBody
                  name={bill.vendor}
                  meta={`${bill.vendorInfo.type} · ${bill.vendorInfo.category}`}
                  status={newVendor ? { label: vendorApproved ? 'Approved' : 'New vendor', status: vendorApproved ? 'approved' : 'info' } : undefined}
                  email={form.email}
                  phone={form.phone}
                  bank={`${form.bankName} ${form.accountNumber.slice(-4) ? `... ${form.accountNumber.slice(-4)}` : ''} (${form.method})`}
                  location={[form.city, form.state, form.country].filter(Boolean).join(', ')}
                />
              </div>
              {newVendor && approvable && step === 1 && (
                <div className="flex flex-col gap-[11px] px-4">
                  <HdsButton
                    variant="primary"
                    fullWidth
                    disabled={!formValid || vendorApproved}
                    onClick={() => approveVendor(bill.id)}
                  >
                    {vendorApproved ? 'Vendor approved' : 'Approve vendor'}
                  </HdsButton>
                  <HdsButton variant="destructive-secondary" fullWidth disabled={vendorApproved} onClick={() => setModal('vendor-reject')}>
                    Reject
                  </HdsButton>
                  {!vendorApproved && (
                    <p className="text-xs text-[#6b7280]">{formValid ? 'Approve the vendor to continue to bill details.' : 'Complete the vendor details to approve this vendor.'}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {footer}
      </div>

      {modal === 'approve' && (
        <Modal
          title="Approve bill payment?"
          description={`You’re about to approve a payment of ${bill.amount} to ${bill.vendor}. This action can’t be undone.`}
          onClose={() => setModal(null)}
        >
          <div className="flex justify-end gap-3">
            <HdsButton variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </HdsButton>
            <HdsButton variant="primary" onClick={() => decide('Approved', 'Payment pending')}>
              Approve payment
            </HdsButton>
          </div>
        </Modal>
      )}
      {modal === 'reject' && (
        <ReasonModal
          title="Reject bill payment?"
          description="Add a reason so the requester understands why this can’t proceed."
          label="Reason for rejection"
          placeholder="Reason for rejection"
          confirmLabel="Reject bill"
          destructive
          onClose={() => setModal(null)}
          onConfirm={() => decide('Rejected', 'Cancelled')}
        />
      )}
      {modal === 'info' && (
        <ReasonModal
          title="Request more information"
          description="Specify the additional details needed to continue the review"
          label="Information needed"
          placeholder="Describe what additional information or documents you need from the requester"
          confirmLabel="Send"
          onClose={() => setModal(null)}
          onConfirm={() => decide('Info requested', 'Needs action')}
        />
      )}
      {modal === 'cancel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CancelBillModal
              onClose={() => setModal(null)}
              onConfirm={() => {
                setBillStatus(bill.id, 'Cancelled')
                setBillPaused(bill.id, false)
                setModal(null)
              }}
            />
          </div>
        </div>
      )}
      {modal === 'pause' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PauseBillConfirmModal
              onClose={() => setModal(null)}
              onConfirm={() => {
                setBillPaused(bill.id, true)
                setModal(null)
              }}
            />
          </div>
        </div>
      )}
      {payment && <BillPaymentDrawer bill={bill} paid={progress.paid} mode={payment} onClose={() => setPayment(null)} />}
      {modal === 'vendor-reject' && (
        // Figma annotation on 45078:149397: rejecting the vendor needs a reason, keeps it off the approved
        // list and moves the payment request to Needs action so the requester can fix the vendor.
        <ReasonModal
          title="Reject this vendor?"
          description="The vendor won’t be added to your approved vendors. The bill moves to Needs action so the requester can correct the vendor or pick another one."
          label="Reason"
          placeholder="Explain what needs to be corrected"
          confirmLabel="Reject vendor"
          destructive
          onClose={() => setModal(null)}
          onConfirm={() => decide('Vendor rejected', 'Needs action')}
        />
      )}
    </AppShell>
  )
}
