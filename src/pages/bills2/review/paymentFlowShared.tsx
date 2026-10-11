import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import { HdsBadge, HdsButton, HdsInput, HdsRadio } from '../../../components/ui/hds'
import { PayFromSelect, PaymentMethodSelect } from './shared'
import { useGoBack } from '../../../lib/navHistory'
import cancelSquarePage from '../../../assets/icons/review2-cancel-square-page.svg'
import cancelSquareDrawer from '../../../assets/icons/review2-cancel-square-drawer.svg'
import cancelVectorOuter from '../../../assets/icons/review2-cancel-vector-1.svg'
import cancelVectorInner from '../../../assets/icons/review2-cancel-vector-2.svg'
import arrowLeftBack from '../../../assets/icons/review2-arrow-left-back.svg'
import paymentSuccessIllustration from '../../../assets/img/review2-payment-success-illustration.svg'
import paymentFailedIllustration from '../../../assets/img/review2-payment-failed-illustration.svg'

/* ------------------------------------------------------------------ */
/* Review bill page background (Vendor info tab, Northwind Design Ltd) */
/* ------------------------------------------------------------------ */

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#9aa1ac]">{label}</p>
      <p className="text-right text-[13px] font-medium text-[#0c2129]">{value}</p>
    </div>
  )
}

function InfoCard({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="w-full rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]">
      <p className="pb-2 text-base font-semibold text-text-primary">{title}</p>
      <div className="flex w-full flex-col">
        {rows.map((row) => (
          <DefinitionRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  )
}

function ReviewQueuePanel() {
  const items = [
    { name: 'Acme Print Co', amount: '$10,488.00', status: 'pending' as const, label: 'Pending approval' },
    { name: 'Northwind Design Ltd', amount: '$9,200.00', status: 'payment-failed' as const, label: 'Payment failed' },
    { name: 'Meridian Legal Partners', amount: '$4,800.00', status: 'pending' as const, label: 'Pending approval' },
  ]
  return (
    <div className="hidden w-[272px] shrink-0 flex-col gap-4 rounded-2xl bg-white p-4 xl:flex">
      <div className="flex flex-col gap-2 border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-1">
          <p className="font-heading text-xl font-medium text-text-primary">Review queue</p>
          <HdsBadge color="grey" size="sm">
            4
          </HdsBadge>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-[#6b7280]">Total of</p>
          <p className="text-sm font-medium text-text-primary">$28,450.00</p>
        </div>
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <div key={item.name} className="flex flex-col gap-0.5 border-b border-[#f5f6f8] py-2 last:border-b-0">
            <p className="text-sm font-medium text-[#384250]">{item.name}</p>
            <p className="text-sm text-[#4b5563]">{item.amount}</p>
            <Badge status={item.status} label={item.label} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Stepper() {
  const steps = [
    { n: 1, label: 'Vendor info', active: true },
    { n: 2, label: 'Bill details', active: false },
    { n: 3, label: 'Approval', active: false },
  ]
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-5 items-center justify-center rounded-lg text-[10px] font-semibold ${ step.active ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#cbd0d8] bg-white text-[#4b5563]' }`}
            >
              {step.n}
            </div>
            <p className={`text-sm font-semibold ${step.active ? 'text-text-primary' : 'text-[#4b5563]'}`}>{step.label}</p>
          </div>
          {i < steps.length - 1 && <div className="mx-3 h-px w-[88px] bg-[#edeff2]" />}
        </div>
      ))}
    </div>
  )
}

const VENDOR_INFO_ROWS = [
  { label: 'Vendor type', value: 'Individual' },
  { label: 'First name', value: 'Joleen' },
  { label: 'Last name', value: 'Freeman' },
  { label: 'Category', value: 'Software' },
]

const PAYMENT_DETAILS_ROWS = [
  { label: 'Country', value: 'United States of America' },
  { label: 'Payment method', value: 'ACH' },
  { label: 'Account name', value: 'Northwind Design Ltd' },
  { label: 'Bank name', value: 'Chase bank' },
  { label: 'Routing number', value: '021000021' },
  { label: 'Account number', value: '1234567890' },
  { label: 'Account type', value: 'Checking' },
  { label: 'Address line 1', value: 'No, 131 Wall Street, NY' },
  { label: 'State', value: 'New York' },
  { label: 'City', value: 'New York City' },
  { label: 'Postal code', value: '10001' },
  { label: 'Tax identification number', value: 'GB123456789' },
]

const CONTACT_DETAILS_ROWS = [
  { label: 'Email', value: 'account@northwind.com' },
  { label: 'Phone', value: '+1(555) 040-3283' },
  { label: 'Address', value: '15 Maplewood Drive, Austin, TX 78704' },
]

/** The "Review bill" page — Vendor info tab, Northwind Design Ltd bill — used as the
 * backdrop behind every drawer/panel in this Confirm-payment / OTP / outcome flow. */
export function ReviewBillBackdrop({ ctaLabel, ctaTo }: { ctaLabel: string; ctaTo?: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex h-full w-full flex-col bg-[#f8f8f8]">
      <div className="flex items-center gap-6 border-b border-[#e5e7eb] bg-white py-4">
        <Link to="/bills/list" aria-label="Close" className="shrink-0">
          <img src={cancelSquarePage} alt="" className="size-6" />
        </Link>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Review bill</p>
            <p className="font-heading text-base text-[#70707d]">Check the details and take action</p>
          </div>
          <HdsButton variant="primary" onClick={() => ctaTo && navigate(ctaTo)}>
            {ctaLabel}
          </HdsButton>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-8">
        <div className="flex items-start gap-5">
          <div className="flex w-[507px] shrink-0 flex-col gap-4">
            <Stepper />
            <InfoCard title="Vendor info" rows={VENDOR_INFO_ROWS} />
            <InfoCard title="Payment details" rows={PAYMENT_DETAILS_ROWS} />
            <InfoCard title="Contact details" rows={CONTACT_DETAILS_ROWS} />
          </div>
          <ReviewQueuePanel />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Drawer chrome shared by Confirm payment / Pay remaining balance /   */
/* OTP / Payment outcome panels                                        */
/* ------------------------------------------------------------------ */

export function DrawerShell({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 flex justify-end bg-[rgba(10,13,18,0.35)] p-10">
      <div className="pointer-events-auto flex h-full w-full max-w-[513px] flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

export function CancelIconButton({ to }: { to: string }) {
  return (
    <Link to={to} className="relative block size-6 shrink-0" aria-label="Close">
      <img src={cancelSquareDrawer} alt="" className="absolute inset-0 size-6" />
    </Link>
  )
}

/** Small close "x" pill used on the OTP / success / failed panels (two-part asset). */
export function SmallCancelButton({ to }: { to: string }) {
  return (
    <Link to={to} className="relative block size-6 shrink-0" aria-label="Close">
      <img src={cancelVectorOuter} alt="" className="absolute inset-[1.75px] size-[20.5px] rounded-md" />
      <img src={cancelVectorInner} alt="" className="absolute inset-[8px] size-2" />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Confirm bill payment card (one-time + recurring, monthly)           */
/* ------------------------------------------------------------------ */

type BillType = 'one-time' | 'recurring-monthly'

const BASE_BILL_ROWS = [
  { label: 'Vendor', value: 'Northwind Design Ltd' },
  { label: 'Pay to', value: 'GBP account · United Kingdom · ••••4471' },
]

const ONE_TIME_ROW = { label: 'Bill Type', value: 'One time' }
const RECURRING_ROWS = [
  { label: 'Bill Type', value: 'Recurring' },
  { label: 'Schedule', value: 'Monthly' },
]

const INVOICE_ROWS = [
  { label: 'Invoice total', value: '£9,200.00' },
  { label: 'Withholding tax (5%)', value: '−£460.00' },
  { label: 'Vendor receives', value: '£8,740.00' },
  { label: 'Reference', value: 'NWD-0043' },
]

const BREAKDOWN_ROWS = [
  { label: 'You pay from', value: '' },
  { label: 'Vendor receives', value: '£8,740.00' },
  { label: 'Estimated arrival', value: 'Same day' },
  { label: 'Transfer fee', value: '£0.40' },
  { label: 'Total debit', value: '£8,740.40' },
  { label: 'Balance after', value: '£177,559.60' },
]

/** "Amount" choice — HDS radios (md) inside the Figma bordered option cards. */
export function AmountRadioGroup({
  fullAmountValue,
  value,
  onChange,
}: {
  fullAmountValue: string
  value: 'full' | 'partial' | null
  onChange: (v: 'full' | 'partial') => void
}) {
  const card = (on: boolean) =>
    `w-full items-center rounded-lg border px-3 py-2 transition-colors ${on ? 'border-[#111927]' : 'border-[#e5e7eb] hover:bg-[#f5f6f8]'}`
  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="text-sm font-medium text-[#111927]">Amount</p>
      <div className="flex w-full flex-col gap-2">
        <HdsRadio
          size="md"
          className={card(value === 'full')}
          checked={value === 'full'}
          onChange={() => onChange('full')}
          label="Pay full amount"
          description={fullAmountValue}
        />
        <HdsRadio
          size="md"
          className={card(value === 'partial')}
          checked={value === 'partial'}
          onChange={() => onChange('partial')}
          label="Pay part of this bill"
          description="The balance stays outstanding and can be paid later"
        />
      </div>
    </div>
  )
}

export function ConfirmBillPaymentCard({
  billType,
  dropdownOpen = false,
}: {
  billType: BillType
  dropdownOpen?: boolean
}) {
  const navigate = useNavigate()
  const [account, setAccount] = useState<string | null>(dropdownOpen ? 'operations' : null)
  const [amount, setAmount] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const isValid =
    !!account && (amount === 'full' || (Number(partialAmount.replace(/[^0-9.]/g, '')) || 0) > 0)

  const rows = [
    ...BASE_BILL_ROWS,
    ...(billType === 'one-time' ? [ONE_TIME_ROW] : RECURRING_ROWS),
    ...INVOICE_ROWS,
  ]
  const backHref =
    billType === 'one-time'
      ? '/bills/review/vendor-info-tab-recurring-bill-make-payment'
      : '/bills/review/vendor-info-tab-recurring-bill-make-payment'

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <p className="font-heading text-[22px] font-semibold text-[#222121]">Confirm bill payment</p>
            <p className="text-sm font-medium text-[#555354]">
              Review the transaction details before funds are sent to the vendor.
            </p>
          </div>
          <CancelIconButton to={backHref} />
        </div>

        <div className="flex flex-col">
          {rows.map((row) => (
            <DefinitionRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        {/* HDS select. The "…dropdown open" screen starts with the menu open (inline, pushing content
            down as in Figma) but it still closes on outside click / Esc. Picking an account on the
            recurring flow continues to the "source account selected" screen as before. */}
        <PayFromSelect
          value={account}
          defaultOpen={dropdownOpen}
          menuMode={dropdownOpen ? 'inline' : 'overlay'}
          onChange={(id) => {
            setAccount(id)
            if (billType === 'recurring-monthly') {
              navigate('/bills/review/confirm-bill-payment-recurring-monthly-source-account-selected')
            }
          }}
        />

        <PaymentMethodSelect />

        <div className="flex flex-col">
          {BREAKDOWN_ROWS.map((row) => (
            <DefinitionRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        <AmountRadioGroup fullAmountValue="£8,740.00" value={amount} onChange={setAmount} />
        {amount === 'partial' && (
          <HdsInput
            label="Amount to pay"
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value.replace(/[^0-9.,£]/g, ''))}
            placeholder="£0.00"
            inputMode="decimal"
            helper="Up to £8,740.00. The rest stays outstanding on this bill."
          />
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <HdsButton variant="primary" fullWidth disabled={!isValid} onClick={() => navigate('/bills/review/enter-otp-empty')}>
          Approve
        </HdsButton>
        <HdsButton variant="destructive-secondary" fullWidth onClick={() => navigate(backHref)}>
          Reject
        </HdsButton>
        <button
          type="button"
          onClick={() => navigate('/bills/review/payment-failed')}
          className="text-center text-xs text-text-quaternary underline underline-offset-2 hover:text-text-primary"
        >
          Simulate payment failure
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pay remaining balance card                                          */
/* ------------------------------------------------------------------ */

export function PayRemainingBalanceCard() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<string | null>('operations')
  const backHref = '/bills/review/vendor-info-tab-recurring-bill-make-payment'

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <p className="font-heading text-[22px] font-semibold text-[#222121]">Pay remaining balance</p>
            <p className="text-sm font-medium text-[#555354]">
              Review the outstanding amount and payment details before completing this bill
            </p>
          </div>
          <CancelIconButton to={backHref} />
        </div>

        <div className="flex flex-col">
          {[...BASE_BILL_ROWS, ...INVOICE_ROWS].map((row) => (
            <DefinitionRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        <PayFromSelect value={account} onChange={setAccount} />

        <PaymentMethodSelect />

        <div className="flex flex-col">
          {BREAKDOWN_ROWS.map((row) => (
            <DefinitionRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        <HdsInput label="Amount" value="£4,240.00" readOnly helper="Remaining balance on this bill" className="font-medium" />
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <HdsButton variant="primary" fullWidth disabled={!account} onClick={() => navigate('/bills/review/enter-otp-empty')}>
          Pay
        </HdsButton>
        <HdsButton variant="secondary" fullWidth onClick={() => navigate(backHref)}>
          Cancel
        </HdsButton>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Enter OTP panel — one component, three visual sub-states            */
/* ------------------------------------------------------------------ */

export type OtpMode = 'empty' | 'incorrect-disabled' | 'incorrect-enabled'

/** Prototype note: entering this exact code always succeeds; any other
 * complete 6-digit code plays out the incorrect-code / retry states. */
const CORRECT_CODE = '123456'
const DEMO_WRONG_CODE = ['8', '2', '4', '2', '6', '5']

export function OtpPanel({ initialMode = 'empty' }: { initialMode?: OtpMode }) {
  const navigate = useNavigate()
  // OTP is reached from several payment drawers (confirm one-time / recurring / pay part / pay remaining
  // balance), so Back returns to whichever one led here; opened directly it falls back to the one-time confirm.
  const goBack = useGoBack('/bills/review/confirm-bill-payment-one-time')
  const [digits, setDigits] = useState<string[]>(initialMode === 'empty' ? Array(6).fill('') : DEMO_WRONG_CODE)
  const [mode, setMode] = useState<OtpMode>(initialMode)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const isErrorState = mode !== 'empty'
  const confirmDisabled = mode === 'incorrect-disabled' || digits.some((d) => d === '')

  function updateDigit(index: number, raw: string) {
    const value = raw.replace(/[^0-9]/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setMode('empty')
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handleConfirm() {
    if (confirmDisabled) return
    const code = digits.join('')
    if (code === CORRECT_CODE) {
      navigate('/bills/review/payment-successful')
      return
    }
    setMode('incorrect-disabled')
    window.setTimeout(() => setMode('incorrect-enabled'), 1400)
  }

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <button type="button" onClick={goBack} className="flex w-fit items-center gap-1">
          <img src={arrowLeftBack} alt="" className="size-3" />
          <span className="text-xs font-medium text-[#555354]">Back</span>
        </button>
        <p className="font-heading text-[22px] font-semibold text-text-primary">Enter OTP</p>
        <p className="text-base text-[#555354]">
          We sent a 6-digit code to a*****@acmetrading.com. Type it below to continue.
        </p>
      </div>

      <div className="flex flex-col items-center gap-7 pb-16">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                value={digit}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                aria-invalid={isErrorState || undefined}
                className={`h-14 w-12 rounded-lg bg-[#f5f6f8] text-center text-base font-semibold text-[#111927] outline-none transition-colors ${ isErrorState ? 'border border-[#b4232e]' : 'border-[0.5px] border-[#edeff2] hover:border-[#e1e4e9] hover:bg-[#edeff2] focus:border focus:border-[#004b87] focus:bg-[#f5f6f8]' }`}
              />
            ))}
          </div>
          {isErrorState && <p className="text-xs text-[#b4232e]">Incorrect code entered</p>}
        </div>

        <HdsButton variant="primary" fullWidth disabled={confirmDisabled} onClick={handleConfirm}>
          Confirm
        </HdsButton>

        {mode === 'empty' && digits.every((d) => d === '') && (
          <p className="w-full text-center text-[11px] text-[#555354]">Resend in 0:30</p>
        )}
        <p className="w-full text-center text-[11px] text-text-quaternary">Prototype tip: enter 123456 to continue.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Payment outcome panels (success / failed)                           */
/* ------------------------------------------------------------------ */

export function PaymentOutcomePanel({ variant }: { variant: 'success' | 'failed' }) {
  const navigate = useNavigate()
  const isSuccess = variant === 'success'
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex justify-end">
        <SmallCancelButton to="/bills/list" />
      </div>
      <div className="mt-10 flex flex-1 flex-col items-center gap-6 text-center">
        {isSuccess ? (
          <img
            src={paymentSuccessIllustration}
            alt=""
            className="h-[160px] w-[193px]"
          />
        ) : (
          <img
            src={paymentFailedIllustration}
            alt=""
            className="h-[149px] w-[165px]"
          />
        )}
        <div className="flex flex-col gap-2">
          <p className="font-heading text-xl font-semibold text-[#222121]">
            {isSuccess ? 'Payment successful' : 'Payment failed'}
          </p>
          <p className="text-base text-[#555354]">
            {isSuccess ? 'Funds have been sent to the vendor.' : "We couldn't complete this transaction. Please try again."}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-6">
        {isSuccess ? (
          <HdsButton variant="primary" fullWidth onClick={() => navigate('/bills/list')}>
            Return to home
          </HdsButton>
        ) : (
          <>
            <HdsButton variant="primary" fullWidth onClick={() => navigate('/bills/review/confirm-bill-payment-one-time')}>
              Retry
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={() => navigate('/bills/list')}>
              Return to home
            </HdsButton>
          </>
        )}
      </div>
    </div>
  )
}
