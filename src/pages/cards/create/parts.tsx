import type { ReactNode } from 'react'
import { type SelectOption } from '../../../components/ui/hds'
import cardBg from '../../../assets/icons/card2-bg.svg'
import cardPattern from '../../../assets/icons/card2-pattern.svg'
import cardChip from '../../../assets/icons/card2-chip.svg'
import cardVisa from '../../../assets/icons/card2-visa.svg'
import cardLogomark from '../../../assets/icons/card2-logomark.svg'
import cardLogotype from '../../../assets/icons/card2-logotype.svg'
import stepperTick from '../../../assets/icons/kyb-stepper-tick.svg'
import stepperCircleActive from '../../../assets/icons/kyb-stepper-circle-active.svg'
import stepperCircleInactive from '../../../assets/icons/kyb-stepper-circle-inactive.svg'

/* ------------------------------------------------------------------ */
/*  Types & reference data                                             */
/* ------------------------------------------------------------------ */

export type LimitType = 'Daily' | 'Monthly' | 'Total'

export type Member = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Support' | 'Finance'
  cardCount: number
}

export type CardDraft = {
  nickname: string
  purpose: string | null
  limitType: LimitType | null
  cap: string
  assignee: Member | null
  skippedAssign: boolean
}

export const CARDHOLDER_NAME = 'John Doe'
export const MAX_CARD_LIMIT = 50000
export const COLLATERAL_BALANCE = 2150.67

export const EMPTY_DRAFT: CardDraft = {
  nickname: '',
  purpose: null,
  limitType: null,
  cap: '',
  assignee: null,
  skippedAssign: false,
}

export const MEMBERS: Member[] = [
  { id: 'johnson', name: 'Johnson Manor', email: 'jmanor@fracisoltd.com', role: 'Admin', cardCount: 0 },
  { id: 'dana', name: 'Dana Avery', email: 'dana@fracisoltd.com', role: 'Support', cardCount: 3 },
  { id: 'kevin', name: 'Kevin Vance', email: 'kevin@fracisoltd.com', role: 'Finance', cardCount: 1 },
  { id: 'tyler', name: 'Tyler Bates', email: 'tyler@fracisoltd.com', role: 'Support', cardCount: 0 },
  { id: 'grace', name: 'Grace Jameson', email: 'grace@fracisoltd.com', role: 'Admin', cardCount: 0 },
  { id: 'priya', name: 'Priya Raman', email: 'priya@fracisoltd.com', role: 'Finance', cardCount: 2 },
]

/** Assign to — HDS Select options: name, with "email · role" underneath. */
export const MEMBER_OPTIONS: SelectOption[] = MEMBERS.map((m) => ({ value: m.id, label: m.name, description: `${m.email} · ${m.role}` }))

export const LIMIT_TYPES: { value: LimitType; hint: string }[] = [
  { value: 'Daily', hint: 'Cap applies to each day' },
  { value: 'Monthly', hint: 'Cap applies to each month' },
  { value: 'Total', hint: 'Cap applies over the card’s lifetime' },
]

/* ------------------------------------------------------------------ */
/*  Amount helpers                                                     */
/* ------------------------------------------------------------------ */

/** Keeps a live, comma-grouped USD amount string with at most 2 decimals. */
export function formatAmountInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [intPart = '', ...rest] = cleaned.split('.')
  const decimals = rest.join('').slice(0, 2)
  const intDigits = intPart.replace(/^0+(?=\d)/, '')
  const grouped = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return cleaned.includes('.') ? `${grouped || '0'}.${decimals}` : grouped
}

export const parseAmount = (value: string) => Number(value.replace(/,/g, '')) || 0

export const formatUsd = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* ------------------------------------------------------------------ */
/*  Spend purpose catalogue (PRD FR-1) with Hugeicons-style glyphs     */
/* ------------------------------------------------------------------ */

const PURPOSE_PATHS: Record<string, string> = {
  'Bills and utilities': 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  'Consulting fees': 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z',
  'Equipment purchase': 'M4 5h16v11H4zM2 19h20',
  'Event expenses': 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  'Insurance premiums': 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z',
  'Invoice payment': 'M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6',
  'Legal fees': 'M12 4v16M7 20h10M5 8h14M5 8l-3 6h6l-3-6ZM19 8l-3 6h6l-3-6Z',
  'Maintenance and repairs': 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z',
  General: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  Gifts: 'M3 8h18v4H3zM5 12h14v9H5zM12 8v13M12 8C10 4 6 4 6 6.5S10 8 12 8c2 0 6 1 6-1.5S14 4 12 8Z',
  Groceries: 'M3 4h2l2.5 11h11L21 7H6M9 20h.01M18 20h.01',
  Health: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  Housing: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
  Investments: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  'Personal care': 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z',
  Salary: 'M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  Savings: 'M4 7h14a2 2 0 0 1 2 2v10H4zM4 7l11-3v3M16 13h1',
  Shopping: 'M5 8h14l-1 13H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2',
  Transport: 'M5 16v-5l2-5h10l2 5v5H5ZM5 16v3M19 16v3M5 11h14M8 14h.01M16 14h.01',
  Trips: 'M10.5 13.5 3 10l18-7-7 18-3.5-7.5Z',
}

export const PURPOSES = Object.keys(PURPOSE_PATHS)

export function PurposeIcon({ purpose, className = 'size-4' }: { purpose: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d={PURPOSE_PATHS[purpose] ?? PURPOSE_PATHS.General}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Card render                                                        */
/* ------------------------------------------------------------------ */

// Card visual (Figma 48033:234975): navy card with the wave pattern, chip, Hinstantt logo and Visa mark.
// Sizes are in container units so the card scales cleanly wherever it's placed.
export function CardRender({
  nickname,
  holder,
  last4,
  className = '',
  face = 'nickname',
  frozen = false,
}: {
  nickname: string
  holder: string
  last4?: string
  className?: string
  /** 'number' shows the masked card number with EXP / CVV (card drawer, 48062:239054). */
  face?: 'nickname' | 'number'
  /** Frozen overlay (48062:239504): blurred card, snowflake and "Card frozen". */
  frozen?: boolean
}) {
  return (
    <div className={`w-full [container-type:inline-size] ${className}`}>
    <div className="relative aspect-[331/196] w-full overflow-hidden rounded-[3.3cqw] bg-[#0d2c55] text-white shadow-[0_1px_1px_rgba(17,16,17,0.05)]">
      <img src={cardBg} alt="" className="absolute left-0 right-0 top-0 h-[135.75%] w-full max-w-none" />
      <img src={cardPattern} alt="" className="absolute max-w-none" style={{ left: '-30.02%', right: '-49.4%', top: '-41.74%', bottom: '-129.8%', width: '179.42%', height: '271.54%' }} />
      <img src={cardChip} alt="" className="absolute max-w-none" style={{ left: '6.39%', top: '32.5%', width: '15.12%', height: '23.33%' }} />
      <img src={cardVisa} alt="VISA" className="absolute max-w-none" style={{ left: '82.35%', top: '74.94%', width: '15.24%', height: '22.62%' }} />
      <div className="absolute flex items-center" style={{ right: '2.9%', top: '4.5%', width: '30.87%', height: '7.94%' }}>
        <img src={cardLogomark} alt="" className="h-full w-[17.4%] max-w-none" />
        <img src={cardLogotype} alt="hinstantt" className="ml-auto h-full w-[78.14%] max-w-none" />
      </div>
      {face === 'number' ? (
        <div className="absolute flex flex-col gap-[1.5cqw] font-medium text-[#f5f6f8]" style={{ left: '8.03%', top: '58%' }}>
          <p className="whitespace-nowrap text-[5.2cqw] tracking-[0.08em]">**** **** **** {last4 ?? '••••'}</p>
          <p className="flex gap-[5cqw] whitespace-nowrap text-[4.4cqw]">
            <span>EXP **/**</span>
            <span>CVV ***</span>
          </p>
        </div>
      ) : (
      <div className="absolute flex flex-col gap-[1.3cqw]" style={{ left: '8.03%', top: '70.7%' }}>
        <p className={`whitespace-nowrap text-[4.83cqw] font-semibold leading-[7.25cqw] ${nickname ? 'text-[#f5f6f8]' : 'text-white/60'}`}>{nickname || 'Card nickname'}</p>
        <p className="whitespace-nowrap text-[4.23cqw] font-medium leading-[6.04cqw] text-[#f6f6f6]">
          {holder} · {last4 ? `•••• ${last4}` : '•••• ••••'}
        </p>
      </div>
      )}
      {frozen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2.5cqw] bg-[#9fb6cf]/45 text-center backdrop-blur-[2.5px]">
          <span className="flex size-[13cqw] items-center justify-center rounded-full border border-white/70 bg-white/25 text-white">
            <svg viewBox="0 0 24 24" className="size-[7cqw]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5 4.2 17.5M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
            </svg>
          </span>
          <span className="rounded-full bg-[#004b87] px-[3.5cqw] py-[1.4cqw] text-[3.8cqw] font-semibold text-white">Card frozen</span>
          <span className="text-[2.9cqw] text-white">Payments are paused. Unfreeze to use this card.</span>
        </div>
      )}
    </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stepper                                                            */
/* ------------------------------------------------------------------ */

export const STEP_LABELS = ['Card details', 'Review', 'Fund']

/** Card details — Review — Fund progress pill (48033:234959), same treatment as the KYB stepper. */
export function Stepper({ current, labels = STEP_LABELS }: { current: number; labels?: string[] }) {
  return (
    <ol className="flex items-center" aria-label="Create card progress">
      {labels.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex items-center" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span className={`mx-2.5 h-[1.5px] w-8 shrink-0 ${step <= current ? 'bg-text-primary' : 'bg-border-disabled'}`} />}
            <span className={`flex items-center gap-2 rounded-pill py-1.5 pl-2.5 pr-3.5 ${active ? 'bg-brand/10' : ''}`}>
              {done ? (
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-text-primary">
                  <img src={stepperTick} alt="" className="h-[7.58px] w-[9.04px]" />
                </span>
              ) : (
                <img src={active ? stepperCircleActive : stepperCircleInactive} alt="" className="size-[26px] shrink-0" />
              )}
              <span className={`whitespace-nowrap ${active ? 'text-sm font-semibold text-text-primary' : done ? 'text-[13px] text-text-primary' : 'text-[13px] text-text-quaternary'}`}>{label}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ */
/*  Summary panel (left column)                                        */
/* ------------------------------------------------------------------ */

export function SummaryRow({ label, value, action }: { label: string; value: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eff2f4] py-2.5 last:border-b-0">
      <dt className="text-[13px] text-[#6b7280]">{label}</dt>
      <dd className="flex items-center gap-3 text-right text-[13px] font-medium text-text-primary">
        {value}
        {action}
      </dd>
    </div>
  )
}

export const dash = <span className="text-[#9aa1ac]">—</span>

// Link-style action (HDS Button / Link variant) for router <Link>s that can't be an HdsButton.
export const linkBtn = 'text-sm font-semibold text-[#004b87] underline-offset-4 hover:text-[#004378] hover:underline'

/* ------------------------------------------------------------------ */
/*  Spend purpose + limit options (HDS Select)                         */
/* ------------------------------------------------------------------ */

export const PURPOSE_OPTIONS: SelectOption[] = PURPOSES.map((p) => ({ value: p, label: p, icon: <PurposeIcon purpose={p} className="size-4" /> }))
export const LIMIT_OPTIONS: SelectOption[] = LIMIT_TYPES.map((l) => ({ value: l.value, label: l.value, description: l.hint }))
