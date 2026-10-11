import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Drawer } from '../accounts/ui'
import { HdsBadge, HdsButton, HdsListItem, HdsSelect, type SelectOption } from '../../components/ui/hds'
import { FLAGS } from '../bills2/hdsKit'
import successIllustration from '../../assets/icons/accounts-success-illustration.svg'
import qrCode from '../../assets/images/card-account-qr.png'

// Funding flows on the Cards page.
//   Card account (general card) — Figma 48041:238690: choose a method → Hinstantt account (source + amount →
//   Review & Confirm → OTP → Transfer Successful), Digital asset transfer (USDC on Stellar) or Bank transfer.
//   Individual card — Figma 48041:237786: amount + card from the card account → Review & Confirm → OTP → success.
// OTP: any 6 digits confirm, except 000000 which shows the "Incorrect code entered" state.

export type FundableCard = { id: string; nickname: string; last4: string; assignee: string; balance: number; frozen: boolean; statusLabel: string }

const WRONG_CODE = '000000'
export const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const parse = (v: string) => Number(v.replace(/,/g, '')) || 0
const formatInput = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [i = '', ...rest] = cleaned.split('.')
  const grouped = i.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return cleaned.includes('.') ? `${grouped || '0'}.${rest.join('').slice(0, 2)}` : grouped
}

/* ------------------------------------------------------------------ */
/*  Shared pieces                                                      */
/* ------------------------------------------------------------------ */

const CloseX = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-label="Close" className="flex size-6 shrink-0 items-center justify-center text-[#111927] transition-opacity hover:opacity-70">
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </button>
)

const BackLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex w-fit items-center gap-1 text-xs font-medium text-[#555354] hover:text-[#111927]">
    <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
      <path d={label === 'Go back' ? 'M13 8H3M7 4L3 8l4 4' : 'M10 4L6 8l4 4'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </button>
)

const Title = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">{children}</h2>
    {sub && <p className="text-sm text-[#555354]">{sub}</p>}
  </div>
)

const CardGlyph = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
    <path d="M2.5 3.5h11A1.5 1.5 0 0 1 15 5v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 11V5a1.5 1.5 0 0 1 1.5-1.5ZM1 6.2v1.6h14V6.2H1Zm2.5 3.6a.6.6 0 0 0 0 1.2h2a.6.6 0 0 0 0-1.2h-2Z" />
  </svg>
)

const UsdChip = () => (
  <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-[#111927] shadow-[0_0_0_1px_#edeff2]">
    <img src={FLAGS.US} alt="" className="size-3.5 rounded-full" />
    USD
  </span>
)

function AmountField({ value, onChange, helper, error }: { value: string; onChange: (v: string) => void; helper?: ReactNode; error?: string | null }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#111927]">Amount</span>
      <span className={`flex h-11 items-center gap-2 rounded-lg border-[0.5px] px-3.5 ${error ? 'border-[#b4232e] bg-white' : 'border-[#edeff2] bg-[#f5f6f8] focus-within:border-[#004b87] focus-within:bg-white'}`}>
        <input inputMode="decimal" value={value} onChange={(e) => onChange(formatInput(e.target.value))} placeholder="0.00" className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none" />
        <UsdChip />
      </span>
      {(error || helper) && <span className={`text-[11px] ${error ? 'text-[#b4232e]' : 'text-[#6b7280]'}`}>{error ?? helper}</span>}
    </label>
  )
}

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <p className="text-[13px] text-[#6b7280]">{label}</p>
    <p className="flex items-center gap-1 text-right text-[13px] font-medium text-[#111927]">{value}</p>
  </div>
)

function OtpBoxes({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => refs.current[0]?.focus(), [])
  return (
    <div
      className="flex gap-2"
      onPaste={(e) => {
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (digits) {
          e.preventDefault()
          onChange(digits)
          refs.current[Math.min(digits.length, 5)]?.focus()
        }
      }}
    >
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
            onChange((value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6))
            if (d && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          className={`h-12 w-11 rounded-lg border text-center text-lg font-semibold text-[#111927] outline-none transition-colors ${error ? 'border-[#d92836] bg-white' : 'border-[#edeff2] bg-[#f5f6f8] focus:border-[#004b87] focus:bg-white'}`}
        />
      ))}
    </div>
  )
}

/** Enter OTP (48041:238248 / 238286 / 238267): Confirm disabled until 6 digits; wrong code shows the error state. */
function OtpStep({ backLabel, onBack, onConfirmed }: { backLabel: string; onBack: () => void; onConfirmed: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (seconds <= 0) return
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [seconds])
  const confirm = () => {
    setConfirming(true)
    window.setTimeout(() => {
      setConfirming(false)
      if (code === WRONG_CODE) setError(true)
      else onConfirmed()
    }, 700)
  }
  return (
    <>
      <div className="flex flex-col gap-6 px-6 pt-8">
        <BackLink label={backLabel} onClick={onBack} />
        <Title sub="We sent a 6-digit code to a*****@acmetrading.com. Enter it below to continue.">Enter OTP</Title>
        <div className="flex flex-col items-start gap-2">
          <OtpBoxes
            value={code}
            error={error}
            onChange={(v) => {
              setCode(v)
              setError(false)
            }}
          />
          {error && <p className="text-xs text-[#b4232e]">Incorrect code entered</p>}
        </div>
        <HdsButton fullWidth disabled={code.length < 6 || error} loading={confirming} onClick={confirm}>
          Confirm
        </HdsButton>
        <p className="text-center text-xs text-[#6b7280]">
          {seconds > 0 ? (
            `Resend in 0:${String(seconds).padStart(2, '0')}`
          ) : (
            <button
              type="button"
              className="font-semibold text-[#004b87] hover:underline"
              onClick={() => {
                setSeconds(30)
                setCode('')
                setError(false)
              }}
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </>
  )
}

function SuccessStep({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className="relative flex min-h-full flex-col items-center px-6 pb-8 pt-24 text-center">
      <div className="absolute right-6 top-6">
        <CloseX onClick={onDone} />
      </div>
      <img src={successIllustration} alt="" className="h-40 w-[193px] animate-[popIn_400ms_ease-out]" />
      <p className="mt-6 font-heading text-xl font-semibold text-[#111927]">Transfer Successful</p>
      <p className="mt-2 max-w-[320px] text-sm text-[#555354]">{message}</p>
      <HdsButton fullWidth className="mt-8" onClick={onDone}>
        Return to cards page
      </HdsButton>
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] py-3 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[11px] text-[#6b7280]">{label}</p>
        <p className="truncate text-[13px] font-medium text-[#111927]">{value}</p>
      </div>
      <button
        type="button"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => {})
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1200)
        }}
        className="text-[#9aa1ac] transition-colors hover:text-[#111927]"
      >
        {copied ? (
          <svg viewBox="0 0 16 16" className="size-4 text-[#077155]" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
            <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
            <path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
          </svg>
        )}
      </button>
    </div>
  )
}

function Instructions({ items, link }: { items: string[]; link?: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-[#f5f6f8] p-4">
      <p className="text-xs font-semibold text-[#111927]">Deposit instructions</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2 text-[11px] leading-4 text-[#4b5563]">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#9aa1ac]" />
            {t}
          </li>
        ))}
      </ul>
      {link && (
        <button type="button" className="flex w-fit items-center gap-1 text-[11px] font-semibold text-[#004b87] hover:underline">
          {link}
          <svg viewBox="0 0 10 10" className="size-2" aria-hidden="true">
            <path d="M3 1l4 4-4 4z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  )
}

function useCopied() {
  const [copied, setCopied] = useState(false)
  return [copied, (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }] as const
}

const downloadText = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ */
/*  Fund card account (general card)                                   */
/* ------------------------------------------------------------------ */

const SOURCE_ACCOUNTS = [
  { id: 'operations', name: 'Operations account', short: 'Ops/Payroll', last4: '8327', balance: 12480 },
  { id: 'marketing', name: 'Marketing account', short: 'Marketing', last4: '8327', balance: 12480 },
  { id: 'treasury', name: 'Treasury account', short: 'Treasury', last4: '8327', balance: 12480 },
]
const SOURCE_OPTIONS: SelectOption[] = SOURCE_ACCOUNTS.map((a) => ({
  value: a.id,
  label: a.name,
  description: `Savings, ****${a.last4} · ${usd(a.balance)}`,
  icon: <img src={FLAGS.US} alt="" className="size-4 rounded-full" />,
}))

const WALLET_ADDRESS = 'GA3D7XKQ2M9FVBQ4ZP1LN8RTYU6HW0CJ5SD2EK92FZPQXL'
const CRYPTO_INSTRUCTIONS = [
  'Do not send NFTs or unsupported tokens.',
  'Do not reuse old deposit addresses for other currencies or networks.',
  'Always verify the address before sending.',
  'Deposits typically reflect within 5-10 minutes after network confirmation.',
  'Only send USDC on Stellar to this address. Sending any other asset or using a different network may result in loss of funds.',
]
const BANK_DETAILS = [
  ['Account name', 'This Is A Fake Bizz'],
  ['Account number', '900437968068'],
  ['Account type', 'Checking'],
  ['Routing number', '101019644'],
  ['Bank name', 'Bank of Nowhere'],
  ['Bank address', '1800 North Pole St., Orlando, FL 32801'],
] as const
const BANK_INSTRUCTIONS = [
  'Ensure the routing number, account number, and recipient name are entered correctly to avoid delays or errors.',
  'ACH transfers typically settle within 1–3 business days. Domestic wires are usually completed the same day when submitted before the bank’s cutoff time.',
  'Your bank may charge a fee for ACH or wire transfers. Confirm any fees with your bank.',
  'Specify USD as the payment currency to avoid automatic conversion or transfer rejection.',
  'Keep proof of payment and its reference number for tracking and support purposes.',
]

const MethodIcon = ({ d }: { d: string }) => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] text-[#111927]">
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  </span>
)

type AccountStep = 'method' | 'hinstantt' | 'review' | 'otp' | 'success' | 'crypto' | 'bank'

export function FundAccountDrawer({
  open,
  onClose,
  onFunded,
  variant = 'cards',
}: {
  open: boolean
  onClose: () => void
  onFunded: (amount: number) => void
  /** 'account' = the card account page's chooser (48062:243930): Bank transfer, Card, Crypto deposit, Internal transfer. */
  variant?: 'cards' | 'account'
}) {
  const [step, setStep] = useState<AccountStep>('method')
  const [source, setSource] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [addrCopied, copyAddr] = useCopied()
  const [detailsCopied, copyDetails] = useCopied()

  useEffect(() => {
    if (!open) return
    setStep('method')
    setSource(null)
    setAmount('')
  }, [open])

  const account = SOURCE_ACCOUNTS.find((a) => a.id === source)
  const value = parse(amount)
  const error = account && value > account.balance ? 'Amount exceeds the available balance' : null
  const valid = Boolean(account && value > 0 && !error)

  const finish = () => {
    onFunded(value)
    onClose()
  }

  return (
    <Drawer open={open} onClose={step === 'success' ? finish : onClose}>
      <div className="flex min-h-full flex-col">
        {step === 'method' && (
          <div className="flex flex-col gap-6 px-6 pt-8">
            <div className="flex items-start justify-between gap-4">
              {variant === 'account' ? <Title sub="Select your preferred method to add money to your USD account">Fund account</Title> : <Title sub="Choose a funding method.">Fund your card account</Title>}
              <CloseX onClick={onClose} />
            </div>
            {variant === 'account' ? (
            <div className="flex flex-col gap-3">
              <HdsListItem style="card" title="Bank transfer" subtitle="Fund your account via ACH or wire transfer" leading={<MethodIcon d="M2 6.5 8 3l6 3.5M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12" />} trailing={{ type: 'chevron' }} onClick={() => setStep('bank')} />
              <HdsListItem style="card" title="Card" subtitle="Top up your balance using your debit card." leading={<MethodIcon d="M2 4.5h12v7H2zM2 7h12M4 9.5h2.5" />} trailing={{ type: 'node', node: <HdsBadge color="grey" size="sm">Coming soon</HdsBadge> }} />
              <HdsListItem style="card" title="Crypto deposit" subtitle="Deposit funds into your account using stablecoins" leading={<MethodIcon d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6 5.5h3a1.5 1.5 0 0 1 0 3H6V5.5Zm0 3h3.5a1.5 1.5 0 0 1 0 3H6v-3ZM7 4.5v1M7 11.5v1" />} trailing={{ type: 'chevron' }} onClick={() => setStep('crypto')} />
              <HdsListItem style="card" title="Internal transfer" subtitle="Move funds in minutes across existing wallets" leading={<MethodIcon d="M3 5.5h9l-2.5-2.5M13 10.5H4l2.5 2.5" />} trailing={{ type: 'chevron' }} onClick={() => setStep('hinstantt')} />
            </div>
            ) : (
            <div className="flex flex-col gap-3">
              <HdsListItem style="card" title="Bank transfer" subtitle="Add funds directly from your bank account." leading={<MethodIcon d="M2 6.5 8 3l6 3.5M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12" />} trailing={{ type: 'chevron' }} onClick={() => setStep('bank')} />
              <HdsListItem style="card" title="Hinstantt account" subtitle="Move funds from your Hinstantt balance." leading={<MethodIcon d="M2.5 5.5h11v7h-11zM2.5 5.5l2-2.5h7l2 2.5M10 9h1.5" />} trailing={{ type: 'chevron' }} onClick={() => setStep('hinstantt')} />
              <HdsListItem style="card" title="Digital asset transfer" subtitle="Add funds from an external wallet." leading={<MethodIcon d="M3 5.5h9l-2.5-2.5M13 10.5H4l2.5 2.5" />} trailing={{ type: 'chevron' }} onClick={() => setStep('crypto')} />
            </div>
            )}
          </div>
        )}

        {step === 'hinstantt' && (
          <>
            <div className="flex flex-col gap-6 px-6 pt-8">
              <BackLink label="Go back" onClick={() => setStep('method')} />
              <Title>Fund account</Title>
              <HdsSelect label="Source account" placeholder="Select source account" options={SOURCE_OPTIONS} value={source} onChange={setSource} menuMode="inline" />
              <AmountField value={amount} onChange={setAmount} helper={account ? `Balance: ${usd(account.balance)}` : undefined} error={error} />
              <HdsButton fullWidth disabled={!valid} onClick={() => setStep('review')}>
                Continue
              </HdsButton>
            </div>
          </>
        )}

        {step === 'review' && account && (
          <div className="flex flex-col gap-6 px-6 pt-8">
            <BackLink label="Go back" onClick={() => setStep('hinstantt')} />
            <Title>Review &amp; Confirm</Title>
            <div className="flex flex-col">
              <p className="pb-1 text-sm font-semibold text-[#111927]">Transaction Details</p>
              <DetailRow
                label="From"
                value={
                  <>
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                      <path d="M2 6.5 8 3l6 3.5M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12" />
                    </svg>
                    {account.short} •• {account.last4}
                  </>
                }
              />
              <DetailRow label="To" value="Collateral Wallet" />
              <DetailRow label="Amount" value={usd(value)} />
            </div>
            <HdsButton fullWidth onClick={() => setStep('otp')}>
              Continue
            </HdsButton>
          </div>
        )}

        {step === 'otp' && <OtpStep backLabel="Go back" onBack={() => setStep('review')} onConfirmed={() => setStep('success')} />}
        {step === 'success' && <SuccessStep message={`You have successfully funded your account with ${usd(value)}`} onDone={finish} />}

        {step === 'crypto' && (
          <div className="flex flex-col gap-5 px-6 pb-8 pt-8">
            <div className="flex items-start justify-between gap-4">
              <Title sub="Send USDC on the Stellar network to the address below. Your balance updates shortly after confirmation">Fund card</Title>
              <CloseX onClick={onClose} />
            </div>
            <div className="flex justify-center rounded-xl border border-[#edeff2] py-4">
              <img src={qrCode} alt="QR code for the USDC deposit address" className="size-[200px]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-[#111927]">Wallet address</p>
              <p className="break-all rounded-lg bg-[#f5f6f8] px-3.5 py-3 text-xs text-[#4b5563]">{WALLET_ADDRESS}</p>
            </div>
            <div className="flex flex-col">
              <DetailRow label="Network" value="Stellar Network" />
              <DetailRow label="Currency type" value="USDC" />
              <DetailRow label="Memo" value="N/A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HdsButton variant="secondary" fullWidth onClick={() => copyAddr(WALLET_ADDRESS)}>
                {addrCopied ? 'Address copied' : 'Copy address'}
              </HdsButton>
              <HdsButton fullWidth onClick={() => downloadText('usdc-deposit-details.txt', `Wallet address: ${WALLET_ADDRESS}\nNetwork: Stellar Network\nCurrency type: USDC\nMemo: N/A`)}>
                Download details
              </HdsButton>
            </div>
            <Instructions items={CRYPTO_INSTRUCTIONS} link="Download the full transfer instructions for detailed steps" />
          </div>
        )}

        {step === 'bank' && (
          <div className="flex flex-col gap-5 px-6 pb-8 pt-8">
            <div className="flex items-start justify-between gap-4">
              <Title sub="Transfer funds to the bank details below to credit your card account. Your balance will be updated within 1–2 business days.">Your account details</Title>
              <CloseX onClick={onClose} />
            </div>
            <div className="flex flex-col rounded-xl border border-[#edeff2] px-4">
              {BANK_DETAILS.map(([l, v]) => (
                <CopyRow key={l} label={l} value={v} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HdsButton variant="secondary" fullWidth onClick={() => copyDetails(BANK_DETAILS.map(([l, v]) => `${l}: ${v}`).join('\n'))}>
                {detailsCopied ? 'Details copied' : 'Copy details'}
              </HdsButton>
              <HdsButton fullWidth onClick={() => downloadText('card-account-bank-details.txt', BANK_DETAILS.map(([l, v]) => `${l}: ${v}`).join('\n'))}>
                Download details
              </HdsButton>
            </div>
            <Instructions items={BANK_INSTRUCTIONS} />
          </div>
        )}
      </div>
    </Drawer>
  )
}

/* ------------------------------------------------------------------ */
/*  Fund an individual card                                            */
/* ------------------------------------------------------------------ */

type CardStep = 'form' | 'review' | 'otp' | 'success'

export function FundCardDrawer({
  open,
  cards,
  initialCardId,
  accountBalance,
  onClose,
  onFunded,
}: {
  open: boolean
  cards: FundableCard[]
  initialCardId: string | null
  accountBalance: number
  onClose: () => void
  onFunded: (cardId: string, amount: number) => void
}) {
  const [step, setStep] = useState<CardStep>('form')
  const [cardId, setCardId] = useState<string | null>(initialCardId)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) return
    setStep('form')
    setCardId(initialCardId)
    setAmount('')
  }, [open, initialCardId])

  const card = cards.find((c) => c.id === cardId)
  const value = parse(amount)
  const error = value > accountBalance ? 'Amount exceeds your card account balance' : null
  const valid = Boolean(card && !card.frozen && value > 0 && !error)

  const options: SelectOption[] = cards.map((c) => ({
    value: c.id,
    label: c.nickname,
    description: c.frozen ? 'Funds will be available when unfrozen' : `****${c.last4} · ${c.assignee} · ${usd(c.balance)}`,
    icon: <CardGlyph />,
    meta: (
      <HdsBadge color={c.statusLabel === 'Active' ? 'navy' : 'grey'} size="sm">
        {c.statusLabel}
      </HdsBadge>
    ),
    disabled: c.frozen,
  }))

  const finish = () => {
    if (card) onFunded(card.id, value)
    onClose()
  }

  return (
    <Drawer open={open} onClose={step === 'success' ? finish : onClose}>
      <div className="flex min-h-full flex-col">
        {step === 'form' && (
          <div className="flex flex-col gap-6 px-6 pt-8">
            <BackLink label="Back" onClick={onClose} />
            <Title>Fund card</Title>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-[#111927]">Source account</p>
              <div className="flex items-center gap-3 rounded-lg border border-[#edeff2] bg-white px-3.5 py-3">
                <CardGlyph className="size-4 text-[#111927]" />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[#111927]">Card Account</p>
                  <p className="text-[11px] text-[#6b7280]">{usd(accountBalance)}</p>
                </div>
              </div>
            </div>
            <AmountField value={amount} onChange={setAmount} helper={`Balance: ${usd(accountBalance)}`} error={error} />
            <HdsSelect
              label="Card"
              placeholder="Select card"
              searchable
              searchPlaceholder="Search"
              options={options}
              value={cardId}
              onChange={setCardId}
              menuMode="inline"
              renderValue={(o) => (
                <span className="flex flex-col leading-tight">
                  <span className="text-sm text-[#111927]">{o.label}</span>
                  <span className="text-[11px] text-[#6b7280]">{usd(cards.find((c) => c.id === o.value)?.balance ?? 0)}</span>
                </span>
              )}
            />
            {card?.frozen && <p className="-mt-4 text-[11px] text-[#b4232e]">This card is frozen. Unfreeze it to add funds.</p>}
            <HdsButton fullWidth disabled={!valid} onClick={() => setStep('review')}>
              Continue
            </HdsButton>
          </div>
        )}

        {step === 'review' && card && (
          <div className="flex flex-col gap-6 px-6 pt-8">
            <BackLink label="Back" onClick={() => setStep('form')} />
            <Title>Review &amp; Confirm</Title>
            <div className="flex flex-col">
              <p className="pb-1 text-sm font-semibold text-[#111927]">Transaction Details</p>
              <DetailRow
                label="From"
                value={
                  <>
                    <CardGlyph className="size-3.5" />
                    Card Account
                  </>
                }
              />
              <DetailRow label="To" value={card.nickname} />
              <DetailRow label="Amount" value={usd(value)} />
              <DetailRow label="New card balance" value={usd(card.balance + value)} />
            </div>
            <HdsButton fullWidth onClick={() => setStep('otp')}>
              Fund card
            </HdsButton>
          </div>
        )}

        {step === 'otp' && <OtpStep backLabel="Back" onBack={() => setStep('review')} onConfirmed={() => setStep('success')} />}
        {step === 'success' && <SuccessStep message={`You have successfully funded your card with ${usd(value)}`} onDone={finish} />}
      </div>
    </Drawer>
  )
}
