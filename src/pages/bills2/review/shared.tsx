import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Badge, { type BadgeStatus } from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Chevron, HdsActionMenu, HdsBadge, HdsButton, HdsDatePicker, type ActionItem } from '../../../components/ui/hds'
import type { BillDraft } from '../addBill/billDraft'
import {
  CalendarGlyph,
  Flag,
  KitSelect,
  MenuSelect,
  CURRENCY_CODE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  VENDOR_CATEGORY_OPTIONS,
  VENDOR_TYPE_OPTIONS,
  type SelectOption,
} from '../hdsKit'
import flagUnitedStates from '../../../assets/icons/review2-flag-united-states.svg'
import cancelSquare from '../../../assets/icons/review1-cancel-square.svg'
import removeIcon from '../../../assets/icons/review1-remove.svg'
import receiptPreview from '../../../assets/img/review1-receipt-preview.png'
import mailIcon from '../../../assets/icons/claimbills-mail-icon.svg'
import phoneIcon from '../../../assets/icons/claimbills-phone-icon.svg'
import bankIcon from '../../../assets/icons/bank.svg'
import locationIcon from '../../../assets/icons/claimbills-location-icon.svg'
import backChevron from '../../../assets/icons/review4-icon-back-chevron.svg'

// ---------------------------------------------------------------------------
// Shared shell for the "Bill review" queue flow (Figma node family under
// 45033:20xxxx–45033:22xxxx). Every screen in this flow is a 3-step wizard
// (Vendor info -> Bill details -> Approval) with a bordered header, a
// stepper, a two/three-column body (optional queue rail, main content card
// stack, optional receipt-preview rail) and either header or footer action
// buttons. Built from `get_design_context`/`get_metadata` responses on
// BillDetailsOneTimeBill (45033:219406), NorthwindDesignLtdBillDetails
// (45033:222571) and this agent's own 10 screens — see the handback report
// for the judgment calls made where a full code response wasn't available.
// ---------------------------------------------------------------------------

export const REVIEW_STEPS = [
  { step: 1 as const, label: 'Vendor info', to: '/bills/review/vendor-info-tab-acme-print-co-new-vendor' },
  { step: 2 as const, label: 'Bill details', to: '/bills/review/bill-details-tab-payment-failed-retry' },
  { step: 3 as const, label: 'Approval', to: '/bills/review/approval-tab-workflow-activity' },
]

export function ReviewHeader({
  title = 'Review bill',
  subtitle,
  backTo = '/bills',
  actions,
}: {
  title?: string
  subtitle: string
  backTo?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex w-full items-center gap-6 border-b border-[#e5e7eb] pb-4 pt-6">
      <Link to={backTo} aria-label="Close" className="shrink-0 pt-2">
        <img src={cancelSquare} alt="" className="size-6" />
      </Link>
      <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-text-primary">{title}</p>
          <p className="text-base text-[#70707d]">{subtitle}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export function ReviewStepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-3 pt-6">
      {REVIEW_STEPS.map((s, i) => (
        <div key={s.step} className="flex items-center gap-3">
          <Link to={s.to} className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-[6px] border text-[10px] font-semibold ${ s.step === active ? 'border-[#cbd0d8] bg-surface text-text-primary' : 'border-transparent bg-transparent text-text-quaternary' }`}
            >
              {s.step}
            </span>
            <span className={`text-[13px] font-medium ${s.step === active ? 'text-text-primary' : 'text-text-quaternary'}`}>
              {s.label}
            </span>
          </Link>
          {i < REVIEW_STEPS.length - 1 && <span className="h-px w-[88px] bg-[#edeff2]" />}
        </div>
      ))}
    </div>
  )
}

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`w-full rounded-2xl border border-[#e5e7eb] bg-white p-[19px] ${className}`}>
      {title && (
        <div className="flex items-center justify-between pb-2">
          <p className="font-heading text-lg font-medium text-text-primary">{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function DefinitionRow({ term, description }: { term: string; description: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 py-[9px]">
      <p className="shrink-0 text-sm text-text-quaternary">{term}</p>
      <p className="text-right text-sm font-medium text-text-primary">{description}</p>
    </div>
  )
}

export function UploadPreviewBox({
  label = 'Invoice uploaded',
  filename = 'NW-2481.pdf',
  className = '',
  onRemove,
}: {
  label?: string
  filename?: string
  className?: string
  onRemove?: () => void
}) {
  return (
    <div className={`flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-[#4b5563]">{filename}</p>
        </div>
        <button
          type="button"
          aria-label="Remove file"
          onClick={onRemove}
          className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-[#cdd5df] hover:bg-[#b7c0cc]"
        >
          <img src={removeIcon} alt="" className="h-[9px] w-[10px]" />
        </button>
      </div>
      <div className="relative aspect-[246/253] w-full overflow-hidden rounded-lg border border-[#f3f4f6]">
        <img src={receiptPreview} alt="Invoice preview" className="size-full object-cover" />
      </div>
    </div>
  )
}

export type QueueItem = { name: string; amount?: string; badges: { label: string; status: BadgeStatus }[] }

export function ReviewQueuePanel({
  heading = 'Review queue',
  count = 4,
  total = '$28,450.00',
  items,
}: {
  heading?: string
  count?: number
  total?: string
  items: QueueItem[]
}) {
  return (
    <div className="flex w-[272px] shrink-0 flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-heading text-xl font-medium text-text-primary">{heading}</p>
          <HdsBadge color="grey" size="sm">
            {count}
          </HdsBadge>
        </div>
        <p className="text-sm text-text-quaternary">
          Total of <span className="font-semibold text-text-primary">{total}</span>
        </p>
      </div>
      <div className="flex flex-col gap-1 border-t border-[#e5e7eb] pt-2">
        {items.map((item) => (
          <div key={item.name} className="flex flex-col gap-1.5 rounded-lg px-3 py-2.5 hover:bg-surface-2">
            <p className="text-sm font-medium text-text-primary">{item.name}</p>
            {item.amount && <p className="text-sm text-text-quaternary">{item.amount}</p>}
            <div className="flex flex-wrap gap-1.5">
              {item.badges.map((b) => (
                <Badge key={b.label} status={b.status} label={b.label} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center gap-3 border-t border-[#e5e7eb] bg-white py-3.5">
      {children}
    </div>
  )
}

export function ReviewBody({ left, right, children }: { left?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
      {left}
      <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">{children}</div>
      {right}
    </div>
  )
}

/** Dimmed full-bleed overlay used by the approve/reject confirmation screens. */
export function ConfirmModalOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(10,13,18,0.5)]">
      <div className="flex w-[483px] max-w-[90vw] flex-col gap-6 rounded-[24px] bg-white p-8 shadow-xl">{children}</div>
    </div>
  )
}

/* HDS input-row tokens for the label-inside field boxes (Figma layout kept):
 * bg-secondary #f5f6f8, 0.5px #edeff2; hover #edeff2 / #e1e4e9; focus/open 1px brand #004b87. */
const FIELD_BOX =
  'flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg px-3.5 py-2.5 text-left transition-colors duration-150'
const FIELD_BOX_IDLE =
  'border-[0.5px] border-[#edeff2] bg-[#f5f6f8] hover:border-[#e1e4e9] hover:bg-[#edeff2] focus-within:border focus-within:border-[#004b87] focus-within:bg-[#f5f6f8]'
const FIELD_BOX_OPEN = 'border border-[#004b87] bg-[#f5f6f8]'

/** Makes sure a pre-filled value from Figma is selectable even if it isn't in the shared option set. */
export const withValue = (options: SelectOption[], value: string): SelectOption[] =>
  !value || options.some((o) => o.value === value) ? options : [{ value, label: value }, ...options]

/**
 * A label-inside field box, used on the manual-entry / OCR / new-vendor screens.
 * - `onChange` only → HDS text input
 * - `options` → HDS select (dark dropdown menu, searchable when long)
 * - neither → read-only value
 */
export function FieldDisplay({
  label,
  value,
  className = '',
  placeholder,
  onChange,
  options,
  searchPlaceholder,
  trailing,
}: {
  label: string
  value: string
  className?: string
  placeholder?: string
  onChange?: (v: string) => void
  options?: SelectOption[]
  searchPlaceholder?: string
  trailing?: ReactNode
}) {
  const [local, setLocal] = useState(value)
  if (options) {
    const current = onChange ? value : local
    return (
      <MenuSelect
        className={`min-w-0 flex-1 ${className}`}
        options={withValue(options, current)}
        value={current}
        width="100%"
        searchPlaceholder={searchPlaceholder}
        onChange={(v) => (onChange ? onChange(v) : setLocal(v))}
        trigger={({ open, toggle, selected }) => (
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={toggle}
            className={`${FIELD_BOX} w-full ${open ? FIELD_BOX_OPEN : FIELD_BOX_IDLE}`}
          >
            <span className="text-xs text-[#6b7280]">{label}</span>
            <span className="flex w-full items-center gap-2">
              {selected?.icon && <span className="flex shrink-0 items-center">{selected.icon}</span>}
              <span className={`min-w-0 flex-1 truncate text-sm ${current ? 'font-medium text-[#111927]' : 'text-[#9aa1ac]'}`}>
                {selected?.label ?? (current || placeholder || 'Select')}
              </span>
              <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
            </span>
          </button>
        )}
      />
    )
  }
  return (
    <div className={`${FIELD_BOX} ${FIELD_BOX_IDLE} ${className}`}>
      <p className="text-xs text-[#6b7280]">{label}</p>
      <div className="flex w-full items-center gap-2">
        {onChange ? (
          <input
            className="w-full min-w-0 truncate bg-transparent text-sm font-medium text-[#111927] outline-none placeholder:font-normal placeholder:text-[#9aa1ac]"
            value={value}
            placeholder={placeholder}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#111927]">{value}</p>
        )}
        {trailing && <span className="flex shrink-0 text-[#6b7280]">{trailing}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Payment selects shared by the Confirm-payment / Pay-balance panels */
/* ------------------------------------------------------------------ */

/** Source accounts exactly as shown in Figma (Pay from dropdown, 45033:2xxxxx). */
export const SOURCE_ACCOUNT_OPTIONS: SelectOption[] = [
  { value: 'operations', label: 'Operations account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUnitedStates} className="size-5" /> },
  { value: 'marketing', label: 'Marketing account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUnitedStates} className="size-5" /> },
  { value: 'treasury', label: 'Treasury account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUnitedStates} className="size-5" /> },
]

/** HDS "Pay from" select — two-line value (account name + balance) inside the 44px input row. */
export function PayFromSelect({
  value,
  onChange,
  defaultOpen,
  menuMode = 'overlay',
}: {
  value: string | null
  onChange: (v: string) => void
  defaultOpen?: boolean
  menuMode?: 'overlay' | 'inline'
}) {
  return (
    <KitSelect
      label="Pay from"
      placeholder="Select source account"
      options={SOURCE_ACCOUNT_OPTIONS}
      value={value}
      onChange={onChange}
      defaultOpen={defaultOpen}
      menuMode={menuMode}
      renderValue={(o) => (
        <span className="flex flex-col">
          <span className="truncate text-[13px] font-medium leading-4 text-[#111927]">{o.label}</span>
          <span className="truncate text-[11px] leading-[14px] text-[#6b7280]">{o.description}</span>
        </span>
      )}
    />
  )
}

/** HDS "Payment method" select (ACH default, Hinstantt rails). */
export function PaymentMethodSelect({ initial = 'ACH' }: { initial?: string }) {
  const [method, setMethod] = useState(initial)
  return <KitSelect label="Payment method" options={PAYMENT_METHOD_OPTIONS} value={method} onChange={setMethod} />
}


export function Alert({
  tone,
  title,
  description,
}: {
  tone: 'error' | 'success' | 'info'
  title: string
  description?: string
}) {
  const toneClasses: Record<typeof tone, string> = {
    error: 'bg-status-rejected-bg text-status-rejected-text',
    success: 'bg-status-approved-bg text-status-approved-text',
    info: 'bg-status-info-bg text-status-info-text',
  }
  return (
    <div className={`flex w-full flex-col gap-0.5 rounded-lg px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="text-xs opacity-90">{description}</p>}
    </div>
  )
}

/**
 * Shared "New bill" manual-entry card stack used by the three OCR upload
 * screens (extraction failed / vendor match confirmed / percentage discount
 * & tax). Figma shows these as an editable form (Vendor, Bill details, Bill
 * breakdown, Totals) preceded by an OCR status Alert — modelled here as
 * filled field boxes rather than live <input>s, consistent with how the
 * rest of this prototype (e.g. RequestDetail.tsx) displays data.
 */
export function NewBillFormCard({
  vendor = 'Northwind Design Ltd',
  reference = 'NW-2481',
  billDate = '14 September 2026',
  dueDate = '14 October 2026',
  description = 'Office printing and supplies',
  items = [
    { name: 'Brand identity refresh — phase 2', qty: '1', unitPrice: '£7,600.00', amount: '£7,600.00' },
    { name: 'Design system documentation', qty: '1', unitPrice: '£1,600.00', amount: '£1,600.00' },
  ],
  subtotal = '£9,200.00',
  discountLabel = 'Discount',
  discount = '£0.00',
  tax = '£0.00',
  total = '£9,200.00',
  onValidityChange,
}: {
  vendor?: string
  reference?: string
  billDate?: string
  dueDate?: string
  description?: string
  items?: { name: string; qty: string; unitPrice: string; amount: string }[]
  subtotal?: string
  discountLabel?: string
  discount?: string
  tax?: string
  total?: string
  onValidityChange?: (valid: boolean) => void
}) {
  const [fields, setFields] = useState({ vendor, reference, billDate, dueDate, description })
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (v: string) => setFields((f) => ({ ...f, [key]: v })),
  })
  const [rows, setRows] = useState(items)
  const updateRow = (i: number, key: 'name' | 'qty' | 'unitPrice', v: string) =>
    setRows((list) => list.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)))
  const toNum = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0
  const isValid =
    Object.values(fields).every((v) => v.trim() !== '') &&
    rows.every((r) => r.name.trim() !== '' && toNum(r.qty) > 0 && toNum(r.unitPrice) > 0)
  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])
  // Inline table cells: transparent at rest, HDS input row on hover/focus (bg #f5f6f8, 1px brand focus).
  const rowInputCls =
    '-mx-1.5 min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 outline-none transition-colors placeholder:text-[#9aa1ac] hover:bg-[#f5f6f8] focus:border-[#004b87] focus:bg-[#f5f6f8]'

  return (
    <>
      <Card title="Vendor">
        <div className="flex flex-col gap-3">
          <FieldDisplay label="Payee (Merchant/vendor)" placeholder="Add vendor name" {...field('vendor')} />
          <div className="flex gap-3">
            <FieldDisplay label="Category" value="Software" options={VENDOR_CATEGORY_OPTIONS} />
            <FieldDisplay label="Vendor type" value="Business" options={VENDOR_TYPE_OPTIONS} />
          </div>
        </div>
      </Card>
      <Card title="Bill details">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <FieldDisplay label="Reference (invoice number)" placeholder="Add reference" {...field('reference')} />
            <FieldDisplay label="Currency" value="GBP" options={CURRENCY_CODE_OPTIONS} searchPlaceholder="Search currency" />
          </div>
          <div className="flex gap-3">
            <HdsDatePicker layout="inset" label="Bill date" icon={<CalendarGlyph />} {...field('billDate')} />
            <HdsDatePicker layout="inset" label="Due date" icon={<CalendarGlyph />} {...field('dueDate')} min={fields.billDate} />
          </div>
          <FieldDisplay label="Description" placeholder="Add a description" {...field('description')} />
        </div>
      </Card>
      <Card title="Bill breakdown">
        <div className="flex flex-col">
          <div className="flex gap-2 border-b border-[#e5e7eb] pb-2 text-xs font-medium text-text-quaternary">
            <p className="flex-[2]">Item</p>
            <p className="flex-1 text-right">Qty</p>
            <p className="flex-1 text-right">Unit price</p>
            <p className="flex-1 text-right">Amount</p>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 border-b border-[#f3f4f6] py-3 text-sm">
              <input
                className={`flex-[2] text-text-primary ${rowInputCls}`}
                placeholder="Add a line item"
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
              />
              <input
                className={`flex-1 text-right text-text-quaternary ${rowInputCls}`}
                inputMode="numeric"
                placeholder="—"
                value={row.qty}
                onChange={(e) => updateRow(i, 'qty', e.target.value)}
              />
              <input
                className={`flex-1 text-right text-text-quaternary ${rowInputCls}`}
                inputMode="decimal"
                placeholder="£0.00"
                value={row.unitPrice}
                onChange={(e) => updateRow(i, 'unitPrice', e.target.value)}
              />
              <p className="flex-1 text-right font-medium text-text-primary">{row.amount}</p>
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-3">
            <div className="flex justify-between text-sm">
              <p className="text-text-quaternary">Subtotal</p>
              <p className="font-medium text-text-primary">{subtotal}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-text-quaternary">{discountLabel}</p>
              <p className="font-medium text-text-primary">{discount}</p>
            </div>
            <div className="flex justify-between border-b border-[#e5e7eb] pb-3 text-sm">
              <p className="text-text-quaternary">Tax</p>
              <p className="font-medium text-text-primary">{tax}</p>
            </div>
            <div className="flex justify-between pt-1">
              <p className="text-sm font-semibold text-text-primary">Total</p>
              <p className="text-sm font-semibold text-text-primary">{total}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

export function ApprovalWorkflowPreview() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl bg-white p-4">
      <div>
        <p className="font-heading text-lg font-medium text-text-primary">Approval workflow</p>
        <p className="text-xs text-text-quaternary">Based on your company&apos;s approval rule for this bill</p>
      </div>
      <div className="flex flex-col gap-3 border-l-2 border-[#e5e7eb] pl-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Finance manager</p>
            <p className="text-xs text-text-quaternary">Any finance manager</p>
          </div>
          <p className="shrink-0 text-xs text-text-quaternary">28 Jul 2026</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Admin</p>
            <p className="text-xs text-text-quaternary">Required for bills above £5,000</p>
          </div>
          <Badge status="pending" label="Pending" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Additions below by the "Northwind Design Ltd" single-bill chunk of this
// same Bill Review flow (10 screens: VendorInfoPaymentDetails,
// BillDetailsApprovalQueueEditable, ApprovalDetailsReadOnlyAwaitingApproval,
// RequestMoreInformationModal + the 6 NorthwindDesignLtd* screens). The
// single-bill screens (back-"Bills"-link + vendor name header, no queue
// rail) use a different chrome than the `ReviewHeader`/`ReviewQueuePanel`
// shell above, built from the full `get_design_context` response on
// NorthwindDesignLtdBillDetails (45033:222571) and Frame 1171281798 inside
// ApprovalDetailsReadOnlyAwaitingApproval (45766:403133). Named distinctly
// (`SingleBillStepper`, `FieldRow`, `SingleBillFooter`, ...) to avoid
// colliding with the `ReviewStepper`/`DefinitionRow`/`ReviewFooter` above.
// The queue-variant screens reuse `Card`, `DefinitionRow`, `ReviewHeader`,
// `ReviewQueuePanel`, `UploadPreviewBox`, `ReviewFooter` etc. as-is; they
// additionally use `TimelineRow` below for the Approval workflow / Bill
// activity / Requested information timelines, which the shell above didn't
// yet cover.
// ---------------------------------------------------------------------------

export function BillsBackLink() {
  return (
    <Link to="/bills" className="flex w-fit items-center gap-2">
      <img src={backChevron} alt="" className="h-[9px] w-[5px]" />
      <span className="text-sm font-semibold text-text-primary">Bills</span>
    </Link>
  )
}

export function VendorHeader({
  vendorName,
  status,
  statusLabel,
  createdBy,
  createdDate,
  actions,
}: {
  vendorName: string
  status: BadgeStatus
  statusLabel: string
  createdBy: string
  createdDate: string
  actions?: ReactNode
}) {
  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex flex-1 flex-col gap-3">
        <p className="font-heading text-[22px] font-semibold text-[#0c2129]">{vendorName}</p>
        <Badge status={status} label={statusLabel} />
        <p className="text-[13px] text-[#6b7280]">
          Created {createdDate} by {createdBy}
        </p>
      </div>
      {actions && <div className="flex shrink-0 items-start gap-2 pt-1">{actions}</div>}
    </div>
  )
}

export function SingleBillStepper({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: 'Vendor info' },
    { n: 2, label: 'Bill details' },
    { n: 3, label: 'Approval' },
  ]
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isActive = step.n === activeStep
        const isDone = step.n < activeStep
        return (
          <div key={step.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-semibold tracking-[0.05px] ${ isActive || isDone ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-border-disabled bg-white text-[#4b5563]' }`}
              >
                {step.n}
              </div>
              <span
                className={`whitespace-nowrap text-[13px] ${ isActive ? 'font-semibold text-text-primary' : 'font-medium text-[#4b5563]' }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="mx-3 h-px w-20 bg-[#edeff2]" />}
          </div>
        )
      })}
    </div>
  )
}

/** Like `DefinitionRow` above, but with the bottom hairline the Figma definition lists use. */
export function FieldRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between py-2 ${!last ? 'border-b border-[#eff2f4]' : ''}`}>
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className="text-right text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

const DEFAULT_WORKFLOW_ACTIONS: Omit<ActionItem, 'onSelect'>[] = [
  { label: 'Change approver', description: 'Pick a different person for a step' },
  { label: 'Add approval step', description: 'Insert another approver before payment' },
  { label: 'Reset to company rule', description: 'Use the default rule for this amount' },
]

/** Pill trigger in the "Approval workflow" card header — opens the HDS action menu. */
export function EditPillButton({
  children = 'Continue',
  items,
}: {
  children?: ReactNode
  items?: ActionItem[]
}) {
  // Prototype: the default actions just close the menu (the workflow editor isn't part of this flow).
  const menuItems = items ?? DEFAULT_WORKFLOW_ACTIONS.map((it) => ({ ...it, onSelect: () => {} }))
  return (
    <HdsActionMenu
      items={menuItems}
      width={260}
      trigger={({ open, toggle }) => (
        <HdsButton
          variant="secondary"
          size="sm"
          shape="pill"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
          trailingIcon={<Chevron open={open} className="size-3.5" />}
        >
          {children}
        </HdsButton>
      )}
    />
  )
}

/** Timeline row used by "Approval workflow" / "Bill activity" / "Requested information" cards. */
export function TimelineRow({
  done = false,
  variant = 'default',
  title,
  subtitle,
  date,
  badge,
  isLast = false,
}: {
  done?: boolean
  variant?: 'default' | 'error'
  title: string
  subtitle?: ReactNode
  date?: string
  badge?: ReactNode
  isLast?: boolean
}) {
  const dotColor =
    variant === 'error'
      ? 'border-[#b72020] bg-[#b72020]'
      : done
        ? 'border-[#12883e] bg-[#12883e]'
        : 'border-[#9aa1ac] bg-[#9aa1ac]'
  const isEmphasized = done || variant === 'error'
  const titleColor = variant === 'error' ? 'text-[#b72020]' : isEmphasized ? 'text-text-primary' : 'text-[#9aa1ac]'
  return (
    <div className="relative flex w-full gap-3 pb-5 last:pb-0">
      {!isLast && <div className="absolute left-[6px] top-[13px] h-[calc(100%-8px)] w-px bg-[#e1e4e9]" />}
      <div className="relative z-10 flex size-[13px] shrink-0 items-center justify-center bg-white">
        <div className={`size-[11px] rounded-[6px] border-[2.5px] ${dotColor}`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={`text-[13px] font-medium ${titleColor}`}>{title}</p>
        {subtitle && <p className={`text-xs ${isEmphasized ? 'text-[#6b7280]' : 'text-[#9aa1ac]'}`}>{subtitle}</p>}
      </div>
      {date && <p className="shrink-0 text-[10px] font-medium tracking-[0.05px] text-text-quaternary">{date}</p>}
      {badge}
    </div>
  )
}

export function BillSummaryCard({
  subtotal,
  discount,
  tax,
  total,
}: {
  subtotal: string
  discount: string
  tax: string
  total: string
}) {
  return (
    <div className="flex w-[272px] shrink-0 flex-col gap-2 rounded-2xl bg-white p-4">
      <p className="text-[13px] font-semibold text-text-primary">Bill summary</p>
      <div className="overflow-hidden rounded-lg border-[0.5px] border-[#f3f4f6]">
        <div className="flex flex-col gap-2 px-3.5 py-3">
          <div className="flex items-start justify-between text-[11px]">
            <p className="text-text-quaternary">Subtotal</p>
            <p className="font-semibold text-text-primary">{subtotal}</p>
          </div>
          <div className="flex items-start justify-between text-[11px]">
            <p className="text-text-quaternary">Discount</p>
            <p className="font-semibold text-text-primary">{discount}</p>
          </div>
          <div className="flex items-start justify-between text-[11px]">
            <p className="text-text-quaternary">Tax</p>
            <p className="font-semibold text-text-primary">{tax}</p>
          </div>
        </div>
        <div className="flex items-start justify-between bg-[#f0f9ff] px-3.5 py-3 text-sm">
          <p className="text-text-quaternary">Total</p>
          <p className="font-medium text-text-primary">{total}</p>
        </div>
      </div>
    </div>
  )
}

/** Bottom action bar for the single-bill (Northwind*) screens — `ReviewFooter` above takes free-form children instead. */
export function SingleBillFooter({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  showNext = true,
  align = 'center',
}: {
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
  showNext?: boolean
  align?: 'center' | 'left'
}) {
  return (
    <div
      className={`flex w-full items-center gap-4 border-t border-border-disabled bg-white px-[109px] py-3.5 ${ align === 'center' ? 'justify-center' : '' }`}
    >
      <HdsButton variant="secondary" onClick={onPrevious}>
        {previousLabel}
      </HdsButton>
      {showNext && (
        <HdsButton variant="primary" onClick={onNext}>
          {nextLabel}
        </HdsButton>
      )}
    </div>
  )
}

/** Body of the "Vendor summary" card (name + status, type · category, contact, payment details) —
 * Figma 45033:208614. `VendorSummaryCard` wraps it with the title and action button. */
export function VendorSummaryCardBody({
  name = 'Acme Print Co',
  meta = 'Individual · Software',
  status,
  email = 'joleen.freeman@example.com',
  phone = '+1(555) 040-3283',
  bank = 'Chase Bank ... 4471 (ACH)',
  location = 'Austin, TX 78704, United States',
}: {
  name?: string
  meta?: string
  status?: { label: string; status: BadgeStatus }
  email?: string
  phone?: string
  bank?: string
  location?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-lg font-medium text-text-primary">{name}</p>
          {status && <Badge status={status.status} label={status.label} />}
        </div>
        <p className="text-sm text-text-quaternary">{meta}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-text-primary">Contact</p>
        <div className="flex items-center gap-2 text-xs text-text-quaternary">
          <img src={mailIcon} alt="" className="h-[9px] w-[11px]" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-quaternary">
          <img src={phoneIcon} alt="" className="h-[11px] w-[11px]" />
          <span>{phone}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-text-primary">Payment details</p>
        <div className="flex items-center gap-2 text-xs text-text-quaternary">
          <img src={bankIcon} alt="" className="h-[16px] w-[16px]" />
          <span className="truncate">{bank}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-quaternary">
          <img src={locationIcon} alt="" className="h-[11px] w-[10px]" />
          <span className="truncate">{location}</span>
        </div>
      </div>
    </div>
  )
}

/** Compact vendor profile card shown in the right rail of the queue's Vendor
 * info / new-vendor-details steps (Figma "Vendor summary" — 45033:209911 /
 * 45033:208614). */
export function VendorSummaryCard({
  status = { label: 'New vendor', status: 'info' as BadgeStatus },
  actionLabel = 'Edit vendor profile',
  ...rest
}: Parameters<typeof VendorSummaryCardBody>[0] & { actionLabel?: string }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-4">
      <p className="text-sm font-semibold text-text-primary">Vendor summary</p>
      <VendorSummaryCardBody status={status} {...rest} />
      <Button variant="secondary" size="sm" className="w-full">
        {actionLabel}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Invoice upload (OCR) — New bill seeds                              */
/* ------------------------------------------------------------------ */

/** What the scan read off NW-2481.pdf (shared with the percentage discount & tax variant). */
export const OCR_EXTRACTED: Partial<BillDraft> = {
  vendor: 'Northwind Design Ltd',
  paymentDetails: 'Chase Bank •••• 7890',
  category: 'Professional services',
  currency: 'GBP',
  reference: 'NW-2481',
  billDate: '14/09/2026',
  dueDate: '14/10/2026',
  description: 'Brand identity refresh (phase 2) and design system documentation',
  items: [
    { name: 'Brand identity refresh — phase 2', qty: '1', price: '7,600.00', amount: '7,600.00' },
    { name: 'Design system documentation', qty: '1', price: '1,600.00', amount: '1,600.00' },
  ],
  attachment: 'NW-2481.pdf',
}

export function VendorMatchedNotice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Alert tone="success" title={title} description={description} />
      <div className="flex items-center justify-between gap-3 rounded-lg border border-brand/30 bg-[#eaf2f9] px-3.5 py-2.5">
        <div>
          <p className="text-sm font-semibold text-text-primary">Northwind Design Ltd</p>
          <p className="text-xs text-text-quaternary">Existing vendor · Design services</p>
        </div>
        <HdsBadge color="green">Match confirmed</HdsBadge>
      </div>
    </div>
  )
}
