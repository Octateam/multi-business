import { useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsSelect } from '../../../components/ui/hds'
import { FLAGS, KitAmountInput } from '../../bills2/hdsKit'
import { getCard, notify, updateCard } from '../cardStore'
import {
  CARDHOLDER_NAME,
  COLLATERAL_BALANCE,
  CardRender,
  EMPTY_DRAFT,
  LIMIT_OPTIONS,
  MAX_CARD_LIMIT,
  MEMBERS,
  MEMBER_OPTIONS,
  PURPOSE_OPTIONS,
  PurposeIcon,
  Stepper,
  SummaryRow,
  dash,
  formatAmountInput,
  formatUsd,
  parseAmount,
  type CardDraft,
  type LimitType,
} from './parts'

// Create card (Figma 48033:234138): Card details (incl. Assign to) → Review → Fund, ending in one of three
// result modals — "Card created and funded", "Card created successfully" (funding skipped) or
// "Card creation failed" (?simulate=fail shows it once, then the retry succeeds).

type Step = 1 | 2 | 3
type Result = { kind: 'funded'; amount: number } | { kind: 'created' } | { kind: 'failed' }

const NICKNAME_MAX = 20
const USD_UNITS = [{ value: 'USD', label: 'USD', icon: <img src={FLAGS.US} alt="" className="size-4 rounded-full" /> }]

// Deep links (used by /screens) open a later step with the design's sample data.
const SAMPLE_DRAFT: CardDraft = { nickname: 'Go hard', purpose: 'Bills and utilities', limitType: 'Monthly', cap: '1,200.00', assignee: MEMBERS[0], skippedAssign: false }
const STEP_FROM_PATH: Record<string, Step> = { '/cards/create': 1, '/cards/create/assign': 1, '/cards/create/review': 2, '/cards/create/fund': 3 }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`flex flex-col rounded-2xl border border-[#edeff2] bg-white ${className}`}>{children}</section>
}

function Heading({ title, subtitle, aside }: { title: string; subtitle: string; aside?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">{title}</h2>
        <p className="text-sm text-[#555354]">{subtitle}</p>
      </div>
      {aside}
    </div>
  )
}

const purposeValue = (purpose: string | null) =>
  purpose ? (
    <span className="inline-flex items-center gap-1.5">
      <PurposeIcon purpose={purpose} className="size-3.5 text-[#4d5761]" />
      {purpose}
    </span>
  ) : (
    dash
  )

/* ---------- Result modals (48033:235660 / 236009 / 236358) ---------- */

const ModalClose = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-label="Close" className="absolute right-6 top-6 flex size-6 items-center justify-center rounded-full bg-white text-[#111927] shadow-sm">
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </button>
)

function ResultModal({ result, nickname, holder, last4, onClose, onViewCard, onCreateNew, onTryAgain }: { result: Result; nickname: string; holder: string; last4?: string; onClose: () => void; onViewCard: () => void; onCreateNew: () => void; onTryAgain: () => void }) {
  const failed = result.kind === 'failed'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,11,17,0.55)] p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={failed ? 'Card creation failed' : 'Card created'}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[483px] max-w-full animate-[popIn_180ms_ease-out] flex-col overflow-hidden rounded-[31px] bg-white"
      >
        <ModalClose onClick={onClose} />
        {failed ? (
          <>
            <div className="flex h-[286px] items-center justify-center" style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(222,40,72) 30%, rgb(255,255,255) 100%)' }}>
              <span className="flex size-[100px] items-center justify-center rounded-full bg-white">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#1f2937] text-2xl font-bold text-white">!</span>
              </span>
            </div>
            <div className="flex flex-col gap-6 px-4 pb-4 pt-2">
              <div className="flex flex-col gap-2">
                <p className="font-heading text-[28px] font-semibold tracking-tight text-[#111927]">Card creation failed</p>
                <p className="text-base text-[#4b5563]">We couldn’t create this card. Review the details and try again.</p>
              </div>
              <HdsButton variant="primary" size="lg" fullWidth onClick={onTryAgain}>
                Try again
              </HdsButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center px-14 pb-6 pt-[104px]" style={{ backgroundImage: 'linear-gradient(180deg, rgb(25,90,150) 0%, rgb(255,255,255) 46%)' }}>
              <CardRender nickname={nickname} holder={holder} last4={last4} className="max-w-[330px]" />
            </div>
            <div className="flex flex-col items-center gap-6 px-8 pb-8 text-center">
              <div className="flex flex-col gap-2">
                <p className="font-heading text-[26px] font-semibold tracking-tight text-[#111927]">{result.kind === 'funded' ? 'Card created and funded' : 'Card created successfully'}</p>
                <p className="text-base text-[#4b5563]">
                  You have successfully created a new card {nickname}
                  {result.kind === 'funded' ? ` and funded it with ${formatUsd(result.amount)}` : ''}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <HdsButton variant="primary" size="lg" fullWidth onClick={onViewCard}>
                  View card
                </HdsButton>
                <HdsButton variant="secondary" size="lg" fullWidth onClick={onCreateNew}>
                  Create new card
                </HdsButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function CreateCardFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const simulateFail = params.get('simulate') === 'fail'
  // Edit card (Figma 48062:251996): the same form prefilled from the card, in two steps (Card details → Review).
  const editing = location.pathname === '/cards/edit' ? (getCard(params.get('id')) ?? getCard('c3')) : undefined
  const editMember = editing ? (MEMBERS.find((m) => m.name === editing.assignee) ?? { id: `holder-${editing.id}`, name: editing.assignee, email: `${editing.assignee.split(' ')[0].toLowerCase()}@fracisoltd.com`, role: (editing.assigneeRole as 'Admin' | 'Support' | 'Finance') ?? 'Admin', cardCount: 1 }) : null
  const memberOptions = editMember && !MEMBERS.some((m) => m.id === editMember.id) ? [{ value: editMember.id, label: editMember.name, description: `${editMember.email} · ${editMember.role}` }, ...MEMBER_OPTIONS] : MEMBER_OPTIONS
  const allMembers = editMember && !MEMBERS.some((m) => m.id === editMember.id) ? [editMember, ...MEMBERS] : MEMBERS
  const initialStep = STEP_FROM_PATH[location.pathname] ?? 1

  const [step, setStep] = useState<Step>(initialStep)
  const [draft, setDraft] = useState<CardDraft>(
    editing
      ? { nickname: editing.nickname, purpose: editing.purpose, limitType: editing.limitType, cap: formatAmountInput(editing.cap.toFixed(2)), assignee: editMember, skippedAssign: false }
      : initialStep > 1
        ? SAMPLE_DRAFT
        : EMPTY_DRAFT,
  )
  const [creating, setCreating] = useState(false)
  const [last4, setLast4] = useState<string | undefined>(initialStep === 3 ? '4821' : undefined)
  const [fundAmount, setFundAmount] = useState('')
  const [funding, setFunding] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const attempts = useRef(0)

  const update = (patch: Partial<CardDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const nickname = draft.nickname.trim()
  const holder = draft.assignee?.name ?? CARDHOLDER_NAME
  const capValue = parseAmount(draft.cap)
  const capError = capValue > MAX_CARD_LIMIT ? `The maximum card limit on your account is ${formatUsd(MAX_CARD_LIMIT)}` : null
  // Progressive: Continue stays disabled until every required field is filled.
  const detailsValid = Boolean(draft.assignee && nickname && draft.purpose && draft.limitType && capValue > 0 && !capError)

  const fundValue = parseAmount(fundAmount)
  const fundError = fundValue > COLLATERAL_BALANCE ? 'Amount exceeds your collateral wallet balance' : null
  const fundValid = fundValue > 0 && !fundError

  const saveEdit = () => {
    if (!editing) return
    updateCard(editing.id, { nickname, purpose: draft.purpose ?? editing.purpose, limitType: draft.limitType ?? editing.limitType, cap: capValue, assignee: holder, assigneeRole: draft.assignee?.role ?? editing.assigneeRole })
    notify('Card updated', `${nickname} has been updated.`)
    navigate('/cards')
  }
  const exitToCards = () => navigate('/cards', last4 ? { state: { newCard: { nickname, last4, assignee: draft.assignee?.name ?? null, funded: result?.kind === 'funded' ? result.amount : 0 } } } : undefined)
  const restart = () => {
    setDraft(EMPTY_DRAFT)
    setLast4(undefined)
    setFundAmount('')
    setResult(null)
    setStep(1)
  }

  const createCard = async () => {
    setCreating(true)
    await wait(900)
    setLast4(String(Math.floor(1000 + Math.random() * 9000)))
    setCreating(false)
    setStep(3)
  }

  // Funding (or skipping it) completes the flow; ?simulate=fail fails the first attempt.
  const finish = async (amount: number) => {
    setFunding(true)
    await wait(900)
    setFunding(false)
    attempts.current += 1
    if (simulateFail && attempts.current === 1) return setResult({ kind: 'failed' })
    setResult(amount > 0 ? { kind: 'funded', amount } : { kind: 'created' })
  }

  const summaryRows = (
    <dl className="flex flex-col">
      <SummaryRow label="Cardholder name" value={draft.assignee?.name ?? dash} />
      <SummaryRow label="Card type" value="Virtual card" />
      <SummaryRow label="Nickname" value={nickname || dash} />
      <SummaryRow label="Spend purpose" value={purposeValue(draft.purpose)} />
      <SummaryRow label="Limit type" value={draft.limitType ?? dash} />
      <SummaryRow label="Spending cap" value={capValue > 0 ? formatUsd(capValue) : dash} />
    </dl>
  )

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-6 pb-16 pt-8">
        <div className="flex flex-col gap-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-sm text-[#555354]">
            <Link to="/cards" className="hover:text-text-primary">
              Cards
            </Link>
            <svg viewBox="0 0 16 16" className="size-4 text-[#6b7280]" aria-hidden="true">
              <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[#004b87]">{editing ? 'Edit card' : 'Create card'}</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">{editing ? 'Edit card' : 'Create card'}</h1>
            <button type="button" onClick={editing ? () => navigate('/cards') : exitToCards} className="text-sm font-medium text-[#4b5563] hover:text-[#111927]">
              Cancel
            </button>
          </div>
          <Stepper current={step} labels={editing ? ['Card details', 'Review'] : undefined} />
        </div>

        {/* 1 — Card details (48033:234139, 234449, 234758) */}
        {step === 1 && (
          <div className="grid w-full grid-cols-[minmax(300px,380px)_minmax(0,1fr)] items-start gap-8">
            <Panel className="sticky top-6 gap-6 p-6">
              <CardRender nickname={nickname} holder={holder} />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#9aa1ac]">Summary</p>
                {summaryRows}
              </div>
            </Panel>
            <Panel className="gap-6 p-8">
              <Heading title="Card Information" subtitle="Setup a card for seamless spending control" />
              <HdsSelect
                label="Assign to"
                placeholder="Select…"
                options={memberOptions}
                value={draft.assignee?.id ?? null}
                onChange={(id) => update({ assignee: allMembers.find((m) => m.id === id) ?? null })}
                helper="Select the team member that will use this card"
                menuMode="inline"
              />
              <HdsInput label="Card type" value="Virtual card" disabled readOnly />
              <HdsInput
                label="Card nickname"
                value={draft.nickname}
                maxLength={NICKNAME_MAX}
                onChange={(e) => update({ nickname: e.target.value })}
                placeholder="E.g. Marketing"
                helper={`Something descriptive, easy to recall and maximum number of ${NICKNAME_MAX} characters`}
              />
              <HdsSelect label="Spend purpose" placeholder="Select…" options={PURPOSE_OPTIONS} value={draft.purpose} onChange={(purpose) => update({ purpose })} menuMode="inline" />
              <HdsSelect
                label="Limit"
                placeholder="Select…"
                options={LIMIT_OPTIONS}
                value={draft.limitType}
                onChange={(v) => update({ limitType: v as LimitType })}
                helper="Choose how the spending cap is applied"
                menuMode="inline"
              />
              <KitAmountInput label="Limit amount" units={USD_UNITS} unit="USD" symbol="$" value={draft.cap} onChange={(v) => update({ cap: formatAmountInput(v) })} error={capError} />
              <div className="flex justify-end border-t border-[#eff2f4] pt-6">
                <HdsButton disabled={!detailsValid} onClick={() => setStep(2)}>
                  Continue
                </HdsButton>
              </div>
            </Panel>
          </div>
        )}

        {/* 2 — Review (48033:235066) */}
        {step === 2 && (
          <Panel className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-10 p-10">
            <div className="flex flex-col gap-4">
              <Heading title="Your Card" subtitle={editing ? 'Check your changes before you save them. Nothing is saved until you do.' : 'Check everything before you create it. Nothing is saved until you do.'} />
              <div className="flex items-center justify-center rounded-2xl bg-[#f5f6f8] px-8 py-12">
                <CardRender nickname={nickname} holder={holder} className="max-w-[372px]" />
              </div>
            </div>
            <div className="flex h-full flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Card details</p>
                  <HdsButton variant="link" onClick={() => setStep(1)}>
                    Edit
                  </HdsButton>
                </div>
                <dl>
                  <SummaryRow label="Assigned to" value={draft.assignee ? `${draft.assignee.name} · ${draft.assignee.role}` : dash} />
                  <SummaryRow label="Card type" value="Virtual card" />
                  <SummaryRow label="Nickname" value={nickname} />
                  <SummaryRow label="Spend purpose" value={purposeValue(draft.purpose)} />
                  <SummaryRow label="Limit type" value={draft.limitType} />
                  <SummaryRow label="Spending cap" value={formatUsd(capValue)} />
                </dl>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-[#eff2f4] pt-6">
                <HdsButton variant="secondary" onClick={() => setStep(1)} disabled={creating}>
                  Previous
                </HdsButton>
                {editing ? (
                  <HdsButton onClick={saveEdit} className="min-w-[132px]">
                    Save changes
                  </HdsButton>
                ) : (
                  <HdsButton onClick={createCard} loading={creating} className="min-w-[132px]">
                    {creating ? 'Creating…' : 'Create card'}
                  </HdsButton>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* 3 — Fund (48033:235372) */}
        {step === 3 && (
          <div className="grid w-full grid-cols-[minmax(300px,380px)_minmax(0,1fr)] items-start gap-8">
            <Panel className="gap-6 p-6">
              <CardRender nickname={nickname} holder={holder} last4={last4} />
              <dl>
                <SummaryRow label="Nickname" value={nickname} />
                <SummaryRow label="Limit" value={`${formatUsd(capValue)} · ${draft.limitType}`} />
                <SummaryRow label="Assigned to" value={draft.assignee?.name ?? 'General card'} />
                <SummaryRow label="Card balance" value={formatUsd(0)} />
              </dl>
            </Panel>
            <Panel className="gap-6 p-8">
              <Heading
                title="Fund card"
                subtitle="If unassigned, a general card accessible by all team members will be created"
                aside={
                  <HdsButton variant="link" onClick={() => finish(0)} disabled={funding}>
                    Skip
                  </HdsButton>
                }
              />
              <div className="flex flex-col gap-1 rounded-xl bg-[#f5f6f8] px-4 py-4">
                <p className="text-xs text-[#6b7280]">Collateral wallet balance</p>
                <p className="font-heading text-xl font-medium text-text-primary">{formatUsd(COLLATERAL_BALANCE)}</p>
              </div>
              <div className="flex flex-col gap-3">
                <KitAmountInput
                  label="Amount"
                  units={USD_UNITS}
                  unit="USD"
                  symbol="$"
                  value={fundAmount}
                  onChange={(v) => setFundAmount(formatAmountInput(v))}
                  helper="Moves funds from your collateral wallet to this card"
                  error={fundError}
                />
                <div className="flex gap-2">
                  {[0.25, 0.5, 1].map((fraction) => (
                    <button
                      key={fraction}
                      type="button"
                      onClick={() => setFundAmount(formatAmountInput((Math.floor(COLLATERAL_BALANCE * fraction * 100) / 100).toFixed(2)))}
                      className="rounded-full border border-[#cbd0d8] px-3 py-1 text-xs font-medium text-[#4b5563] transition-colors hover:border-[#111927] hover:text-[#111927]"
                    >
                      {fraction === 1 ? 'Max' : `${fraction * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end border-t border-[#eff2f4] pt-6">
                <HdsButton disabled={!fundValid} loading={funding} onClick={() => finish(fundValue)} className="min-w-[124px]">
                  {funding ? 'Funding…' : 'Fund card'}
                </HdsButton>
              </div>
            </Panel>
          </div>
        )}
      </main>

      {result && (
        <ResultModal
          result={result}
          nickname={nickname}
          holder={holder}
          last4={last4}
          onClose={() => (result.kind === 'failed' ? setResult(null) : exitToCards())}
          onViewCard={exitToCards}
          onCreateNew={restart}
          onTryAgain={() => {
            setResult(null)
            setStep(2)
          }}
        />
      )}
    </AppShell>
  )
}
