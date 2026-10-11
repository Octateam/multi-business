import { useRef, useState } from 'react'
import { HdsButton, HdsInput } from '../../../components/ui/hds'
import { Drawer } from '../../accounts/ui'
import { money, parseAmount, recordBillPayment, setBillStatus, type BillRecord } from '../list/billRecords'
import { AmountRadioGroup } from './paymentFlowShared'
import { PayFromSelect, PaymentMethodSelect } from './shared'
import cancelSquareIcon from '../../../assets/icons/review3-cancel-square.svg'
import arrowLeftBack from '../../../assets/icons/review2-arrow-left-back.svg'
import paymentSuccessIllustration from '../../../assets/img/review2-payment-success-illustration.svg'
import paymentFailedIllustration from '../../../assets/img/review2-payment-failed-illustration.svg'

// ---------------------------------------------------------------------------
// Approver "Make payment" flow — Figma 48121:459876, "Approver view – Make payment":
// Confirm bill payment (one-time / recurring; pay full amount or part of it) → Enter OTP → Payment
// successful / Payment failed. "Pay balance" opens the same drawer on the remaining balance (Pay remaining
// balance), and "Retry payment" on a failed bill reuses it. A full payment marks the bill Paid; a part
// payment keeps it open with the balance outstanding.
// ---------------------------------------------------------------------------

export type PaymentMode = 'pay' | 'balance' | 'retry'

const CORRECT_CODE = '123456'

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${last ? '' : 'border-b border-[#eff2f4]'}`}>
      <p className="text-[13px] text-[#9aa1ac]">{label}</p>
      <p className="text-right text-[13px] font-medium text-[#0c2129]">{value}</p>
    </div>
  )
}

function DrawerTitle({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <p className="font-heading text-[22px] font-semibold text-[#222121]">{title}</p>
        <p className="text-sm font-medium text-[#555354]">{subtitle}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Close">
        <img src={cancelSquareIcon} alt="" className="size-6" />
      </button>
    </div>
  )
}

export function BillPaymentDrawer({ bill, paid, mode, onClose }: { bill: BillRecord; paid: number; mode: PaymentMode; onClose: () => void }) {
  const total = parseAmount(bill.amount)
  const remaining = Math.max(total - paid, 0)
  const m = (n: number) => money(n, bill.symbol)
  const recurring = bill.billType === 'Recurring'

  const [step, setStep] = useState<'confirm' | 'otp' | 'success' | 'failed'>('confirm')
  const [account, setAccount] = useState<string | null>(null)
  const [option, setOption] = useState<'full' | 'partial'>('full')
  const [part, setPart] = useState('')
  const partValue = Number(part.replace(/[^0-9.]/g, '')) || 0
  const amount = mode === 'balance' || option === 'full' ? remaining : partValue
  const amountValid = mode === 'balance' || option === 'full' || (partValue > 0 && partValue <= remaining)
  const missing = !account ? 'Choose the account to pay from' : !amountValid ? (partValue > remaining ? `Enter up to ${m(remaining)}` : 'Enter the amount to pay') : ''

  const last4 = bill.payment.accountNumber.replace(/\D/g, '').slice(-4)
  const rows: [string, string][] = [
    ['Vendor', bill.vendor],
    ['Pay to', [bill.payment.method, bill.payment.country, last4 && `••••${last4}`].filter(Boolean).join(' · ')],
    ['Bill type', recurring ? `Recurring · ${bill.frequency}` : 'One time'],
    ['Invoice total', m(total)],
    ...(paid > 0 ? ([['Paid so far', m(paid)]] as [string, string][]) : []),
    ['Reference', bill.reference],
  ]

  const finish = () => {
    recordBillPayment(bill.id, amount, total)
    setStep('success')
  }
  const fail = () => {
    setBillStatus(bill.id, 'Payment failed')
    setStep('failed')
  }

  return (
    <Drawer open onClose={onClose}>
      <div className="flex min-h-full flex-col gap-6 p-8" data-payment-step={step}>
        {step === 'confirm' && (
          <>
            <DrawerTitle
              title={mode === 'balance' ? 'Pay remaining balance' : 'Confirm bill payment'}
              subtitle={
                mode === 'balance'
                  ? 'Review the outstanding amount and payment details before completing this bill'
                  : 'Review the transaction details before funds are sent to the vendor.'
              }
              onClose={onClose}
            />
            <div className="flex flex-col">
              {rows.map(([label, value], i) => (
                <Row key={label} label={label} value={value} last={i === rows.length - 1} />
              ))}
            </div>
            <PayFromSelect value={account} onChange={setAccount} />
            <PaymentMethodSelect initial={bill.payment.method === 'ACH' ? 'ACH' : undefined} />
            <div className="flex flex-col">
              <Row label="Vendor receives" value={m(amount)} />
              <Row label="Estimated arrival" value="Same day" />
              <Row label="Transfer fee" value={m(0.4)} />
              <Row label="Total debit" value={m(amount + 0.4)} last />
            </div>
            {mode === 'balance' ? (
              <HdsInput label="Amount" value={m(remaining)} readOnly helper="Remaining balance on this bill" />
            ) : (
              <div className="flex flex-col gap-3">
                <AmountRadioGroup fullAmountValue={m(remaining)} value={option} onChange={setOption} />
                {option === 'partial' && (
                  <HdsInput
                    label="Amount to pay"
                    value={part}
                    onChange={(e) => setPart(e.target.value.replace(/[^0-9.,]/g, ''))}
                    placeholder={m(0)}
                    inputMode="decimal"
                    helper={`Up to ${m(remaining)}. The rest stays outstanding on this bill.`}
                  />
                )}
              </div>
            )}
            <div className="mt-auto flex flex-col gap-4 pt-2">
              <HdsButton variant="primary" fullWidth disabled={!!missing} onClick={() => setStep('otp')}>
                {mode === 'balance' ? 'Pay' : mode === 'retry' ? 'Retry payment' : 'Make payment'}
              </HdsButton>
              {missing && <p className="-mt-2 text-center text-xs text-[#6b7280]">{missing}</p>}
              <HdsButton variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </HdsButton>
            </div>
          </>
        )}
        {step === 'otp' && <OtpStep onBack={() => setStep('confirm')} onConfirm={finish} onFail={fail} />}
        {(step === 'success' || step === 'failed') && (
          <Outcome
            success={step === 'success'}
            body={
              step === 'success'
                ? amount < remaining - 0.005
                  ? `${m(amount)} has been sent to ${bill.vendor}. ${m(remaining - amount)} is still outstanding on this bill.`
                  : `${m(amount)} has been sent to ${bill.vendor}.`
                : "We couldn't complete this transaction. Please try again."
            }
            onRetry={() => setStep('confirm')}
            onClose={onClose}
          />
        )}
      </div>
    </Drawer>
  )
}

function OtpStep({ onBack, onConfirm, onFail }: { onBack: () => void; onConfirm: () => void; onFail: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState(false)
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const complete = digits.every((d) => d !== '')

  const set = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1)
    setDigits((d) => d.map((x, j) => (j === i ? v : x)))
    setError(false)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <button type="button" onClick={onBack} className="flex w-fit items-center gap-1">
          <img src={arrowLeftBack} alt="" className="size-3" />
          <span className="text-xs font-medium text-[#555354]">Back</span>
        </button>
        <p className="font-heading text-[22px] font-semibold text-text-primary">Enter OTP</p>
        <p className="text-base text-[#555354]">We sent a 6-digit code to a*****@acmetrading.com. Type it below to continue.</p>
      </div>
      <div className="flex flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el
                }}
                autoFocus={i === 0}
                value={d}
                onChange={(e) => set(i, e.target.value)}
                onKeyDown={(e) => e.key === 'Backspace' && !digits[i] && i > 0 && refs.current[i - 1]?.focus()}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                aria-invalid={error || undefined}
                className={`h-14 w-12 rounded-lg bg-[#f5f6f8] text-center text-base font-semibold text-[#111927] outline-none transition-colors ${ error ? 'border border-[#b4232e]' : 'border-[0.5px] border-[#edeff2] focus:border focus:border-[#004b87]' }`}
              />
            ))}
          </div>
          {error && <p className="text-xs text-[#b4232e]">Incorrect code entered</p>}
        </div>
        <HdsButton
          variant="primary"
          fullWidth
          disabled={!complete || error}
          onClick={() => (digits.join('') === CORRECT_CODE ? onConfirm() : setError(true))}
        >
          Confirm
        </HdsButton>
        <div className="flex flex-col items-center gap-1 text-[11px] text-text-quaternary">
          <p>Prototype tip: enter 123456 to pay.</p>
          <button type="button" onClick={onFail} className="underline underline-offset-2 hover:text-text-primary">
            Simulate payment failure
          </button>
        </div>
      </div>
    </div>
  )
}

function Outcome({ success, body, onRetry, onClose }: { success: boolean; body: string; onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex min-h-[560px] flex-1 flex-col">
      <div className="mt-16 flex flex-1 flex-col items-center gap-6 text-center">
        <img src={success ? paymentSuccessIllustration : paymentFailedIllustration} alt="" className={success ? 'h-[160px] w-[193px]' : 'h-[149px] w-[165px]'} />
        <div className="flex flex-col gap-2">
          <p className="font-heading text-xl font-semibold text-[#222121]">{success ? 'Payment successful' : 'Payment failed'}</p>
          <p className="text-base text-[#555354]">{body}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-6">
        {!success && (
          <HdsButton variant="primary" fullWidth onClick={onRetry}>
            Retry
          </HdsButton>
        )}
        <HdsButton variant={success ? 'primary' : 'secondary'} fullWidth onClick={onClose}>
          Done
        </HdsButton>
      </div>
    </div>
  )
}
