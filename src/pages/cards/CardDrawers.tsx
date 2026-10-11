import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from '../accounts/ui'
import { HdsButton, HdsSearch, HdsSelect } from '../../components/ui/hds'
import { CardRender } from './create/parts'
import { getCard, usd, useCardStore, type Card } from './cardStore'

// View card (Figma 48062:251993): "View detail" opens the card drawer — balance, card, View card details,
// spending limit, card info and Manage card. Inside the same drawer: Card details (full number / CVV),
// Card transactions (grouped by day) and Transaction details. Freeze / Unfreeze (48062:251994) and
// Cancel card are confirmed in a modal; Re-assign and Edit hand off to their own pages.

export type CardAction = 'freeze' | 'unfreeze' | 'reassign' | 'edit' | 'cancel'

/* ------------------------------------------------------------------ */
/*  Sample card transactions (48062:239960)                            */
/* ------------------------------------------------------------------ */

type Txn = { id: string; merchant: string; time: string; day: string; amount: number; category: string; kind: string; logo: { bg: string; fg: string; text: string } }

const TXNS: Txn[] = [
  { id: 'TXN-8F9D2K4L', merchant: 'Amazon', time: '10:24 AM', day: 'Today, 11 Sep 2026', amount: 120, category: 'Shopping', kind: 'Card purchase', logo: { bg: '#f5f6f8', fg: '#111927', text: 'a' } },
  { id: 'TXN-2S7K9P1M', merchant: 'Spotify', time: '08:15 AM', day: 'Today, 11 Sep 2026', amount: 9.99, category: 'Entertainment', kind: 'Subscription', logo: { bg: '#1ed760', fg: '#ffffff', text: '♫' } },
  { id: 'TXN-5U3B8R2Q', merchant: 'Uber', time: '07:32 AM', day: 'Today, 11 Sep 2026', amount: 18.5, category: 'Transport', kind: 'Card purchase', logo: { bg: '#000000', fg: '#ffffff', text: 'Uber' } },
  { id: 'TXN-4G6A1D9W', merchant: 'Google Ads', time: '11:20 PM', day: 'Yesterday, 10 Sep 2026', amount: 250, category: 'Advertising', kind: 'Card purchase', logo: { bg: '#e8f0fe', fg: '#1a73e8', text: 'G' } },
  { id: 'TXN-9N2O4T7E', merchant: 'Notion', time: '03:14 PM', day: 'Yesterday, 10 Sep 2026', amount: 12, category: 'Software', kind: 'Subscription', logo: { bg: '#ffffff', fg: '#111927', text: 'N' } },
  { id: 'TXN-1S8B3U5C', merchant: 'Starbucks', time: '09:42 AM', day: 'Yesterday, 10 Sep 2026', amount: 6.75, category: 'Food & Dining', kind: 'Card purchase', logo: { bg: '#00704a', fg: '#ffffff', text: '★' } },
  { id: 'TXN-3M7E2T6A', merchant: 'Meta Ads', time: '02:18 PM', day: '9 Sep 2026', amount: 300, category: 'Advertising', kind: 'Card purchase', logo: { bg: '#0866ff', fg: '#ffffff', text: '∞' } },
  { id: 'TXN-6S1L4A8K', merchant: 'Slack', time: '11:05 AM', day: '9 Sep 2026', amount: 15, category: 'Software', kind: 'Subscription', logo: { bg: '#4a154b', fg: '#ffffff', text: '#' } },
  { id: 'TXN-7A2P5L3E', merchant: 'Apple', time: '08:11 AM', day: '9 Sep 2026', amount: 99, category: 'Electronics', kind: 'Card purchase', logo: { bg: '#f5f6f8', fg: '#111927', text: '' } },
  { id: 'TXN-8M4S9F1T', merchant: 'Microsoft', time: '04:27 PM', day: '8 Sep 2026', amount: 22, category: 'Software', kind: 'Subscription', logo: { bg: '#f5f6f8', fg: '#737373', text: '⊞' } },
  { id: 'TXN-2N6F8X4L', merchant: 'Netflix', time: '01:16 PM', day: '8 Sep 2026', amount: 15.99, category: 'Entertainment', kind: 'Subscription', logo: { bg: '#000000', fg: '#e50914', text: 'N' } },
]

const MerchantLogo = ({ logo, size = 32 }: { logo: Txn['logo']; size?: number }) => (
  <span className="flex shrink-0 items-center justify-center rounded-full border border-[#edeff2] font-semibold" style={{ width: size, height: size, background: logo.bg, color: logo.fg, fontSize: size * (logo.text.length > 2 ? 0.28 : 0.42) }}>
    {logo.text}
  </span>
)

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

const XBox = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-[#9aa1ac] text-white transition-colors hover:bg-[#6b7280]">
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </button>
)

const BackLink = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex w-fit items-center gap-1 text-xs font-medium text-[#555354] hover:text-[#111927]">
    <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
      <path d="M10 4L6 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    Back
  </button>
)

const CopyIcon = ({ value, label }: { value: string; label: string }) => {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {})
        setDone(true)
        window.setTimeout(() => setDone(false), 1200)
      }}
      className="shrink-0 text-[#6b7280] transition-colors hover:text-[#111927]"
    >
      {done ? (
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
  )
}

const MANAGE_ICONS: Record<string, string> = {
  freeze: 'M8 1.5v13M2.4 4.7l11.2 6.6M13.6 4.7 2.4 11.3M6 2.5 8 4l2-1.5M6 13.5 8 12l2 1.5',
  transactions: 'M2 4.5h12v7H2zM2 7h12M4 9.5h2.5',
  reassign: 'M3 6h9l-2.5-2.5M13 10H4l2.5 2.5',
  edit: 'M10.5 2.5l3 3L6 13H3v-3l7.5-7.5Z',
  cancel: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6 6l4 4M10 6l-4 4',
}

function ManageRow({ icon, title, subtitle, onClick }: { icon: string; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 border-b border-[#f2f4f7] px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f8f9fa]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] text-[#111927]">
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={MANAGE_ICONS[icon]} />
        </svg>
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-[#111927]">{title}</span>
        <span className="text-xs text-[#6b7280]">{subtitle}</span>
      </span>
      <svg viewBox="0 0 16 16" className="size-4 text-[#6b7280]" aria-hidden="true">
        <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="grid grid-cols-[150px_1fr] border-b border-[#f2f4f7] px-4 py-3 text-sm last:border-b-0">
    <span className="text-[#6b7280]">{label}</span>
    <span className="font-semibold text-[#111927]">{value}</span>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Card drawer                                                        */
/* ------------------------------------------------------------------ */

type View = 'card' | 'details' | 'transactions' | 'transaction'

export function CardDrawer({ cardId, onClose, onAction }: { cardId: string | null; onClose: () => void; onAction: (action: CardAction, card: Card) => void }) {
  useCardStore()
  const card = getCard(cardId)
  const [view, setView] = useState<View>('card')
  const [txn, setTxn] = useState<Txn | null>(null)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [range, setRange] = useState('all')
  useEffect(() => {
    if (cardId) {
      setView('card')
      setQuery('')
      setKind('all')
      setRange('all')
    }
  }, [cardId])

  const txns = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TXNS.filter((t) => (!q || t.merchant.toLowerCase().includes(q)) && (kind === 'all' || t.kind === kind) && (range === 'all' || (range === 'today' ? t.day.startsWith('Today') : !t.day.startsWith('8'))))
  }, [query, kind, range])
  const days = [...new Set(txns.map((t) => t.day))]

  const open = Boolean(card)
  const frozen = card?.status === 'frozen'
  const used = card ? Math.min(100, Math.round((card.spent / card.cap) * 100)) : 0
  const per = card?.limitType === 'Monthly' ? ' / month' : card?.limitType === 'Daily' ? ' / day' : ' total'

  return (
    <Drawer open={open} onClose={onClose}>
      {card && view === 'card' && (
        <div className="flex flex-col gap-4 px-6 pb-8 pt-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-[#6b7280]">Available balance</p>
            <p className="font-heading text-2xl font-semibold text-[#111927]">{usd(card.balance)}</p>
          </div>
          <CardRender nickname={card.nickname} holder={card.assignee} last4={card.last4} face="number" frozen={frozen} />
          <HdsButton fullWidth onClick={() => setView('details')}>
            View card details
          </HdsButton>
          <div className="flex flex-col gap-2 rounded-xl border border-[#edeff2] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#111927]">Spending limit</span>
              <span className="text-[#111927]">
                {usd(card.cap)}
                {per}
              </span>
            </div>
            <span className="h-2 overflow-hidden rounded-full bg-[#edeff2]">
              <span className="block h-full rounded-full bg-[#1a73e8]" style={{ width: `${used}%` }} />
            </span>
            <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
              <span>
                {usd(card.spent)} spent • {usd(Math.max(0, card.cap - card.spent))} remaining
              </span>
              <span>{used}% used</span>
            </div>
          </div>
          <div className="flex flex-col rounded-xl border border-[#edeff2]">
            <InfoRow label="Assigned to" value={card.assignee} />
            <InfoRow label="Card type" value={`${card.type} card`} />
            <InfoRow label="Card nickname" value={card.nickname} />
            <InfoRow label="Purpose" value={card.purpose} />
            <InfoRow label="Network" value="VISA" />
          </div>
          {card.status !== 'deleted' && (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Manage card</p>
              <div className="flex flex-col overflow-hidden rounded-xl border border-[#edeff2]">
                {frozen ? (
                  <ManageRow icon="freeze" title="Unfreeze card" subtitle="Resume spending on this card" onClick={() => onAction('unfreeze', card)} />
                ) : (
                  <ManageRow icon="freeze" title="Freeze card" subtitle="Stop spending on this card for now" onClick={() => onAction('freeze', card)} />
                )}
                <ManageRow icon="transactions" title="Card transactions" subtitle="See everything spent on this card" onClick={() => setView('transactions')} />
                <ManageRow icon="reassign" title="Re-assign card" subtitle="Move this card to another team member" onClick={() => onAction('reassign', card)} />
                <ManageRow icon="edit" title="Edit card info" subtitle="Update limit, purpose, and nickname" onClick={() => onAction('edit', card)} />
                <ManageRow icon="cancel" title="Cancel card" subtitle="Close this card permanently" onClick={() => onAction('cancel', card)} />
              </div>
            </div>
          )}
        </div>
      )}

      {card && view === 'details' && (
        <div className="flex flex-col gap-5 px-6 pb-8 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Card details</h2>
              <p className="text-sm text-[#555354]">Keep these numbers private — anyone with them can spend from this card.</p>
            </div>
            <XBox onClick={() => setView('card')} />
          </div>
          {[
            ['Cardholder name', card.assignee],
            ['Card number', card.number],
            ['Expiry date', card.expiry],
            ['CVC/CVV', card.cvv],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between gap-3 rounded-lg bg-[#edeff2] px-3.5 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-[11px] text-[#4b5563]">{l}</p>
                <p className="text-sm font-medium text-[#111927]">{v}</p>
              </div>
              <CopyIcon value={v} label={l.toLowerCase()} />
            </div>
          ))}
          <p className="pt-1 text-sm font-medium text-[#111927]">Billing address</p>
          <div className="flex items-start justify-between gap-3 rounded-lg bg-[#edeff2] px-3.5 py-3">
            <p className="text-sm leading-5 text-[#111927]">
              201 Allen St
              <br />
              New York, New York, 10002
              <br />
              US
            </p>
            <CopyIcon value="201 Allen St, New York, New York, 10002, US" label="billing address" />
          </div>
        </div>
      )}

      {card && view === 'transactions' && (
        <div className="flex flex-col gap-4 px-6 pb-8 pt-6">
          <BackLink onClick={() => setView('card')} />
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-lg font-semibold text-[#111927]">Card transactions</h2>
            <p className="text-xs text-[#6b7280]">All transactions on this card</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#edeff2] p-2.5">
            <div className="w-[110px] shrink-0">
              <CardRender nickname={card.nickname} holder={card.assignee} last4={card.last4} face="number" frozen={frozen} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-[#111927]">{card.nickname}</p>
              <p className="text-xs text-[#6b7280]">{card.type} card • VISA</p>
              <p className="text-xs text-[#6b7280]">**** **** **** {card.last4}</p>
            </div>
          </div>
          <HdsSearch value={query} onChange={setQuery} placeholder="Search transactions" />
          <div className="flex gap-2">
            <div className="w-[170px]">
              <HdsSelect size="sm" value={kind} onChange={setKind} options={[{ value: 'all', label: 'All transactions' }, { value: 'Card purchase', label: 'Card purchases' }, { value: 'Subscription', label: 'Subscriptions' }]} />
            </div>
            <div className="w-[140px]">
              <HdsSelect size="sm" value={range} onChange={setRange} options={[{ value: 'all', label: 'Date' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'Last 3 days' }]} />
            </div>
          </div>
          <div className="flex flex-col">
            {days.map((d) => (
              <div key={d} className="flex flex-col">
                <p className="bg-[#f5f6f8] px-3 py-1.5 text-xs text-[#4b5563]">{d}</p>
                {txns
                  .filter((t) => t.day === d)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTxn(t)
                        setView('transaction')
                      }}
                      className="flex items-center gap-3 border-b border-[#f2f4f7] px-3 py-2.5 text-left transition-colors hover:bg-[#f8f9fa]"
                    >
                      <MerchantLogo logo={t.logo} />
                      <span className="flex flex-1 flex-col">
                        <span className="text-sm text-[#111927]">{t.merchant}</span>
                        <span className="text-[11px] text-[#6b7280]">{t.time}</span>
                      </span>
                      <span className="flex flex-col items-end">
                        <span className="text-sm font-medium text-[#111927]">-{usd(t.amount)}</span>
                        <span className="flex items-center gap-1 text-xs text-[#077155]">
                          <span className="size-1.5 rounded-full bg-[#0e9e74]" />
                          Completed
                        </span>
                      </span>
                    </button>
                  ))}
              </div>
            ))}
            {txns.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">No transactions match your search.</p>}
          </div>
        </div>
      )}

      {card && view === 'transaction' && txn && (
        <div className="flex flex-col gap-5 px-6 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Transaction details</h2>
            <XBox onClick={() => setView('transactions')} />
          </div>
          <div className="flex flex-col items-center gap-2 border-b border-[#edeff2] pb-6">
            <MerchantLogo logo={txn.logo} size={72} />
            <p className="mt-1 text-lg font-medium text-[#111927]">{txn.merchant}</p>
            <p className="font-heading text-[34px] font-semibold text-[#111927]">-{usd(txn.amount)}</p>
            <p className="flex items-center gap-1 text-xs text-[#077155]">
              <span className="size-1.5 rounded-full bg-[#0e9e74]" />
              Completed
            </p>
            <p className="text-sm text-[#4b5563]">
              {txn.day.replace(/^(Today|Yesterday), /, '')}, {txn.time}
            </p>
          </div>
          <div className="flex flex-col gap-3 border-b border-[#edeff2] pb-5 text-sm">
            {[
              ['Card', `${card.nickname} (•••• ${card.last4})`],
              ['Cardholder', card.assignee],
              ['Category', txn.category],
              ['Transaction type', txn.kind],
              ['Amount', usd(txn.amount)],
              ['Fee', usd(0)],
              ['Total', usd(txn.amount)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-[#4b5563]">{l}</span>
                <span className="text-[#111927]">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#4b5563]">Transaction ID</span>
            <span className="flex items-center gap-2 text-[#111927]">
              {txn.id}
              <CopyIcon value={txn.id} label="transaction ID" />
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-xl bg-[#f5f6f8] p-4">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#cbd0d8] bg-white text-lg font-semibold text-[#111927]">?</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-[#111927]">Need help with this transaction?</p>
                <p className="text-xs text-[#4b5563]">If you didn&rsquo;t make this payment or have an issue, you can report it.</p>
              </div>
            </div>
            <button type="button" className="h-11 rounded-lg border border-[#1a5fd0] bg-white text-sm font-semibold text-[#1a5fd0] transition-colors hover:bg-[#f0f5ff]">
              Report an issue
            </button>
          </div>
        </div>
      )}
    </Drawer>
  )
}

/* ------------------------------------------------------------------ */
/*  Confirmation modal (Freeze / Unfreeze / Cancel)                    */
/* ------------------------------------------------------------------ */

const CONFIRM_COPY = {
  freeze: { title: 'Freeze this card?', body: 'This card will be temporarily unavailable for new purchases until it is unfrozen.', cta: 'Freeze card', tone: 'blue' },
  unfreeze: { title: 'Unfreeze this card?', body: 'This card will become active again and can be used for new purchases, subject to its spending limit and available business balance.', cta: 'Unfreeze card', tone: 'blue' },
  cancel: { title: 'Cancel this card?', body: 'This card will be closed permanently and can’t be used again. Any remaining balance returns to your card account.', cta: 'Cancel card', tone: 'red' },
} as const

export function ConfirmCardModal({ action, onClose, onConfirm }: { action: 'freeze' | 'unfreeze' | 'cancel'; onClose: () => void; onConfirm: () => void }) {
  const c = CONFIRM_COPY[action]
  const gradient = c.tone === 'red' ? 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(190,30,45) 35%, rgb(240,190,195) 100%)' : 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(0,100,170) 30%, rgb(160,200,225) 100%)'
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,11,17,0.55)] px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={c.title} onClick={(e) => e.stopPropagation()} className="relative flex w-[483px] max-w-full animate-[popIn_180ms_ease-out] flex-col overflow-hidden rounded-[31px] bg-white">
        <div className="relative h-[330px]" style={{ backgroundImage: gradient }}>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-7 top-7 flex size-6 items-center justify-center rounded-full bg-white text-[#111927]">
            <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#1f2937] text-sm font-bold text-white">{c.tone === 'red' ? '!' : 'i'}</span>
          </span>
        </div>
        <div className="flex flex-col gap-7 p-8">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-[30px] font-semibold tracking-tight text-[#111927]">{c.title}</p>
            <p className="text-base text-[#4b5563]">{c.body}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <HdsButton variant="secondary" size="lg" fullWidth onClick={onClose}>
              Cancel
            </HdsButton>
            <HdsButton variant={c.tone === 'red' ? 'destructive' : 'primary'} size="lg" fullWidth onClick={onConfirm}>
              {c.cta}
            </HdsButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/*  Green confirmation notice (48062:241568 / 241872 / 242176)         */
/* ------------------------------------------------------------------ */

export function CardNotice({ title, body, onClose }: { title: string; body: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(t)
  }, [title, body, onClose])
  return (
    <div role="status" className="fixed right-10 top-20 z-50 flex w-[400px] animate-[popIn_140ms_ease-out] items-start gap-3 rounded-[10px] border-[0.5px] border-[#0e9e74] bg-[#e6f7f1] py-4 pl-4 pr-3.5 shadow-sm">
      <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#0e9e74] text-white">
        <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
          <path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-[#077155]">{title}</p>
        <p className="text-xs text-[#4b5563]">{body}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-[#0e9e74] hover:opacity-70">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
