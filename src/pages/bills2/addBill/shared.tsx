import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsRadio, HdsSwitch, HdsTextarea, inputRowClass, type SelectOption } from '../../../components/ui/hds'
import { DASHBOARD_BILLS } from '../list/shared'
import {
  billTotals,
  clearBillDraft,
  commitBill,
  fmtMoney,
  formatDate,
  getBillDraft,
  scheduleSummary,
  setBillDraft,
  toNum,
  useBillDraft,
  type BillDraft,
  type LineItem,
  type RecurringFrequency,
} from './billDraft'
import {
  CURRENCY_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  KitAmountInput,
  KitCombobox,
  KitDateInput,
  KitSelect,
  VENDORS,
  VENDOR_OPTIONS,
  currencyCode,
  currencySymbol as symbolFor,
  toOptions,
  vendorPaymentOptions,
} from '../hdsKit'

import breadcrumbBack from '../../../assets/icons/addbill-breadcrumb-back.svg'
import calendarSharp from '../../../assets/icons/addbill-calendar-sharp.svg'
import calendarRounded from '../../../assets/icons/addbill-calendar-rounded.svg'
import rowDelete from '../../../assets/icons/addbill-row-delete.svg'
import addItemIcon from '../../../assets/icons/addbill-add-item.svg'
import uploadIcon from '../../../assets/icons/addbill-upload-icon.svg'
import alertWarningIcon from '../../../assets/icons/addbill-alert-warning.svg'
import downloadTemplateIcon from '../../../assets/icons/addbill-download-template.svg'
import filetypeDocument from '../../../assets/icons/addbill-filetype-document.svg'
import approvalLine from '../../../assets/icons/addbill-approval-line.svg'
import backArrowSmall from '../../../assets/icons/addbill-back-arrow-small.svg'
import invoicePreview from '../../../assets/img/review1-receipt-preview.png'

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

export const ADD_BILL_ROUTES = {
  empty: '/bills/add/manual-entry-empty',
  duplicate: '/bills/add/possible-duplicate-bill-warning',
  missingVendor: '/bills/add/validation-error-missing-vendor',
  vendorSearch: '/bills/add/manual-entry-vendor-search',
  vendorSelected: '/bills/add/manual-entry-vendor-selected',
  filledOneTime: '/bills/add/manual-entry-filled-one-time',
  recurringSchedule: '/bills/add/manual-entry-recurring-schedule',
  frequencyOpen: '/bills/add/manual-entry-recurring-frequency-dropdown-open',
  recurringMonthly: '/bills/add/manual-entry-recurring-monthly',
  weeklyDayOpen: '/bills/add/manual-entry-recurring-weekly-day-dropdown-open',
  quarterlyCycles: '/bills/add/manual-entry-recurring-quarterly-number-of-cycles',
  recurringAnnually: '/bills/add/manual-entry-recurring-annually',
  readySubmitOneTime: '/bills/add/manual-entry-ready-to-submit-panel-one-time',
  readySubmitRecurringMonthly: '/bills/add/manual-entry-ready-to-submit-panel-recurring-monthly',
  billsList: '/bills',
  draftToast: '/bills/list/bill-saved-as-draft-success-toast',
  submittedToast: '/bills/list/bill-submitted-success-toast',
  failedToast: '/bills/list/bill-submission-failed-error-toast',
  addVendor: '/vendors/add-filled',
  ocrFailed: '/bills/review/ocr-extraction-failed',
  /** Standalone OCR design-state screen (the in-form upload no longer navigates here). */
  ocrMatched: '/bills/review/ocr-upload-vendor-match-confirmed',
  ocrPercent: '/bills/review/ocr-upload-percentage-discount-tax',
  existingBill: '/bills/review/northwind-design-ltd-vendor-info',
} as const

/* ------------------------------------------------------------------ */
/*  Option sets                                                        */
/* ------------------------------------------------------------------ */

// Figma 45033:203440 (frequency menu) and 45033:203900 (weekly day menu) — options exactly as designed.
export const FREQUENCY_OPTIONS = toOptions(['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'])
export const WEEKDAY_OPTIONS = toOptions(['Mondays', 'Tuesdays', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])

/** Discount / tax entry mode — not designed; HDS prefix menu: fixed amount in bill currency or a percentage. */
const unitOptions = (symbol: string): SelectOption[] => [
  { value: 'amount', label: 'Fixed amount', meta: symbol },
  { value: 'percent', label: 'Percentage', meta: '%' },
]

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

export function Toggle({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return <HdsSwitch checked={on} onChange={() => onClick?.()} />
}

function RadioCard({ title, subtitle, checked, onSelect }: { title: string; subtitle: string; checked?: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center rounded-lg border px-3 py-2 transition-colors ${ checked ? 'border-[#111927]' : 'border-[#e1e4e9] hover:border-[#cbd0d8]' }`}
    >
      <HdsRadio size="md" checked={!!checked} onChange={onSelect} label={title} description={subtitle} />
    </div>
  )
}

export function FileTypeIcon() {
  return (
    <div className="relative size-10 shrink-0">
      <div className="absolute inset-y-0 left-[10%] right-[10%]">
        <img src={filetypeDocument} alt="" className="block h-full w-full" />
      </div>
      <div className="absolute bottom-[15%] left-0 right-0 flex items-center justify-center">
        <span className="rounded-[2px] bg-[#098060] px-[3px] text-[11px] font-medium text-[#f4fff4]">CSV</span>
      </div>
    </div>
  )
}

const SharpCalendar = <img src={calendarSharp} alt="" className="h-[14px] w-[13px]" />
const RoundCalendar = <img src={calendarRounded} alt="" className="h-[14.67px] w-[14px]" />

/* ------------------------------------------------------------------ */
/*  Alert banners                                                       */
/* ------------------------------------------------------------------ */

export function DuplicateBillAlert({ onViewExisting, onContinue }: { onViewExisting?: () => void; onContinue?: () => void }) {
  return (
    <div className="flex w-full max-w-[380px] items-start gap-1 rounded-lg border-[0.5px] border-[#8a6300] bg-[#fff3d6] px-3.5 py-1">
      <img src={alertWarningIcon} alt="" className="mt-1 h-[14.6px] w-[16.1px] shrink-0" />
      <div className="flex flex-col items-start gap-1 py-1">
        <p className="text-sm font-semibold text-[#8a6300]">Possible duplicate bill</p>
        <div className="flex items-start gap-4 pt-1">
          <button type="button" onClick={onViewExisting} className="text-sm font-semibold text-[#8a6300] underline-offset-4 hover:underline">
            View existing bill
          </button>
          <button type="button" onClick={onContinue} className="text-sm font-semibold text-[#8a6300] underline-offset-4 hover:underline">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export function MissingVendorAlert() {
  return (
    <div className="flex w-fit items-center gap-3 rounded-full border-[0.5px] border-[#8a6300] bg-[#fff3d6] py-1 pl-4 pr-3.5">
      <img src={alertWarningIcon} alt="" className="h-[14.6px] w-[16.1px] shrink-0" />
      <p className="text-xs text-[#4b5563]">Complete the highlighted fields before submitting</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Bill breakdown + attachment + approval                             */
/* ------------------------------------------------------------------ */

export type { LineItem, RecurringFrequency, BillDraft }

export const SAMPLE_LINE_ITEMS: LineItem[] = [
  { name: 'Brand strategy workshop', qty: '1', price: '6,200.00', amount: '6,200.00' },
  { name: 'Design system audit', qty: '1', price: '3,000.00', amount: '3,000.00' },
]

const fmt = fmtMoney
const EMPTY_ITEM: LineItem = { name: '', qty: '', price: '', amount: '' }

export const isLineItemComplete = (item: LineItem) =>
  item.name.trim() !== '' && toNum(item.qty) > 0 && toNum(item.price) > 0

// HDS input row for the compact table cells.
const cellCls = `${inputRowClass()} h-11`
const cellInputCls = 'w-full min-w-0 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none'

export function BillBreakdown({
  items,
  onItemsChange,
  currencySymbol = '£',
  discount = 0,
  tax = 0,
}: {
  items: LineItem[]
  onItemsChange: (items: LineItem[]) => void
  currencySymbol?: string
  discount?: number
  tax?: number
}) {
  const subtotal = items.reduce((sum, it) => sum + toNum(it.qty) * toNum(it.price), 0)
  const total = Math.max(subtotal - discount + tax, 0)
  const update = (i: number, patch: Partial<LineItem>) =>
    onItemsChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  return (
    <div className="flex w-full flex-col gap-4 pt-4">
      <p className="text-base font-semibold text-text-primary">Bill breakdown</p>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center gap-3">
          <p className="w-[297px] text-[11px] text-text-quaternary">Item</p>
          <p className="w-[60px] text-right text-[11px] text-text-quaternary">Qty</p>
          <p className="w-[100px] text-right text-[11px] text-text-quaternary">Unit price</p>
          <p className="w-[100px] text-right text-[11px] text-text-quaternary">Amount</p>
          <span className="w-9 shrink-0" />
        </div>
        {items.map((item, i) => {
          const amount = toNum(item.qty) * toNum(item.price)
          return (
            <div key={i} className="flex w-full items-center gap-3">
              <div className={`${cellCls} flex-1`}>
                <input className={cellInputCls} aria-label="Item name" value={item.name} placeholder="Item name" onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div className={`${cellCls} !w-[60px] shrink-0`}>
                <input className={cellInputCls} aria-label="Quantity" inputMode="numeric" value={item.qty} placeholder="0" onChange={(e) => update(i, { qty: e.target.value.replace(/[^0-9]/g, '') })} />
              </div>
              <div className={`${cellCls} !w-[100px] shrink-0`}>
                <input className={cellInputCls} aria-label="Unit price" inputMode="decimal" value={item.price} placeholder="0.00" onChange={(e) => update(i, { price: e.target.value.replace(/[^0-9.,]/g, '') })} />
              </div>
              <div className={`${inputRowClass({ disabled: true })} h-11 !w-[100px] shrink-0`}>
                <span className={`text-sm ${amount ? 'text-[#111927]' : 'text-[#9aa1ac]'}`}>{amount ? fmt(amount) : '0.00'}</span>
              </div>
              <HdsButton
                variant="ghost"
                size="sm"
                iconOnly
                shape="pill"
                aria-label="Remove item"
                className="!bg-transparent hover:!bg-[#f5f6f8]"
                onClick={() => onItemsChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : [EMPTY_ITEM])}
              >
                <img src={rowDelete} alt="" className="h-[14.33px] w-[13.33px]" />
              </HdsButton>
            </div>
          )
        })}
        <HdsButton
          variant="secondary"
          size="sm"
          shape="pill"
          className="w-fit"
          leadingIcon={<img src={addItemIcon} alt="" className="size-3" />}
          onClick={() => onItemsChange([...items, EMPTY_ITEM])}
        >
          Add item
        </HdsButton>
      </div>
      <div className="flex w-full flex-col overflow-hidden rounded-lg border-[0.5px] border-[#f3f4f6]">
        <div className="flex flex-col gap-2 px-3.5 py-3">
          <div className="flex w-full items-start justify-between text-[11px]">
            <span className="text-text-quaternary">Subtotal</span>
            <span className="font-semibold text-text-primary">
              {currencySymbol}
              {fmt(subtotal)}
            </span>
          </div>
          <div className="flex w-full items-start justify-between text-[11px]">
            <span className="text-text-quaternary">Discount</span>
            <span className="font-semibold text-text-primary">
              {discount ? '-' : ''}
              {currencySymbol}
              {fmt(discount)}
            </span>
          </div>
          <div className="flex w-full items-start justify-between text-[11px]">
            <span className="text-text-quaternary">Tax</span>
            <span className="font-semibold text-text-primary">
              {currencySymbol}
              {fmt(tax)}
            </span>
          </div>
        </div>
        <div className="flex w-full items-start justify-between bg-[#f0f9ff] px-3.5 py-3 text-sm">
          <span className="text-text-quaternary">Total</span>
          <span className="font-semibold text-text-primary">
            {currencySymbol}
            {fmt(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Sample invoice "uploaded" when the dropzone is clicked (prototype: no real file picker). */
export const SAMPLE_INVOICE_FILE = 'NW-2481.pdf'
const ACCEPTED_UPLOAD = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

const fmtFileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

/**
 * Right-rail "attachment" panel on the New bill form (Figma 45033:201621 for the filled state).
 * Uploading an invoice happens IN PLACE: clicking the dropzone attaches the sample invoice, and
 * choosing / dropping a real file attaches that file. Only this section switches to its filled
 * "Invoice uploaded" state — the form and everything already entered stay exactly as they are.
 * Removing the file returns the empty dropzone. (The OCR outcome screens under /bills/review/ocr-*
 * remain as standalone design states.)
 * "Import bills" starts the bulk-import "queue" chain (QueueNewVendorDetailsForm ->
 * QueueVendorInfoReadOnly).
 */
export function AttachmentPanel({
  attachment,
  attachmentSize,
  onAttach,
  onRemove,
}: {
  attachment?: string
  attachmentSize?: string
  onAttach?: (filename: string, size?: string) => void
  onRemove?: () => void
}) {
  const navigate = useNavigate()
  const [dragOver, setDragOver] = useState(false)
  const attachFile = (file?: File | null) => {
    if (file) onAttach?.(file.name, fmtFileSize(file.size))
  }
  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-4 rounded-xl bg-white px-4 py-5">
      {attachment ? (
        <div className="flex flex-col gap-3" data-testid="invoice-uploaded">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm font-medium text-text-primary">Invoice uploaded</p>
              <p className="truncate text-xs text-[#4b5563]" title={attachment}>
                {attachment}
                {attachmentSize ? ` · ${attachmentSize}` : ''}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              onClick={onRemove}
              className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-[#fee4e2]"
            >
              {/* Red trash (Figma) — the shared row-delete glyph tinted via mask. */}
              <span
                aria-hidden
                className="h-[14.33px] w-[13.33px] bg-[#d92d20]"
                style={{ WebkitMask: `url("${rowDelete}") center / contain no-repeat`, mask: `url("${rowDelete}") center / contain no-repeat` }}
              />
            </button>
          </div>
          <div className="relative aspect-[246/253] w-full overflow-hidden rounded-lg border border-[#f3f4f6]">
            <img src={invoicePreview} alt="Invoice preview" className="size-full object-cover" />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            attachFile(e.dataTransfer.files?.[0])
          }}
        >
          <button
            type="button"
            onClick={() => onAttach?.(SAMPLE_INVOICE_FILE)}
            className={`flex w-full flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors hover:border-[#004b87] hover:bg-[#edeff2] ${ dragOver ? 'border-[#004b87] bg-[#edeff2]' : 'border-[#cbd0d8] bg-surface-2' }`}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
              <img src={uploadIcon} alt="" className="h-[13.34px] w-[13.34px]" />
            </div>
            <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
            <p className="text-[11px] text-[#6b7280]">PDF, JPG, PNG up to 10MB</p>
          </button>
          <input
            type="file"
            accept={ACCEPTED_UPLOAD}
            aria-label="Upload invoice"
            data-testid="invoice-file-input"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              attachFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      )}
      <div className="flex h-4 items-center gap-3">
        <div className="h-px flex-1 bg-[#cbd0d8]" />
        <p className="text-[13px] text-[#6b7280]">Or</p>
        <div className="h-px flex-1 bg-[#cbd0d8]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-text-primary">Import bills</p>
        <button
          type="button"
          onClick={() => navigate('/bills/review/queue-new-vendor-details-form')}
          className="flex items-center gap-3 rounded-xl border-[0.5px] border-[#edeff2] bg-surface-2 px-4 py-3.5 text-left transition-colors hover:border-[#e1e4e9] hover:bg-[#edeff2]"
        >
          <FileTypeIcon />
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-medium text-text-primary">Click to choose file</p>
            <p className="text-[11px] text-[#4b5563]">CSV. XLSX · Max 10 MB</p>
          </div>
        </button>
        <HdsButton variant="link" className="w-fit" leadingIcon={<img src={downloadTemplateIcon} alt="" className="h-[10.67px] w-3" />}>
          Download template
        </HdsButton>
      </div>
    </div>
  )
}

export function ApprovalWorkflowCard({ secondStepStatus = 'Pending' }: { secondStepStatus?: string }) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-4 rounded-xl bg-white px-4 py-5">
      <div className="flex flex-col gap-1 border-b border-[#f3f4f6] pb-2">
        <p className="text-base font-semibold text-text-primary">Approval workflow</p>
        <p className="text-[11px] text-[#6b7280]">Based on your company's approval rule for this bill</p>
      </div>
      <div className="relative flex flex-col gap-[18px]">
        <img src={approvalLine} alt="" className="absolute left-[6px] top-[11px] h-[calc(100%-46px)] w-px" />
        <div className="flex items-start gap-3">
          <div className="mt-[2.5px] size-[11px] shrink-0 rounded-full border-[2.5px] border-[#12883e]" />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-text-primary">Finance manager</p>
            <p className="text-[11px] text-[#4d5761]">Any finance manager</p>
          </div>
          <p className="text-[10px] font-medium text-[#9aa1ac]">28 Jul 2026</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-[2.5px] size-[11px] shrink-0 rounded-full border-[2.5px] border-[#9da4ae]" />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-[#9aa1ac]">Admin</p>
            <p className="text-[11px] text-[#9aa1ac]">Required for bills above £5,000</p>
          </div>
          <p className="text-[10px] font-medium text-[#9aa1ac]">{secondStepStatus}</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Recurring schedule section                                         */
/* ------------------------------------------------------------------ */

export interface RecurringSectionProps {
  frequency?: RecurringFrequency
  /** Start with the frequency menu open (state screen) — still closes on outside click / Esc. */
  frequencyDropdownOpen?: boolean
  /** Start with the weekly-day menu open (state screen). */
  dayDropdownOpen?: boolean
  showCycles?: boolean
  paymentModeChecked?: 0 | 1
  /** @deprecated menus now open in place; kept for call-site compatibility. */
  onFrequencyClick?: () => void
  /** When provided (frequency-open state screen) a pick navigates to that frequency's designed screen. */
  onFrequencySelect?: (freq: RecurringFrequency) => void
  /** @deprecated menus now open in place. */
  onDayClick?: () => void
  onDaySelect?: (day: string) => void
  startDate?: string
  onStartDateChange?: (v: string) => void
  endDate?: string
  onEndDateChange?: (v: string) => void
  cycles?: string
  onCyclesChange?: (v: string) => void
  onFrequencyChange?: (freq: RecurringFrequency) => void
  day?: string
  onDayChange?: (day: string) => void
  paymentMode?: 0 | 1
  onPaymentModeChange?: (m: 0 | 1) => void
}

export function RecurringSection({
  frequency,
  frequencyDropdownOpen,
  dayDropdownOpen,
  showCycles,
  paymentModeChecked = 0,
  onFrequencySelect,
  onDaySelect,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  cycles = '',
  onCyclesChange,
  onFrequencyChange,
  day,
  onDayChange,
  paymentMode,
  onPaymentModeChange,
}: RecurringSectionProps) {
  const [localDay, setLocalDay] = useState('Thursday')
  const [localMode, setLocalMode] = useState<0 | 1>(paymentModeChecked)
  const currentDay = day ?? localDay
  const mode = paymentMode ?? localMode
  const setMode = (m: 0 | 1) => {
    setLocalMode(m)
    onPaymentModeChange?.(m)
  }
  const half = 'w-full sm:w-[calc(50%-6px)]'
  return (
    <div className="flex w-full flex-col gap-4 border-t-[0.5px] border-[#e1e4e9] pt-4">
      <div className="flex flex-wrap gap-3">
        <KitSelect
          className={half}
          label="Frequency"
          placeholder="Select…"
          options={FREQUENCY_OPTIONS}
          value={frequency}
          defaultOpen={frequencyDropdownOpen}
          onChange={(v) => {
            const f = v as RecurringFrequency
            if (onFrequencySelect) onFrequencySelect(f)
            else onFrequencyChange?.(f)
          }}
        />

        {frequency === 'Weekly' ? (
          <KitSelect
            className={half}
            label="Day"
            placeholder="Select…"
            options={WEEKDAY_OPTIONS}
            value={currentDay}
            defaultOpen={dayDropdownOpen}
            menuMode="inline"
            menuHint="If a month is shorter, we'll use its last day."
            onChange={(d) => {
              setLocalDay(d)
              onDayChange?.(d)
              onDaySelect?.(d)
            }}
          />
        ) : showCycles ? (
          <div className={half}>
            <HdsInput
              label="Number of cycles"
              value={cycles}
              placeholder="e.g 12"
              inputMode="numeric"
              onChange={(e) => onCyclesChange?.(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>
        ) : (
          <KitDateInput className={half} label="Start date" value={startDate} icon={RoundCalendar} onChange={onStartDateChange} />
        )}

        {(frequency === 'Weekly' || showCycles) && (
          <KitDateInput className={half} label="Start date" value={startDate} icon={RoundCalendar} onChange={onStartDateChange} />
        )}
        <KitDateInput className={half} label="End date (Optional)" value={endDate} icon={RoundCalendar} onChange={onEndDateChange} min={startDate} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <p className="text-sm font-medium text-text-primary">Payment mode</p>
        <div className="flex w-full flex-col gap-2">
          <RadioCard
            title="Require approval each cycle"
            subtitle="Every due date raises an approval"
            checked={mode === 0}
            onSelect={() => setMode(0)}
          />
          <RadioCard
            title="Auto-pay from an account"
            subtitle="Pays automatically each cycle with nobody in the loop."
            checked={mode === 1}
            onSelect={() => setMode(1)}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Ready to submit drawer                                             */
/* ------------------------------------------------------------------ */

function DefRow({ label, value, underline, strong }: { label: string; value: string; underline?: boolean; strong?: boolean }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className={`text-right text-[13px] text-[#0c2129] ${strong ? 'font-semibold' : 'font-medium'} ${underline ? 'underline' : ''}`}>{value}</p>
    </div>
  )
}

const PAYMENT_MODE_LABEL = ['Require approval each cycle', 'Auto-pay from an account'] as const

/**
 * "Ready to submit?" review drawer. Every value comes from the bill the user entered (BillDraft) —
 * vendor, currency, dates, line items, totals, schedule, payment details and attachment.
 */
export function ReadyToSubmitDrawer({
  draft,
  onBack,
  onSubmit,
  onSaveDraft,
}: {
  draft: BillDraft
  onBack?: () => void
  onSubmit?: () => void
  onSaveDraft?: () => void
}) {
  const sym = symbolFor(draft.currency)
  const money = (n: number) => `${sym}${fmt(n)}`
  const pct = (v: string, unit: string) => (unit === 'percent' && toNum(v) ? ` (${toNum(v)}%)` : '')
  const { subtotal, discount, tax, total } = billTotals(draft)
  const vendor = VENDORS.find((v) => v.value === draft.vendor)
  const [bankName, last4] = draft.paymentDetails.split(/\s*•+\s*/)
  const currencyLabel = CURRENCY_OPTIONS.find((c) => c.value === draft.currency)?.label ?? draft.currency
  const items = draft.items.filter((it) => it.name.trim() !== '')
  // Slides in from the right over the screen it was opened from; slides back out before closing.
  const [leaving, setLeaving] = useState(false)
  const close = () => {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => onBack?.(), 220)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[60] bg-[#111927]/50 transition-opacity duration-200 ${leaving ? 'opacity-0' : 'animate-[fadeIn_200ms_ease-out]'}`}
        aria-hidden="true"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ready to submit?"
        className={`fixed bottom-10 right-10 top-10 z-[61] flex w-[465px] max-w-[calc(100vw-80px)] flex-col justify-between overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-200 ease-in ${ leaving ? 'translate-x-[calc(100%+40px)]' : 'animate-[slideInRight_320ms_cubic-bezier(.2,.8,.2,1)]' }`}
      >
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col items-start gap-2.5">
            <button type="button" onClick={close} className="flex items-center gap-1 text-xs font-medium text-[#555354] hover:text-[#111927]">
              <img src={backArrowSmall} alt="" className="size-3" />
              Back
            </button>
            <div className="flex flex-col gap-2">
              <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Ready to submit?</p>
              <p className="text-sm text-[#555354]">Make sure all information below is accurate.</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <p className="text-sm font-semibold text-text-primary">Bill details</p>
            <div className="flex w-full flex-col">
              <DefRow label="Payee (Merchant/vendor)" value={draft.vendor} />
              <DefRow label="Category" value={draft.category} />
              <DefRow label="Invoice number" value={draft.reference} />
              <DefRow label="Bill type" value={draft.recurring ? 'Recurring' : 'One-time'} />
              {draft.recurring && <DefRow label="Schedule" value={scheduleSummary(draft)} />}
              {draft.recurring && <DefRow label="Payment mode" value={PAYMENT_MODE_LABEL[draft.paymentMode]} />}
              <DefRow label="Bill date" value={formatDate(draft.billDate)} />
              <DefRow label="Due date" value={formatDate(draft.dueDate)} />
              <DefRow label="Currency" value={currencyLabel} />
              <DefRow label="Description" value={draft.description} />
              {draft.attachment && <DefRow label="Invoice" value={draft.attachment} underline />}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <p className="text-sm font-semibold text-text-primary">Bill breakdown</p>
            <div className="flex w-full flex-col">
              {items.map((it, i) => (
                <DefRow key={i} label={`${it.name} × ${toNum(it.qty)}`} value={money(toNum(it.qty) * toNum(it.price))} />
              ))}
              <DefRow label="Subtotal" value={money(subtotal)} />
              <DefRow label={`Discount${pct(draft.discount, draft.discountUnit)}`} value={`${discount ? '-' : ''}${money(discount)}`} />
              <DefRow label={`Tax${pct(draft.tax, draft.taxUnit)}`} value={money(tax)} />
              <DefRow label="Invoice total" value={money(total)} strong />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <p className="text-sm font-semibold text-text-primary">Vendor payment details</p>
            <div className="flex w-full flex-col">
              <DefRow label="Account name" value={draft.vendor} />
              <DefRow label="Bank name" value={bankName || '—'} />
              <DefRow label="Account number" value={last4 ? `•••• ${last4}` : '—'} />
              <DefRow label="Account currency" value={vendor?.currency ?? draft.currency} />
              {vendor && <DefRow label="Country" value={vendor.country} />}
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col gap-4">
          <HdsButton variant="primary" fullWidth onClick={onSubmit}>
            Submit for approval
          </HdsButton>
          <HdsButton variant="secondary" fullWidth onClick={onSaveDraft}>
            Save as draft
          </HdsButton>
        </div>
      </div>
    </>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/*  Main form shell                                                    */
/* ------------------------------------------------------------------ */

export interface AddBillFormProps {
  subtitle?: string
  vendorValue?: string
  vendorPlaceholder?: string
  /** Start with the vendor search menu open (vendor-search state screen). */
  vendorFocused?: boolean
  vendorError?: boolean
  paymentDetailsValue?: string
  paymentDetailsDisabled?: boolean
  filled?: boolean
  /** @deprecated derived from the selected currency */
  currencySymbol?: string
  currencyLabel?: string
  referenceValue?: string
  billDateValue?: string
  dueDateValue?: string
  descriptionValue?: string
  alert?: 'duplicate' | 'missing-vendor'
  /** Defaults to opening the existing bill. */
  onAlertViewExisting?: () => void
  /** Defaults to dismissing the duplicate warning in place (keeps everything entered). */
  onAlertContinue?: () => void
  /** When provided, picking a vendor hands off to this instead of selecting in place. */
  onVendorSelect?: (name: string) => void
  recurring?: boolean
  recurringSectionProps?: RecurringSectionProps
  submitLabel?: string
  /** Seed values (e.g. extracted from an uploaded invoice) — override the individual *Value props. */
  initialDraft?: Partial<BillDraft>
  /** Banner rendered at the top of the form card (e.g. the OCR result). */
  notice?: ReactNode
  /** Uploaded invoice filename — replaces the upload panel with the file preview. */
  attachment?: string
  /** @deprecated the vendor menu now opens in place */
  onVendorClick?: () => void
  /** @deprecated the schedule switch now toggles in place */
  onScheduleToggle?: () => void
  /** Defaults to storing the draft and opening "Ready to submit?". */
  onSubmit?: (draft: BillDraft) => void
  /** Defaults to adding the bill to the list as a Draft + "Bill saved as draft" toast. */
  onSaveDraft?: (draft: BillDraft) => void
  /** Defaults to clearing the draft and returning to Bills. */
  onDiscard?: () => void
}

const isKnownVendor = (name?: string) => !!name && VENDORS.some((v) => v.value === name && !v.disabled)

export function AddBillForm({
  subtitle = "Enter the details and add items below. You'll review and confirm on the next step.",
  vendorValue,
  vendorPlaceholder = 'Search for a vendor',
  vendorFocused,
  vendorError,
  paymentDetailsValue,
  filled = false,
  currencyLabel = 'GBP - British Pound',
  referenceValue,
  billDateValue = '14/09/2026',
  dueDateValue,
  descriptionValue,
  alert,
  onAlertViewExisting,
  onAlertContinue,
  onVendorSelect,
  recurring = false,
  recurringSectionProps,
  submitLabel = 'Submit for approval',
  initialDraft,
  notice,
  attachment: attachmentProp,
  onSubmit,
  onSaveDraft,
  onDiscard,
}: AddBillFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const formRoute = location.pathname
  // "Back" from Ready to submit (navigate(formRoute, { state: { resume: true } })) restores exactly
  // what was entered; otherwise the screen starts from its own seed values.
  const resumed = (location.state as { resume?: boolean } | null)?.resume ? getBillDraft() : null
  const seed: Partial<BillDraft> = resumed && resumed.formRoute === formRoute ? resumed : (initialDraft ?? {})

  const seedVendor = seed.vendor ?? vendorValue ?? ''
  const seedReference = seed.reference ?? referenceValue ?? ''
  const seedFrequency = seed.frequency ?? recurringSectionProps?.frequency
  const [vendor, setVendor] = useState(seedVendor)
  const [vendorPicked, setVendorPicked] = useState(isKnownVendor(seedVendor))
  const [paymentDetails, setPaymentDetails] = useState(
    seed.paymentDetails ?? paymentDetailsValue ?? (isKnownVendor(seedVendor) ? vendorPaymentOptions(seedVendor)[0].value : ''),
  )
  const [category, setCategory] = useState(seed.category ?? 'Professional services')
  const [currency, setCurrency] = useState(seed.currency ?? currencyCode(currencyLabel))
  const [reference, setReference] = useState(seedReference)
  const [billDate, setBillDate] = useState(seed.billDate ?? billDateValue)
  const [dueDate, setDueDate] = useState(seed.dueDate ?? dueDateValue ?? '')
  const [discount, setDiscount] = useState(seed.discount ?? '')
  const [discountUnit, setDiscountUnit] = useState(seed.discountUnit ?? 'amount')
  const [tax, setTax] = useState(seed.tax ?? '')
  const [taxUnit, setTaxUnit] = useState(seed.taxUnit ?? 'amount')
  const [description, setDescription] = useState(seed.description ?? descriptionValue ?? '')
  const [items, setItems] = useState<LineItem[]>(seed.items ?? (filled ? SAMPLE_LINE_ITEMS : [EMPTY_ITEM]))
  const [isRecurring, setIsRecurring] = useState(seed.recurring ?? recurring)
  const [frequency, setFrequency] = useState<RecurringFrequency | undefined>(seedFrequency)
  const showCycles = !!recurringSectionProps?.showCycles || frequency === 'Quarterly'
  const [startDate, setStartDate] = useState(
    seed.startDate ??
      (seedFrequency === 'Weekly' || recurringSectionProps?.showCycles ? '14/09/2026' : seedFrequency ? '06/01/2025' : ''),
  )
  const [endDate, setEndDate] = useState(seed.endDate ?? '')
  const [cycles, setCycles] = useState(seed.cycles ?? (recurringSectionProps?.showCycles ? '12' : ''))
  const [day, setDay] = useState(seed.day ?? 'Thursday')
  const [paymentMode, setPaymentMode] = useState<0 | 1>(seed.paymentMode ?? recurringSectionProps?.paymentModeChecked ?? 0)
  const [attachment, setAttachment] = useState(seed.attachment ?? attachmentProp)
  const [attachmentSize, setAttachmentSize] = useState<string | undefined>(undefined)

  const symbol = symbolFor(currency)
  const { discount: discountAmount, tax: taxAmount } = billTotals({ items, discount, discountUnit, tax, taxUnit })

  // Possible duplicate: same vendor + invoice number as a bill already in the list. Only raised for a
  // combination the user entered (the designed sample screens' seed is NW-2481 itself), or when the
  // screen asks for it (Possible duplicate state screen).
  const dupKey = `${vendor}|${reference.trim().toLowerCase()}`
  const existingDuplicate =
    vendorPicked && reference.trim() !== ''
      ? DASHBOARD_BILLS.find((b) => b.vendor === vendor && b.invoice.toLowerCase() === `invoice ${reference.trim().toLowerCase()}`)
      : undefined
  const [dupDismissedFor, setDupDismissedFor] = useState<string | null>(null)
  const showDuplicate =
    dupDismissedFor !== dupKey &&
    (alert === 'duplicate' || (!!existingDuplicate && dupKey !== `${seedVendor}|${seedReference.trim().toLowerCase()}`))

  const vendorErrorActive = !!vendorError && !vendorPicked
  const recurringValid =
    !isRecurring || (!!frequency && startDate.trim() !== '' && (!showCycles || Number(cycles) > 0))
  const isValid =
    vendorPicked &&
    !!paymentDetails &&
    !!category &&
    reference.trim() !== '' &&
    billDate.trim() !== '' &&
    dueDate.trim() !== '' &&
    description.trim() !== '' &&
    items.length > 0 &&
    items.every(isLineItemComplete) &&
    recurringValid

  const pickVendor = (name: string) => {
    if (onVendorSelect) {
      onVendorSelect(name)
      return
    }
    setVendor(name)
    setVendorPicked(true)
    setPaymentDetails(vendorPaymentOptions(name)[0].value)
    // Bill currency defaults to the vendor's account currency (still editable).
    const v = VENDORS.find((x) => x.value === name)
    if (v && CURRENCY_OPTIONS.some((c) => c.value === v.currency)) setCurrency(v.currency)
  }

  const buildDraft = (): BillDraft => ({
    formRoute,
    vendor,
    paymentDetails,
    category,
    currency,
    reference: reference.trim(),
    billDate: billDate.trim(),
    dueDate: dueDate.trim(),
    discount,
    discountUnit,
    tax,
    taxUnit,
    description: description.trim(),
    items: items.filter((it) => it.name.trim() || it.qty || it.price),
    recurring: isRecurring,
    frequency: isRecurring ? frequency : undefined,
    day,
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    cycles,
    paymentMode,
    attachment,
  })

  const handleSubmit = () => {
    const d = buildDraft()
    setBillDraft(d)
    if (onSubmit) onSubmit(d)
    else setReview(d) // review drawer opens over this screen
  }
  const [review, setReview] = useState<BillDraft | null>(null)
  const handleSaveDraft = () => {
    const d = buildDraft()
    if (onSaveDraft) onSaveDraft(d)
    else {
      commitBill(d, 'Draft')
      navigate(ADD_BILL_ROUTES.draftToast)
    }
  }
  const handleDiscard = () => {
    clearBillDraft()
    if (onDiscard) onDiscard()
    else navigate(ADD_BILL_ROUTES.billsList)
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 bg-surface-2 pb-[90px] pt-7">
      <button
        type="button"
        onClick={() => navigate(ADD_BILL_ROUTES.billsList)}
        className="flex items-center gap-2 rounded-full text-sm font-semibold text-text-primary"
      >
        <img src={breadcrumbBack} alt="" className="h-[9px] w-[5px]" />
        Bills
      </button>

      <div className="flex w-full items-center gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-text-primary">New bill</p>
          <p className="text-base text-[#4d5761]">{subtitle}</p>
        </div>
        {/* A draft needs at least its payee so it can be found in the list again. */}
        <HdsButton variant="secondary" disabled={!vendorPicked} onClick={handleSaveDraft}>
          Save as draft
        </HdsButton>
      </div>

      <div className="flex w-full items-start gap-4">
        <div className="flex w-[691px] shrink-0 flex-col gap-6 rounded-xl border border-[#e3e8eb] bg-white px-4 py-5">
          {notice}
          {showDuplicate && (
            <DuplicateBillAlert
              onViewExisting={onAlertViewExisting ?? (() => navigate(ADD_BILL_ROUTES.existingBill))}
              onContinue={onAlertContinue ?? (() => setDupDismissedFor(dupKey))}
            />
          )}
          {alert === 'missing-vendor' && !vendorPicked && <MissingVendorAlert />}
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-4">
              <p className="text-base font-semibold text-text-primary">Vendor</p>
              <div className="flex w-full flex-col gap-4">
                <KitCombobox
                  label="Payee (Merchant/vendor)"
                  value={vendor}
                  placeholder={vendorPlaceholder}
                  options={VENDOR_OPTIONS}
                  defaultOpen={vendorFocused}
                  error={vendorErrorActive ? 'Select a vendor to continue' : undefined}
                  onChange={(v, picked) => {
                    if (picked) pickVendor(picked.value)
                    else {
                      setVendor(v)
                      setVendorPicked(false)
                      setPaymentDetails('')
                    }
                  }}
                  onAddNew={() => navigate(ADD_BILL_ROUTES.addVendor)}
                />
                <KitSelect
                  label="Payment details"
                  value={paymentDetails}
                  placeholder="Filled from selected vendor"
                  options={vendorPaymentOptions(vendor)}
                  disabled={!vendorPicked}
                  onChange={setPaymentDetails}
                />
                <KitSelect label="Expense category" value={category} placeholder="Select…" options={EXPENSE_CATEGORY_OPTIONS} searchPlaceholder="Search categories" onChange={setCategory} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 border-y-[0.5px] border-[#e1e4e9] py-4">
              <p className="text-base font-semibold text-text-primary">Bill details</p>
              <div className="flex w-full gap-3">
                <div className="w-[320px] shrink-0">
                  <HdsInput label="Reference (invoice number)" value={reference} placeholder="e.g 12345" onChange={(e) => setReference(e.target.value)} />
                </div>
                <div className="min-w-0 flex-1">
                  <KitSelect label="Currency" value={currency} options={CURRENCY_OPTIONS} searchPlaceholder="Search currency" onChange={setCurrency} />
                </div>
              </div>
              <div className="flex w-full gap-3">
                <KitDateInput className="flex-1" label="Bill date" value={billDate} icon={SharpCalendar} onChange={setBillDate} />
                <KitDateInput className="flex-1" label="Due date" value={dueDate} icon={SharpCalendar} onChange={setDueDate} min={billDate} />
              </div>
              <div className="flex w-full gap-3">
                <KitAmountInput
                  className="flex-1"
                  label="Discount (optional)"
                  value={discount}
                  onChange={setDiscount}
                  units={unitOptions(symbol)}
                  unit={discountUnit}
                  onUnitChange={setDiscountUnit}
                />
                <KitAmountInput
                  className="flex-1"
                  label="Tax (optional)"
                  value={tax}
                  onChange={setTax}
                  units={unitOptions(symbol)}
                  unit={taxUnit}
                  onUnitChange={setTaxUnit}
                />
              </div>
              <HdsTextarea
                label="Description"
                value={description}
                maxChars={120}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description (e.g. office rent, monthly subscription)"
              />
            </div>

            <BillBreakdown items={items} onItemsChange={setItems} currencySymbol={symbol} discount={discountAmount} tax={taxAmount} />

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-text-primary">Schedule this bill</p>
                <p className="text-[11px] text-[#4b5563]">Set a recurring schedule for automatic or approved payments</p>
              </div>
              <HdsSwitch checked={isRecurring} onChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <RecurringSection
                {...recurringSectionProps}
                frequency={frequency}
                showCycles={showCycles}
                onFrequencySelect={undefined}
                onFrequencyChange={setFrequency}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                cycles={cycles}
                onCyclesChange={setCycles}
                day={day}
                onDayChange={setDay}
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
              />
            )}
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <HdsButton variant="primary" fullWidth disabled={!isValid} onClick={handleSubmit}>
              {submitLabel}
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={handleDiscard}>
              Discard
            </HdsButton>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {/* Upload happens in place: only this panel changes; the form state above is untouched. */}
          <AttachmentPanel
            attachment={attachment}
            attachmentSize={attachmentSize}
            onAttach={(name, size) => {
              setAttachment(name)
              setAttachmentSize(size)
            }}
            onRemove={() => {
              setAttachment(undefined)
              setAttachmentSize(undefined)
            }}
          />
          <ApprovalWorkflowCard />
        </div>
      </div>

      {review && (
        <ReadyToSubmitDrawer
          draft={review}
          onBack={() => setReview(null)}
          onSubmit={() => {
            commitBill(review, 'Pending approval')
            navigate(ADD_BILL_ROUTES.submittedToast)
          }}
          onSaveDraft={() => {
            commitBill(review, 'Draft')
            navigate(ADD_BILL_ROUTES.draftToast)
          }}
        />
      )}
    </div>
  )
}

export function AddBillShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="relative min-h-full w-full bg-surface-2">{children}</div>
    </AppShell>
  )
}

export { AppShell }

/* ------------------------------------------------------------------ */
/*  Ready to submit routes                                             */
/* ------------------------------------------------------------------ */

/** Design sample shown when a Ready-to-submit screen is opened directly (e.g. from /screens). */
const sampleDraft = (recurring: boolean): BillDraft => ({
  formRoute: recurring ? ADD_BILL_ROUTES.recurringMonthly : ADD_BILL_ROUTES.filledOneTime,
  vendor: 'Northwind Design Ltd',
  paymentDetails: 'Chase Bank •••• 7890',
  category: 'Professional services',
  currency: 'GBP',
  reference: 'NW-2481',
  billDate: '14/09/2026',
  dueDate: '14/10/2026',
  discount: '',
  discountUnit: 'amount',
  tax: '',
  taxUnit: 'amount',
  description: 'Hosted the last company workshop with personal funds',
  items: SAMPLE_LINE_ITEMS,
  recurring,
  frequency: recurring ? 'Monthly' : undefined,
  day: 'Thursday',
  startDate: recurring ? '06/01/2025' : '',
  endDate: '',
  cycles: '',
  paymentMode: 0,
})

/**
 * Form + "Ready to submit?" drawer. Shows the bill the user just entered (from the draft store);
 * opened directly it falls back to the design sample. Back returns to the form the bill was entered
 * on with every field restored; Submit / Save as draft add it to the Bills list with the toast.
 */
export function ReadyToSubmitScreen({ recurring }: { recurring: boolean }) {
  const navigate = useNavigate()
  const live = useBillDraft()
  const draft = live ?? sampleDraft(recurring)
  return (
    <AddBillShell>
      <div className="relative min-h-full w-full">
        <AddBillForm
          initialDraft={draft}
          subtitle={draft.recurring ? "Set up the details below and add items. You'll review and confirm on the next step." : undefined}
        />
        <ReadyToSubmitDrawer
          draft={draft}
          // Back closes the panel onto the form it was opened over (replacing this entry, so browser Back
          // doesn't bounce into the panel again), with every field restored.
          onBack={() => navigate(draft.formRoute, { replace: true, state: { resume: true } })}
          onSubmit={() => {
            commitBill(draft, 'Pending approval')
            navigate(ADD_BILL_ROUTES.submittedToast)
          }}
          onSaveDraft={() => {
            commitBill(draft, 'Draft')
            navigate(ADD_BILL_ROUTES.draftToast)
          }}
        />
      </div>
    </AddBillShell>
  )
}
