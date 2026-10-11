import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DropdownMenu, HdsButton, HdsInput, HdsSelect, HdsTextarea, Chevron, inputRowClass, type SelectOption } from '../../ui/hds'
import type { RequestDetail } from '../../../data/requestDetails'
import flagUs from '../../../assets/icons/claim-manual-flag-us.svg'
import flagEu from '../../../assets/icons/claim-manual-flag-eur.svg'
import flagGb from '../../../assets/icons/accounts-dd-flag-gb.svg'
import flagNg from '../../../assets/icons/accounts-dd-flag-ng.svg'
import successIllustration from '../../../assets/img/review2-payment-success-illustration.svg'
import calendarIcon from '../../../assets/icons/claim-manual-calendar.svg'
import { CloseButton, DrawerShell, PayoutSummary, UploadDropzone } from './parts'

const Flag = ({ src }: { src: string }) => <img src={src} alt="" className="size-4 rounded-full object-cover" />

function DetailLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-3 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="shrink-0 text-[13px] text-[#4b5563]">{label}</p>
      <p className="flex-1 text-right text-[13px] font-medium text-[#111927]">{value}</p>
    </div>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-fit items-center gap-1 text-xs font-medium text-[#555354] hover:text-[#111927]">
      <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden="true">
        <path d="M7.5 3L4.5 6L7.5 9" stroke="currentColor" strokeWidth="1" />
      </svg>
      Back
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Approve & pay — Figma 42563:373718 → 374153 (Pay from open) →      */
/*  374721 (selected) → 43694:382009 (OTP) → 43694:383871 (success)    */
/* ------------------------------------------------------------------ */

// Pay-from options exactly as designed (Figma 42563:374153).
export const PAY_FROM_OPTIONS: SelectOption[] = [
  { value: 'operations', label: 'Operations account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUs} /> },
  { value: 'marketing', label: 'Marketing account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUs} /> },
  { value: 'treasury', label: 'Treasury account', description: 'Savings, ****8327 · $12,480.00', icon: <Flag src={flagUs} /> },
]

// Only "ACH" is shown in the design (42563:374721); the rest are the rails Hinstantt pays out on.
export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'ach', label: 'ACH', meta: '1–2 business days · $0.90' },
  { value: 'wire', label: 'Domestic wire', meta: 'Same day · $15.00' },
  { value: 'swift', label: 'SWIFT', meta: '2–4 business days · $25.00' },
  { value: 'local', label: 'Local bank transfer', meta: 'Instant · $0.50' },
]

const METHOD_FEES: Record<string, string> = { ach: '$0.90', wire: '$15.00', swift: '$25.00', local: '$0.50' }

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => refs.current[0]?.focus(), [])
  return (
    <div className="flex justify-center gap-2" onPaste={(e) => {
      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (digits) {
        e.preventDefault()
        onChange(digits)
        refs.current[Math.min(digits.length, 5)]?.focus()
      }
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ''}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1)
            const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6)
            onChange(next)
            if (d && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          className="h-12 w-11 rounded-lg border-[0.5px] border-[#edeff2] bg-[#f5f6f8] text-center text-lg font-semibold text-[#111927] outline-none transition-colors hover:border-[#e1e4e9] hover:bg-[#edeff2] focus:border focus:border-[#004b87] focus:bg-white"
        />
      ))}
    </div>
  )
}

export function ApprovePayDrawer({
  detail,
  mode,
  onClose,
  onReject,
  onPaid,
  onReturnHome,
}: {
  detail: RequestDetail
  /** "approve" = Make payment / Review & approve; "retry" = Retry payment (account pre-selected). */
  mode: 'approve' | 'retry'
  onClose: () => void
  onReject?: () => void
  onPaid: (account: string, method: string) => void
  onReturnHome: () => void
}) {
  const [step, setStep] = useState<'review' | 'otp' | 'success'>('review')
  const [account, setAccount] = useState<string | null>(mode === 'retry' ? 'operations' : null)
  const [method, setMethod] = useState<string | null>(mode === 'retry' ? 'ach' : null)
  const [otp, setOtp] = useState('')
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    if (step !== 'otp' || seconds <= 0) return
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [step, seconds])

  const accountLabel = PAY_FROM_OPTIONS.find((o) => o.value === account)?.label ?? ''
  const methodLabel = PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? ''
  const fee = method ? METHOD_FEES[method] : '$0.90'

  return (
    <DrawerShell onClose={onClose} label="Approve this request" width={500}>
      {step === 'review' && (
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="font-heading text-xl font-medium text-[#111927]">{mode === 'retry' ? 'Retry payment' : 'Approve this request?'}</h2>
              <p className="text-[13px] text-[#4b5563]">
                {mode === 'retry'
                  ? 'Your original source account is selected. Review the details and retry, or pick another account.'
                  : 'Review the details and select a preferred account for payment'}
              </p>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#111927]">Expense details</p>
            <div className="flex flex-col">
              <DetailLine label="Requested by" value={detail.requester.name} />
              <DetailLine label="Payee (Merchant/vendor)" value={detail.payee} />
              <DetailLine label="Description" value={detail.description} />
              <DetailLine label="Amount" value={detail.amount} />
              <DetailLine label="Destination" value={detail.destination} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#111927]">Payment details</p>
            <HdsSelect
              label="Pay from"
              placeholder="Select an account"
              options={PAY_FROM_OPTIONS}
              value={account}
              onChange={(v) => {
                setAccount(v)
                if (!method) setMethod(null)
              }}
              renderValue={(o) => (
                <span className="flex flex-col leading-tight">
                  <span className="text-sm text-[#111927]">{o.label}</span>
                  <span className="text-[11px] text-[#6b7280]">{o.description}</span>
                </span>
              )}
            />
            <HdsSelect
              label="Payment method"
              placeholder={account ? 'Select a payment method' : 'Select an account first'}
              options={PAYMENT_METHOD_OPTIONS}
              value={method}
              onChange={setMethod}
              disabled={!account}
            />
          </div>

          <div className="flex flex-col">
            <DetailLine label="Estimated payout" value={detail.estimatedPayout} />
            <DetailLine label="Exchange rate" value={detail.currency === 'NGN' || detail.estimatedPayout.startsWith('₦') ? '1 NGN = 0.0007 USD' : detail.currency === 'USD' ? '1 USD = 1.00 USD' : `1 ${detail.currency} = ${detail.currency === 'GBP' ? '1.27' : '1.09'} USD`} />
            <DetailLine label="Transfer fee" value={fee} />
            <DetailLine label="Total debit" value={detail.currency === 'USD' ? detail.amount : '$139.34'} />
            <DetailLine label="Balance after" value="$842,261" />
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <HdsButton fullWidth disabled={!account || !method} onClick={() => setStep('otp')}>
              {mode === 'retry' ? 'Retry payment' : 'Approve and pay'}
            </HdsButton>
            {mode === 'approve' && onReject ? (
              <HdsButton fullWidth variant="destructive-secondary" onClick={onReject}>
                Reject
              </HdsButton>
            ) : (
              <HdsButton fullWidth variant="secondary" onClick={onClose}>
                Cancel
              </HdsButton>
            )}
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="flex flex-col gap-6 px-6 py-6">
          <BackLink onClick={() => setStep('review')} />
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-xl font-medium text-[#111927]">Enter OTP</h2>
            <p className="text-sm text-[#4b5563]">We sent a 6-digit code to a*****@acmetrading.com. Enter it below to continue.</p>
          </div>
          <OtpBoxes value={otp} onChange={setOtp} />
          <HdsButton
            fullWidth
            disabled={otp.length < 6}
            onClick={() => {
              onPaid(accountLabel, methodLabel)
              setStep('success')
            }}
          >
            Confirm
          </HdsButton>
          <p className="text-center text-xs text-[#4b5563]">
            {seconds > 0 ? (
              <>Resend in 0:{String(seconds).padStart(2, '0')}</>
            ) : (
              <button type="button" onClick={() => setSeconds(30)} className="font-semibold text-[#004b87] hover:underline underline-offset-4">
                Resend code
              </button>
            )}
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center gap-6 px-6 py-6">
          <div className="flex w-full justify-end">
            <CloseButton onClick={onClose} />
          </div>
          <img src={successIllustration} alt="" className="mt-10 h-[120px] w-auto" />
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="font-heading text-lg font-medium text-[#111927]">Payment successful</h2>
            <p className="text-sm text-[#4b5563]">The payment has been processed successfully.</p>
          </div>
          <HdsButton fullWidth onClick={onReturnHome}>
            Return to home
          </HdsButton>
        </div>
      )}
    </DrawerShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Provide further details — Figma 41715:339544 / 45469:444548        */
/* ------------------------------------------------------------------ */

export function ProvideDetailsDrawer({
  requested,
  onClose,
  onSubmit,
}: {
  requested: string
  onClose: () => void
  onSubmit: (response: string, file: string | null) => void
}) {
  const [response, setResponse] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const valid = response.trim().length > 0 || !!file
  return (
    <DrawerShell onClose={onClose} label="Provide further details" width={500}>
      <div className="flex flex-1 flex-col gap-5 px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="font-heading text-xl font-medium text-[#111927]">Provide further details</h2>
            <p className="text-[13px] text-[#4b5563]">Add the requested details to continue approval process.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="flex flex-col gap-1.5 border-b border-[#eff2f4] pb-4">
          <p className="text-sm font-medium text-[#111927]">Requested information</p>
          <p className="rounded-lg bg-[#f5f6f8] px-3.5 py-3 text-[13px] text-[#4b5563]">{requested}</p>
        </div>
        <HdsTextarea
          label="Your response"
          placeholder="Add the requested details or explain the update you’ve made"
          value={response}
          maxChars={120}
          rows={5}
          onChange={(e) => setResponse(e.target.value)}
        />
        <div className="flex items-center gap-3 text-xs text-[#6b7280]">
          <span className="h-px flex-1 bg-[#e1e4e9]" />
          Or
          <span className="h-px flex-1 bg-[#e1e4e9]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[#111927]">Upload supporting document</p>
          <UploadDropzone file={file} onFile={setFile} />
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <HdsButton fullWidth disabled={!valid} onClick={() => onSubmit(response.trim(), file)}>
            Submit information
          </HdsButton>
          <HdsButton fullWidth variant="secondary" onClick={onClose}>
            Cancel
          </HdsButton>
        </div>
      </div>
    </DrawerShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Edit request — Figma 43381:396819 / 42563:371491                   */
/* ------------------------------------------------------------------ */

const CURRENCIES: SelectOption[] = [
  { value: 'EUR', label: 'EUR', description: 'Euro', icon: <Flag src={flagEu} /> },
  { value: 'USD', label: 'USD', description: 'US Dollar', icon: <Flag src={flagUs} /> },
  { value: 'GBP', label: 'GBP', description: 'British Pound', icon: <Flag src={flagGb} /> },
  { value: 'NGN', label: 'NGN', description: 'Nigerian Naira', icon: <Flag src={flagNg} /> },
]
const SYMBOL: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', NGN: '₦' }

export const CATEGORY_OPTIONS: SelectOption[] = [
  'Meals and entertainment',
  'Travel',
  'Software',
  'Professional services',
  'Office supplies',
  'Shipping and logistics',
  'Marketing and advertising',
  'Training and education',
  'Utilities',
  'Others',
].map((c) => ({ value: c, label: c }))

const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'US', label: 'United States of America', icon: <Flag src={flagUs} /> },
  { value: 'GB', label: 'United Kingdom', icon: <Flag src={flagGb} /> },
  { value: 'NG', label: 'Nigeria', icon: <Flag src={flagNg} /> },
  { value: 'DE', label: 'Germany', icon: <Flag src={flagEu} /> },
  { value: 'PT', label: 'Portugal', icon: <Flag src={flagEu} /> },
]
const BANK_OPTIONS: SelectOption[] = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Silicon Valley Bank', 'Barclays', 'Access Bank', 'Revolut Bank'].map((b) => ({ value: b, label: b }))
const STATE_OPTIONS: SelectOption[] = ['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Washington', 'Massachusetts', 'Georgia', 'Lagos', 'Greater London'].map((s) => ({ value: s, label: s }))
const CITY_OPTIONS: Record<string, string[]> = {
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
  California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'],
  Texas: ['Austin', 'Houston', 'Dallas'],
  Florida: ['Miami', 'Orlando', 'Tampa'],
  Illinois: ['Chicago', 'Springfield'],
  Washington: ['Seattle', 'Spokane'],
  Massachusetts: ['Boston', 'Cambridge'],
  Georgia: ['Atlanta', 'Savannah'],
  Lagos: ['Ikeja', 'Victoria Island', 'Lekki'],
  'Greater London': ['London', 'Croydon'],
}

function toInputDate(v?: string) {
  if (!v || v === '—') return ''
  const m = v.match(/(\d{1,2}) (\w{3}) (\d{4})/)
  if (!m) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mm = String(months.indexOf(m[2]) + 1).padStart(2, '0')
  return `${m[1].padStart(2, '0')}/${mm}/${m[3]}`
}

function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="flex flex-col gap-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5 text-left">
        <span className="text-base font-semibold text-[#111927]">{title}</span>
        <Chevron open={open} className="text-[#6b7280]" />
      </button>
      {open && <div className="flex flex-col gap-4">{children}</div>}
    </section>
  )
}

function AmountField({ currency, onCurrency, amount, onAmount }: { currency: string; onCurrency: (v: string) => void; amount: string; onAmount: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const cur = CURRENCIES.find((c) => c.value === currency)
  return (
    <div ref={ref} className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <label className="text-sm font-medium text-[#111927]">Amount (excluding tax)</label>
      <div className={`${inputRowClass({ focus: open })} h-11`}>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className="flex shrink-0 items-center gap-1.5 text-sm text-[#111927]">
          {cur?.icon}
          {currency}
          <Chevron open={open} className="size-3.5 text-[#6b7280]" />
        </button>
        <span className="h-5 w-px bg-[#e1e4e9]" />
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmount(e.target.value.replace(/[^\d.,]/g, ''))}
          placeholder="0.00"
          aria-label="Amount"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
        />
      </div>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[220px]">
          <DropdownMenu
            options={CURRENCIES}
            value={currency}
            onSelect={(v) => {
              onCurrency(v)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export type RequestEdits = Partial<Pick<RequestDetail, 'payee' | 'amount' | 'tax' | 'category' | 'description' | 'datePaid' | 'dueDate'>>

export function EditRequestDrawer({ detail, onClose, onBack, onSave, onDraft }: { detail: RequestDetail; onClose: () => void; /** Back: returns to the screen that opened the drawer (defaults to closing it). */ onBack?: () => void; onSave: (edits: RequestEdits) => void; onDraft: () => void }) {
  const [payee, setPayee] = useState(detail.payee)
  const [datePaid, setDatePaid] = useState(toInputDate(detail.datePaid ?? detail.invoiceDate))
  const [dueDate, setDueDate] = useState(toInputDate(detail.dueDate))
  const [currency, setCurrency] = useState(detail.currency)
  const [amount, setAmount] = useState(detail.amount.replace(/[^\d.,]/g, ''))
  const [tax, setTax] = useState(detail.tax ? detail.tax.replace(/\s*\(.*\)/, '').replace(/[^\d.,]/g, '') : '')
  const [category, setCategory] = useState<string | null>(CATEGORY_OPTIONS.some((c) => c.value === detail.category) ? detail.category : 'Others')
  const [description, setDescription] = useState(detail.description)
  const [country, setCountry] = useState<string | null>(detail.destination.includes('Nigeria') ? 'NG' : detail.destination.includes('Kingdom') ? 'GB' : 'US')
  const [payMethod, setPayMethod] = useState<string | null>('ach')
  const bankRow = (label: string) => detail.beneficiary.rows.find((r) => r.label === label)?.value ?? ''
  const [accountName, setAccountName] = useState(bankRow('Recipient name'))
  const [bank, setBank] = useState<string | null>(BANK_OPTIONS.some((b) => b.value === bankRow('Bank name')) ? bankRow('Bank name') : null)
  const [swift, setSwift] = useState(bankRow('SWIFT/BIC'))
  const [accountNumber, setAccountNumber] = useState(bankRow('Account number'))
  const [address, setAddress] = useState('No, 131 Wall Street, NY')
  const [state, setState] = useState<string | null>('New York')
  const [city, setCity] = useState<string | null>('New York City')
  const [postal, setPostal] = useState('10001')
  const [receipt, setReceipt] = useState<string | null>(detail.receipt.filename)

  const dateOk = (v: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(v)
  const errors = {
    payee: !payee.trim() ? 'Enter the payee' : undefined,
    datePaid: !dateOk(datePaid) ? 'Use DD/MM/YYYY' : undefined,
    dueDate: dueDate && !dateOk(dueDate) ? 'Use DD/MM/YYYY' : undefined,
    amount: !(Number(amount.replace(/,/g, '')) > 0) ? 'Enter an amount' : undefined,
    accountNumber: accountNumber.replace(/\D/g, '').length < 6 ? 'Enter a valid account number' : undefined,
  }
  const valid = Object.values(errors).every((e) => !e) && !!category && !!bank && !!accountName.trim() && !!country && !!payMethod
  const cityOptions = useMemo(() => (CITY_OPTIONS[state ?? ''] ?? []).map((c) => ({ value: c, label: c })), [state])

  const fromInput = (v: string) => {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!m) return v
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${Number(m[1])} ${months[Number(m[2]) - 1]} ${m[3]}`
  }
  const calendar = <img src={calendarIcon} alt="" className="h-[17.5px] w-[16.25px]" />

  return (
    <DrawerShell onClose={onClose} label="Edit request" width={513}>
      <div className="flex flex-col gap-6 px-6 py-6">
        <BackLink onClick={onBack ?? onClose} />
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Edit request</h2>
          <p className="text-sm text-[#555354]">Update the details and resubmit. Your approver will see the changes.</p>
        </div>

        <CollapsibleSection title="Expense detail">
          <HdsInput label="Payee (merchant or vendor)" value={payee} onChange={(e) => setPayee(e.target.value)} error={errors.payee} />
          <div className="flex gap-2">
            <HdsInput containerClassName="min-w-0 flex-1" label="Date paid" placeholder="DD/MM/YYYY" value={datePaid} onChange={(e) => setDatePaid(e.target.value)} trailingIcon={calendar} error={datePaid ? errors.datePaid : undefined} />
            <HdsInput containerClassName="min-w-0 flex-1" label="Due date" placeholder="DD/MM/YYYY" value={dueDate} onChange={(e) => setDueDate(e.target.value)} trailingIcon={calendar} error={errors.dueDate} />
          </div>
          <div className="flex items-start gap-2">
            <AmountField currency={currency} onCurrency={setCurrency} amount={amount} onAmount={setAmount} />
            <HdsInput containerClassName="min-w-0 flex-1" label="Tax amount (from receipt)" helper="(Optional)" prefix={SYMBOL[currency]} inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0.00" />
          </div>
          <HdsSelect label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder="Select category" />
          <HdsTextarea label="Description" value={description} maxChars={120} rows={4} placeholder="Add the requested details or explain the update you’ve made" onChange={(e) => setDescription(e.target.value)} />
        </CollapsibleSection>

        <CollapsibleSection title="Beneficiary details">
          <HdsSelect label="Country" options={COUNTRY_OPTIONS} value={country} onChange={setCountry} placeholder="Select country" />
          <HdsSelect label="Payment method" options={PAYMENT_METHOD_OPTIONS} value={payMethod} onChange={setPayMethod} placeholder="Select payment method" />
          <HdsInput label="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <div className="flex items-start gap-2">
            <HdsSelect className="min-w-0 flex-1" label="Bank name" options={BANK_OPTIONS} value={bank} onChange={setBank} placeholder="Select bank" />
            <HdsInput containerClassName="min-w-0 flex-1" label="SWIFT/BIC" value={swift} onChange={(e) => setSwift(e.target.value.toUpperCase())} />
          </div>
          <HdsInput label="Account number" inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} error={errors.accountNumber} />
          <HdsInput label="Address line 1" value={address} onChange={(e) => setAddress(e.target.value)} />
          <HdsSelect label="State" options={STATE_OPTIONS} value={state} onChange={(v) => { setState(v); setCity(null) }} placeholder="Select state" />
          <div className="flex items-start gap-2">
            <HdsSelect className="min-w-0 flex-1" label="City" options={cityOptions} value={city} onChange={setCity} placeholder="Select city" />
            <HdsInput containerClassName="min-w-0 flex-1" label="Postal code" value={postal} onChange={(e) => setPostal(e.target.value)} />
          </div>
        </CollapsibleSection>

        <section className="flex flex-col gap-2">
          <p className="border-b border-[#eff2f4] pb-2 text-base font-semibold text-[#111927]">Payout summary</p>
          <PayoutSummary rows={detail.payout} />
        </section>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[#111927]">Upload receipt</p>
          <UploadDropzone file={receipt} onFile={setReceipt} />
        </div>

        <div className="flex flex-col gap-3">
          <HdsButton
            fullWidth
            disabled={!valid}
            onClick={() =>
              onSave({
                payee: payee.trim(),
                amount: `${SYMBOL[currency]}${Number(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                tax: tax ? `${SYMBOL[currency]}${tax}` : undefined,
                category: category ?? detail.category,
                description: description.trim(),
                datePaid: fromInput(datePaid),
                dueDate: dueDate ? fromInput(dueDate) : detail.dueDate,
              })
            }
          >
            Save changes
          </HdsButton>
          <HdsButton fullWidth variant="secondary" onClick={onDraft}>
            Save as draft
          </HdsButton>
        </div>
      </div>
    </DrawerShell>
  )
}
