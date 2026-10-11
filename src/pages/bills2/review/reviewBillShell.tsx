import type { ReactNode } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { HdsBadge } from '../../../components/ui/hds'
import headerCloseIcon from '../../../assets/icons/review3-header-close.svg'
import countryUsIcon from '../../../assets/icons/review3-country-us.svg'
import invoiceThumbnail from '../../../assets/img/review3-invoice-thumbnail.png'

/** Top "Review bill" title bar shared by every Bill review screen. Pass action buttons via `actions`. */
export function ReviewBillHeader({
  subtitle = 'Look over the details and take action',
  actions,
}: {
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#e5e7eb] py-4">
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Close"
          className="flex size-6 items-center justify-center rounded-md bg-surface-3"
        >
          <img src={headerCloseIcon} alt="" className="size-6" />
        </button>
        <div>
          <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-text-primary">Review bill</p>
          <p className="text-base text-[#70707d]">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

type StepKey = 'vendor-info' | 'bill-details' | 'approval'
const STEPS: { key: StepKey; label: string; n: number }[] = [
  { key: 'vendor-info', label: 'Vendor info', n: 1 },
  { key: 'bill-details', label: 'Bill details', n: 2 },
  { key: 'approval', label: 'Approval', n: 3 },
]

/** 3-step "Vendor info / Bill details / Approval" progress indicator. */
export function ReviewBillStepper({ active = 'bill-details' as StepKey }: { active?: StepKey }) {
  const activeIndex = STEPS.findIndex((s) => s.key === active)
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-5 items-center justify-center rounded-lg text-[10px] font-semibold tracking-[0.05px] ${ i <= activeIndex ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-border-disabled text-text-quaternary' }`}
            >
              {step.n}
            </div>
            <p className={`text-sm ${i === activeIndex ? 'font-semibold text-text-primary' : 'font-medium text-text-quaternary'}`}>
              {step.label}
            </p>
          </div>
          {i < STEPS.length - 1 && <div className="mx-3 h-px w-[88px] bg-[#edeff2]" />}
        </div>
      ))}
    </div>
  )
}

type QueueItem = {
  vendor: string
  amount: string
  badges: { label: string; status: 'pending' | 'payment-failed' | 'neutral' | 'cancelled' | 'approved' | 'info-needed' }[]
  active?: boolean
}

const DEFAULT_QUEUE: QueueItem[] = [
  { vendor: 'Acme Print Co', amount: '$10,488.00', badges: [{ label: 'Pending approval', status: 'pending' }] },
  { vendor: 'Northwind Design Ltd', amount: '$9,200.00', badges: [{ label: 'Payment failed', status: 'payment-failed' }] },
  { vendor: 'Meridian Legal Partners', amount: '$4,800.00', badges: [{ label: 'Overdue', status: 'pending' }] },
  { vendor: 'Northstar Labs', amount: '$4,800.00', badges: [{ label: 'Payment pending', status: 'neutral' }] },
  {
    vendor: 'Frank Bishop',
    amount: '$4,800.00',
    badges: [
      { label: 'Overdue', status: 'pending' },
      { label: 'Monthly · cycle 7', status: 'info-needed' },
    ],
    active: true,
  },
  { vendor: 'Deliveroo', amount: '$4,800.00', badges: [{ label: 'Cancelled', status: 'cancelled' }] },
  { vendor: 'Amazon web services', amount: '$800.00', badges: [{ label: 'Paid', status: 'approved' }] },
]

/** Left "Review queue" list of bills. `queue` lets a screen override which row reads as active. */
export function ReviewQueueSidebar({ queue = DEFAULT_QUEUE }: { queue?: QueueItem[] }) {
  return (
    <div className="w-[272px] shrink-0 rounded-2xl bg-white p-4">
      <div className="flex items-center gap-1 border-b border-[#e5e7eb] pb-4">
        <p className="font-heading text-xl font-medium tracking-[-0.2px] text-text-primary">Review queue</p>
        <HdsBadge color="grey" size="sm">
          {queue.length}
        </HdsBadge>
      </div>
      <p className="mt-4 text-sm text-[#6b7280]">
        Total of <span className="text-sm font-medium text-text-primary">$28,450.00</span>
      </p>
      <div className="mt-2 flex flex-col">
        {queue.map((item) => (
          <div key={item.vendor} className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 ${item.active ? 'bg-surface-2' : ''}`}>
            <p className="text-sm text-[#384250]">{item.vendor}</p>
            <p className="text-sm text-[#4b5563]">{item.amount}</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
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

/** Right "Invoice uploaded" panel with the invoice thumbnail. */
export function InvoiceUploadPanel() {
  return (
    <div className="w-[272px] shrink-0 rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-primary">Invoice uploaded</p>
          <p className="text-[10px] text-[#4b5563]">NW-2481.pdf</p>
        </div>
        <button type="button" aria-label="Download invoice" className="flex size-7 items-center justify-center rounded-full bg-surface-3">
          <svg viewBox="0 0 12 12" className="size-3" fill="none">
            <path d="M6 1v7m0 0L3 5.5M6 8l3-2.5M2 10h8" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="mt-2 overflow-hidden rounded-md border-[0.5px] border-[#f3f4f6]">
        <img src={invoiceThumbnail} alt="Invoice preview" className="h-[253px] w-full object-cover" />
      </div>
    </div>
  )
}

/** Vendor info / Payment details / Contact details cards — the dimmed background for the payment-confirmation screens. */
export function VendorPaymentContactCards() {
  const card = 'w-full rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]'
  const term = 'text-[13px] text-[#4d5761]'
  const desc = 'text-[13px] font-medium text-text-primary'
  return (
    <div className="flex w-full flex-col gap-4">
      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Vendor info</p>
        <div className="flex flex-col">
          {[
            ['Vendor type', 'Individual'],
            ['First name', 'Joleen'],
            ['Last name', 'Freeman'],
            ['Category', 'Software'],
          ].map(([k, v], i, arr) => (
            <div key={k} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-[#eff2f4]' : ''}`}>
              <p className={term}>{k}</p>
              <p className={desc}>{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Payment details</p>
        <div className="flex flex-col">
          {[
            ['Country', 'United States of America'],
            ['Payment method', 'ACH'],
            ['Account name', 'Northwind Design Ltd'],
            ['Bank name', 'Chase bank'],
            ['Routing number', '021000021'],
            ['Account number', '1234567890'],
            ['Account type', 'Checking'],
            ['Address line 1', 'No, 131 Wall Street, NY'],
            ['State', 'New York'],
            ['City', 'New York City'],
            ['Postal code', '10001'],
            ['Tax identification number', 'GB123456789'],
          ].map(([k, v], i, arr) => (
            <div key={k} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-[#eff2f4]' : ''}`}>
              <p className="text-sm text-[#4d5761]">{k}</p>
              <p className="text-right text-[13px] font-medium text-text-primary">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Contact details</p>
        <div className="flex flex-col">
          {[
            ['Email', 'account@northwind.com'],
            ['Phone', '+1(555) 040-3283'],
            ['Address', '15 Maplewood Drive, Austin, TX 78704'],
          ].map(([k, v], i, arr) => (
            <div key={k} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-[#eff2f4]' : ''}`}>
              <p className={term}>{k}</p>
              <p className={desc}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CYCLE_ROWS = [
  { cycle: 'Cycle 1', due: '1/9/2026', paid: '1/9/2026', status: 'Paid' as const },
  { cycle: 'Cycle 2', due: '2/10/2026', paid: '2/10/2026', status: 'Paid' as const },
  { cycle: 'Cycle 3', due: '2/10/2026', paid: '2/10/2026', status: 'Paid' as const },
  { cycle: 'Cycle 4', due: '2/10/2026', paid: '2/10/2026', status: 'Paid' as const },
  { cycle: 'Cycle 5', due: '2/10/2026', paid: '2/10/2026', status: 'Overdue' as const },
  { cycle: 'Cycle 6', due: '2/10/2026', paid: '--', status: 'Upcoming' as const },
  { cycle: 'Cycle 7', due: '2/10/2026', paid: '--', status: 'Upcoming' as const },
]

function cycleBadgeStatus(status: 'Paid' | 'Overdue' | 'Upcoming') {
  if (status === 'Paid') return 'approved' as const
  if (status === 'Overdue') return 'pending' as const
  return 'info-needed' as const
}

/** Bill details / Bill breakdown / [Bill cycle] / Total cards — used by the Bill details & lifecycle screens. */
export function BillDetailsCards({ recurring = true }: { recurring?: boolean }) {
  const card = 'w-full rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]'
  const thCell = 'px-3.5 py-2.5 text-[11px] font-medium text-[#9aa1ac]'
  const tdCell = 'border-b border-[#eff2f4] px-3.5 py-3 text-[13px] text-text-primary'

  const detailRows = [
    ['Reference (invoice number)', 'NW-2481'],
    ['Currency', 'GBP - Great British Pound'],
    ['Bill date', '14 September 2026'],
    ...(recurring
      ? ([
          ['Bill type', 'Recurring'],
          ['Bill frequency', 'Monthly'],
          ['Start date', '14 September 2026'],
          ['End date', '14 October 2026'],
        ] as [string, string][])
      : []),
    ['Due date', '14 October 2026'],
    ['Discount (optional)', '£1.50'],
    ['Tax (optional)', '£1.0'],
    ['Description', 'Office printing and supplies'],
  ]

  return (
    <div className="flex w-full flex-col gap-4">
      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Bill details</p>
        <div className="flex flex-col">
          {detailRows.map(([k, v], i) => (
            <div key={k} className={`flex items-center justify-between py-2 ${i < detailRows.length - 1 ? 'border-b border-[#eff2f4]' : ''}`}>
              <p className="text-[13px] text-[#4d5761]">{k}</p>
              <p className="text-right text-[13px] font-medium text-text-primary">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Bill breakdown</p>
        <div className="overflow-hidden rounded-lg">
          <div className="flex items-center bg-[#f8fafc]">
            <div className={`${thCell} w-[135px]`}>Item</div>
            <div className={`${thCell} w-[63px] text-right`}>Qty</div>
            <div className={`${thCell} w-[112px] text-right`}>Unit price</div>
            <div className={`${thCell} w-[112px] text-right`}>Amount</div>
          </div>
          {[
            { item: 'Brand identity refresh — phase 2', qty: 1, unit: '£7,600.00', amount: '£7,600.00' },
            { item: 'Design system documentation', qty: 1, unit: '£1,600.00', amount: '£1,600.00' },
          ].map((row, i, arr) => (
            <div key={row.item} className="flex items-center">
              <div className={`${tdCell} w-[135px] ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.item}</div>
              <div className={`${tdCell} w-[63px] text-right ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.qty}</div>
              <div className={`${tdCell} w-[112px] text-right ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.unit}</div>
              <div className={`${tdCell} w-[112px] text-right font-medium ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {recurring && (
        <div className={card}>
          <p className="pb-2 text-base font-semibold text-text-primary">Bill cycle</p>
          <div className="overflow-hidden rounded-lg">
            <div className="flex items-center bg-[#f8fafc]">
              <div className={`${thCell} w-[84px]`}>Cycle</div>
              <div className={`${thCell} w-[112px] text-right`}>Due date</div>
              <div className={`${thCell} w-[112px] text-right`}>Date paid</div>
              <div className={`${thCell} w-[112px] text-right`}>Status</div>
            </div>
            {CYCLE_ROWS.map((row, i, arr) => (
              <div key={row.cycle} className="flex items-center">
                <div className={`${tdCell} w-[84px] ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.cycle}</div>
                <div className={`${tdCell} w-[112px] text-right ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.due}</div>
                <div className={`${tdCell} w-[112px] text-right ${i === arr.length - 1 ? 'border-b-0' : ''}`}>{row.paid}</div>
                <div className={`flex w-[112px] items-center justify-center border-b border-[#eff2f4] py-3 ${i === arr.length - 1 ? 'border-b-0' : ''}`}>
                  <Badge status={cycleBadgeStatus(row.status)} label={row.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={card}>
        <p className="pb-2 text-base font-semibold text-text-primary">Total</p>
        <div className="overflow-hidden rounded-lg border-[0.5px] border-[#f3f4f6]">
          <div className="flex flex-col gap-2 px-3.5 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-text-quaternary">Subtotal</p>
              <p className="text-[13px] font-semibold text-text-primary">£9,200.00</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-text-quaternary">Discount</p>
              <p className="text-[13px] font-semibold text-[#b72020]">-£200.00</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-text-quaternary">Tax(5%)</p>
              <p className="text-[13px] font-semibold text-text-primary">+£460.00</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-[#f0f9ff] px-3.5 py-3">
            <p className="text-sm text-text-quaternary">Amount payable to vendor</p>
            <p className="text-sm font-medium text-text-primary">9,460.00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Full 3-column content body: review queue + middle content + invoice panel. */
export function ReviewBillBody({ middle }: { middle: ReactNode }) {
  return (
    <div className="flex items-start gap-5 py-6">
      <ReviewQueueSidebar />
      <div className="mx-auto flex max-w-[507px] flex-1 flex-col items-center gap-5">{middle}</div>
      <InvoiceUploadPanel />
    </div>
  )
}

/** Sticky footer bar with Previous/Next step navigation. */
export function ReviewBillFooter() {
  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-border-disabled bg-white py-3.5">
      <Button variant="secondary">Previous</Button>
      <Button variant="primary">Next</Button>
    </div>
  )
}

/** Backdrop used behind the right-anchored Confirm-payment / Pay-remaining-balance drawers. */
export function ModalBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 bg-[#0c2129]/10">
      <div className="pointer-events-auto flex h-full items-stretch justify-end p-10 [&>*]:overflow-y-auto">{children}</div>
    </div>
  )
}

/** Backdrop used behind the centered Pause/Cancel confirmation modals. */
export function CenteredModalBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 bg-[#0c2129]/20">
      <div className="pointer-events-auto flex h-full items-center justify-center px-6 py-8">{children}</div>
    </div>
  )
}

export { countryUsIcon }
