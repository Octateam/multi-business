import { useCallback, useEffect, useState, type ReactNode } from 'react'
import closeIcon from '../../assets/icons/accounts-create-close.svg'
import caretIcon from '../../assets/icons/accounts-create-caret.svg'
import backIcon from '../../assets/icons/accounts-back.svg'
import fundBankIcon from '../../assets/icons/accounts-fund-bank.svg'
import fundCryptoIcon from '../../assets/icons/accounts-fund-crypto.svg'
import infoIcon from '../../assets/icons/accounts-fund-info.svg'
import copyIcon from '../../assets/icons/accounts-fund-copy.svg'
import bulletIcon from '../../assets/icons/accounts-fund-bullet.svg'
import { BUSINESS_NAME } from './data'
import { Drawer } from './ui'
import { HdsButton, SearchGlyph } from '../../components/ui/hds'
import { useStepHistory } from '../../lib/navHistory'
import {
  fetchBankRoute,
  fetchBankRoutes,
  personalise,
  type BankRoute,
  type Fetched,
  type FundingAccount,
  type RouteSummary,
} from './funding'

// Fund account flow — Figma "Global USD Account Funding" (section 47642:395360):
// 02 choose method → 03 currency list (Popular / All, with search, 04) → 05 Deposit instruction.
// Crypto deposit is shown on the method step but doesn't open anything in this prototype.

// Circular flags (circle-flags, MIT) keyed by the `flag` code each funding route carries in the config.
const FLAG_URLS = import.meta.glob('../../assets/flags/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const flagSrc = (code: string) => FLAG_URLS[`../../assets/flags/${code}.svg`]

type Step = 'method' | 'bank' | 'bank-details'

// Loads data through the funding service each time `key` changes, with loading / error / retry states.
function useFetched<T>(load: (() => Promise<Fetched<T>>) | null, key: string) {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; result?: Fetched<T>; error?: string }>({ status: 'idle' })
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    if (!load) return setState({ status: 'idle' })
    let live = true
    setState({ status: 'loading' })
    load()
      .then((result) => live && setState({ status: 'ready', result }))
      .catch((e: Error) => live && setState({ status: 'error', error: e.message }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce])
  return { ...state, retry: () => setNonce((n) => n + 1) }
}

function MethodHeader({ onClose, currency }: { onClose: () => void; currency: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-[25.6px] font-medium leading-[26px] text-[#222121]">Fund account</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-md transition-opacity hover:opacity-80">
          <img src={closeIcon} alt="" className="size-6" />
        </button>
      </div>
      <p className="text-sm leading-5 text-[#555354]">Select your preferred method to add money to your {currency} account</p>
    </div>
  )
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="flex w-fit items-center gap-1 text-xs font-medium leading-4 text-[#555354] hover:text-[#111927]">
      <img src={backIcon} alt="" className="size-3" />
      Back
    </button>
  )
}

// Navigation option (Figma 47644:222779). Without onClick it renders as a static card: no hover, no action.
function NavOption({ icon, title, body, onClick }: { icon: ReactNode; title: string; body: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6]">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium leading-5 text-[#222121]">{title}</span>
        <span className="text-xs leading-4 text-[#555354]">{body}</span>
      </span>
      <img src={caretIcon} alt="" className="size-4 transition-transform group-hover:translate-x-0.5" />
    </>
  )
  const base = 'flex h-[84px] w-full items-center gap-3 rounded-lg border border-[#d6d6d6] p-4 text-left'
  if (!onClick) return <div className={base}>{content}</div>
  return (
    <button type="button" onClick={onClick} className={`group ${base} transition-colors hover:border-[#004b87] hover:bg-[#f8fbfe]`}>
      {content}
    </button>
  )
}

function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading the latest funding details" role="status">
      <p className="flex items-center gap-2 text-xs text-[#70707d]">
        <span className="size-3 animate-spin rounded-full border-2 border-[#004b87]/20 border-t-[#004b87]" />
        Getting the latest details…
      </p>
      {Array.from({ length: rows }).map((_, i) => (
        <span key={i} className="h-[52px] animate-pulse rounded-lg bg-[#f5f6f8]" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg bg-[#fdf0f1] p-4">
      <p className="text-sm font-medium text-[#8b1d26]">We couldn’t load the funding details</p>
      <p className="text-xs text-[#8b1d26]/80">{message ?? 'Please try again.'}</p>
      <HdsButton variant="primary" size="sm" onClick={onRetry}>
        Try again
      </HdsButton>
    </div>
  )
}

function useCopied() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(key)
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400)
  }
  return [copied, copy] as const
}

const Check = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

// Fund account / Currency row (Figma 47644:227410): hover / focus = navy outline on a tint fill.
function CurrencyRow({ route, onSelect }: { route: RouteSummary; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex h-14 w-full shrink-0 items-center gap-4 border border-transparent border-b-[#eef0f3] px-2 py-2.5 text-left transition-colors hover:rounded-lg hover:border-[#004b87] hover:bg-[#f3f8fc] focus-visible:rounded-lg focus-visible:border-[#004b87] focus-visible:bg-[#f3f8fc] focus-visible:outline-none"
    >
      <img src={flagSrc(route.flag)} alt="" className="size-9 shrink-0 rounded-full" />
      <span className="w-14 shrink-0 text-sm font-semibold text-[#111927]">{route.currency}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-[#4b5563]">{route.name}</span>
      <img src={caretIcon} alt="" className="size-4 shrink-0" />
    </button>
  )
}

// 03 / 04 · Bank transfer — select or search the currency the customer will send.
function CurrencySearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-12 w-full shrink-0 cursor-text items-center gap-3 rounded-xl border border-[#eceef1] bg-[#f5f6f8] px-4 transition-colors focus-within:border-[#004b87] focus-within:bg-white">
      <SearchGlyph className="size-4 shrink-0 text-[#6b7280]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by currency, code or country"
        aria-label="Search currencies"
        className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
      />
    </label>
  )
}

function CurrencyList({ popular, all, query, onSelect }: { popular: RouteSummary[]; all: RouteSummary[]; query: string; onSelect: (id: string) => void }) {
  const q = query.trim().toLowerCase()
  const match = (r: RouteSummary) => !q || [r.currency, r.name, r.country].some((v) => v.toLowerCase().includes(q))
  const groups = [
    { title: 'Popular currencies', items: popular.filter(match) },
    { title: 'All currencies', items: all.filter(match) },
  ].filter((g) => g.items.length > 0)

  return (
    <>
      {groups.length === 0 ? (
        <div className="flex flex-col gap-1 py-2">
          <p className="text-sm font-medium text-[#111927]">No results found</p>
          <p className="text-xs text-[#6b7280]">Try a different currency, code or country</p>
        </div>
      ) : (
        groups.map((g, i) => (
          <div key={g.title} className={`flex w-full flex-col gap-1 ${i > 0 ? 'pt-5' : ''}`}>
            <p className="text-[13px] font-semibold text-[#111927]">{g.title}</p>
            {g.items.map((r) => (
              <CurrencyRow key={r.id} route={r} onSelect={() => onSelect(r.id)} />
            ))}
          </div>
        ))
      )}
    </>
  )
}

function formatUpdated(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date}, ${time}`
}

// 05 · Deposit instruction (Figma 47827:385399): hero, alert, definition list, last updated, Copy details,
// Deposit instructions. Every value comes from the funding configuration.
function BankDetails({ result, account, fill, onBack }: { result: Fetched<BankRoute>; account: FundingAccount; fill: (text: string) => string; onBack: () => void }) {
  const [copied, copy] = useCopied()
  const route = result.data
  const t = (text: string) => fill(text).replace(/\{currencyName\}/g, route.plural).replace(/\{currency\}/g, route.currency).replace(/\{target\}/g, account.currency)
  const fields = route.fields.map((f) => ({ ...f, value: t(f.value) }))
  const all = fields.map((f) => `${f.label}: ${f.value}`).join('\n')
  const accountKind = account.usdType === 'global' ? 'Global USD account' : `${account.currency} account`

  return (
    <div className="flex animate-[fadeIn_220ms_ease-out] flex-col gap-6">
      <BackLink onBack={onBack} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#222121]">Deposit instruction</h2>
          <p className="text-sm leading-5 text-[#555354]">
            Use the details below to fund your {accountKind} with {route.plural.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-5">
          <img src={flagSrc(route.flag)} alt="" className="size-16 shrink-0 rounded-full shadow-[0_3.5px_6px_rgba(16,24,40,0.18)]" />
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-medium leading-6 tracking-[-0.08px] text-[#111927]">Fund with {route.plural}</p>
            <p className="text-[15px] text-[#4b5563]">
              {route.currency} → {account.currency}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[10px] bg-[#eaf2f9] py-4 pl-4 pr-3.5">
          <span className="flex size-[18px] shrink-0 items-center justify-center">
            <img src={infoIcon} alt="" className="size-[16.125px]" />
          </span>
          <p className="text-xs leading-5 text-[#4b5563]">{t(route.summary)}</p>
        </div>

        <dl className="flex flex-col rounded-[14px] border border-[#e1e4ea] bg-white px-4">
          {fields.map((f) => (
            <div key={f.label} className="flex min-h-[66px] items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 flex-col">
                <dt className="font-heading text-xs leading-[14px] text-[#555352]">{f.label}</dt>
                <dd className="break-words pt-[3px] font-heading text-sm font-medium leading-5 text-[#222121]">{f.value}</dd>
              </div>
              <button
                type="button"
                onClick={() => copy(f.label, f.value)}
                aria-label={`Copy ${f.label.toLowerCase()}`}
                title={copied === f.label ? 'Copied' : `Copy ${f.label.toLowerCase()}`}
                className={`flex size-8 shrink-0 items-center justify-center rounded-md transition-colors ${copied === f.label ? 'text-[#077155]' : 'hover:bg-[#f2f4f7]'}`}
              >
                {copied === f.label ? <Check /> : <img src={copyIcon} alt="" className="size-[14.33px]" />}
              </button>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-xs leading-[14px] text-[#555352]">
        <span className="text-[11px] font-medium leading-4">Details last updated at</span>: {formatUpdated(result.updatedAt)}. v{result.version}
      </p>

      <HdsButton
        variant="primary"
        fullWidth
        onClick={() => copy('__all', all)}
        leadingIcon={copied === '__all' ? <Check /> : undefined}
        className={copied === '__all' ? '!bg-[#077155]' : undefined}
      >
        {copied === '__all' ? 'Details copied' : 'Copy details'}
      </HdsButton>

      <div className="flex flex-col rounded-xl bg-[#f6f6f6] p-4">
        <h3 className="font-heading text-sm font-semibold leading-5 text-[#222121]">Deposit instructions</h3>
        <ul className="flex flex-col gap-2 pt-2.5">
          {route.instructions.map((text, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="relative h-5 w-2.5 shrink-0">
                <img src={bulletIcon} alt="" className="absolute left-0.5 top-2 size-1" />
              </span>
              <span className="pt-0.5 font-heading text-xs leading-[14px] text-[#555352]">{t(text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function FundAccountDrawer({ account, open, onClose }: { account: FundingAccount | null; open: boolean; onClose: () => void }) {
  // Step history: Back returns to the step the user came from.
  const history = useStepHistory<Step>('method')
  const { step, reset, replace } = history
  const [routeId, setRouteId] = useState<string | null>(null)
  const [visit, setVisit] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    reset('method')
    setRouteId(null)
    setQuery('')
  }, [open, reset])

  const go = (next: Step) => {
    history.go(next)
    setVisit((v) => v + 1) // every visit re-requests the latest configuration
  }
  const back = () => {
    if (history.back()) setVisit((v) => v + 1)
    else onClose()
  }

  // The currency list, and then the selected currency's details, are both requested fresh from the
  // funding configuration — the details again every time a currency is (re)selected.
  const routes = useFetched<{ popular: RouteSummary[]; all: RouteSummary[] }>(
    account && step === 'bank' ? () => fetchBankRoutes(account) : null,
    `routes-${account?.id}-${step}-${visit}`,
  )
  const route = useFetched<BankRoute>(routeId && step === 'bank-details' ? () => fetchBankRoute(routeId) : null, `route-${routeId}-${visit}`)

  // A local account has a single funding route, so it skips the currency list and opens its details.
  useEffect(() => {
    if (step !== 'bank' || routes.status !== 'ready' || !routes.result) return
    const { popular, all } = routes.result.data
    if (popular.length + all.length === 1) {
      setRouteId([...popular, ...all][0].id)
      replace('bank-details')
    }
  }, [step, routes.status, routes.result, replace])

  const p = useCallback((text: string) => (account ? personalise(text, account, BUSINESS_NAME) : text), [account])

  if (!account) return null

  return (
    <Drawer open={open} onClose={onClose}>
      {step === 'method' && (
        <div key="method" className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-10 px-6 py-[42px]">
          <MethodHeader onClose={onClose} currency={account.currency} />
          <div className="flex flex-col gap-4">
            <NavOption
              icon={<img src={fundBankIcon} alt="" className="size-4" />}
              title="Bank transfer"
              body="Fund your account via ACH or wire transfer"
              onClick={() => go('bank')}
            />
            {/* Crypto deposit isn't available in this prototype, so the option doesn't open anything. */}
            <NavOption icon={<img src={fundCryptoIcon} alt="" className="size-4" />} title="Crypto deposit" body="Deposit funds into your account using stablecoins" />
          </div>
        </div>
      )}

      {step === 'bank' && (
        <div key="bank" className="flex animate-[fadeIn_200ms_ease-out] flex-col pb-[42px]">
          {/* Back, title and search stay pinned while the currency list scrolls behind them. */}
          <div className="sticky top-0 z-10 flex flex-col gap-6 bg-white px-6 pb-6 pt-[34px]">
            <BackLink onBack={back} />
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[25.65px] font-medium text-[#222121]">Fund account</h2>
              <p className="text-sm text-[#555354]">Select the currency you’ll be sending.</p>
            </div>
            <CurrencySearch value={query} onChange={setQuery} />
          </div>
          <div className="flex flex-col gap-6 px-6">
            {routes.status === 'loading' || routes.status === 'idle' ? (
              <Skeleton rows={5} />
            ) : routes.status === 'error' ? (
              <ErrorState message={routes.error} onRetry={routes.retry} />
            ) : (
              <CurrencyList
                popular={routes.result!.data.popular}
                all={routes.result!.data.all}
                query={query}
                onSelect={(id) => {
                  setRouteId(id)
                  go('bank-details')
                }}
              />
            )}
          </div>
        </div>
      )}

      {step === 'bank-details' && (
        <div key="bank-details" className="flex animate-[fadeIn_200ms_ease-out] flex-col px-6 py-[42px]">
          {route.status === 'ready' && route.result ? (
            <BankDetails key={routeId} result={route.result} account={account} fill={p} onBack={back} />
          ) : (
            <div className="flex flex-col gap-6">
              <BackLink onBack={back} />
              {route.status === 'error' ? <ErrorState message={route.error} onRetry={route.retry} /> : <Skeleton rows={6} />}
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
