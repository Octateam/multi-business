import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { Drawer } from '../accounts/ui'
import { HdsActionMenu, HdsBadge, HdsButton, HdsSearch, type BadgeColor } from '../../components/ui/hds'
import { getCard, usd, useCardStore } from './cardStore'
import filterIcon from '../../assets/icons/cards-filter.svg'

// Card transactions (Figma 48062:243448) with the Transaction details drawer (48062:244809).

type Kind = 'Card purchase' | 'Card account funding' | 'Refund'
type Txn = { ref: string; date: string; party: string; logo: string; logoBg: string; kind: Kind; direction: 'Debit' | 'Credit'; channel: string; category: string; amount: number }

const TXNS: Txn[] = [
  { ref: 'TRXN8F7A2L3', date: 'Sep 28, 2026, 2:14 AM', party: 'Amazon', logo: 'a', logoBg: '#111927', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Shopping', amount: 42.5 },
  { ref: 'TRXNB1K9D4Q', date: 'Sep 28, 2026, 12:11 AM', party: 'Uber Eats', logo: 'UE', logoBg: '#111927', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Food & Dining', amount: 18.2 },
  { ref: 'TRXNC7P3M8V', date: 'Sep 27, 2026, 10:32 PM', party: 'Emirates', logo: '✈', logoBg: '#d71921', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Travel', amount: 320 },
  { ref: 'TRXN4Z9K0D1', date: 'Sep 27, 2026, 7:21 PM', party: 'Walmart', logo: '✷', logoBg: '#0071ce', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Shopping', amount: 76.15 },
  { ref: 'TRXN6M2J8V0', date: 'Sep 27, 2026, 4:02 PM', party: 'Spotify', logo: '♫', logoBg: '#1ed760', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Entertainment', amount: 9.99 },
  { ref: 'TRXN5Q1D7P9', date: 'Sep 26, 2026, 1:45 PM', party: 'Hinstantt Checking •••• 4367', logo: 'H', logoBg: '#111927', kind: 'Card account funding', direction: 'Credit', channel: 'Internal transfer', category: 'Transfer', amount: 1000 },
  { ref: 'TRXN3K9F1A6', date: 'Sep 26, 2026, 11:18 AM', party: 'Apple', logo: '', logoBg: '#111927', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Electronics', amount: 199 },
  { ref: 'TRXN0L7H4C2', date: 'Sep 25, 2026, 9:04 PM', party: 'Netflix', logo: 'N', logoBg: '#111927', kind: 'Refund', direction: 'Credit', channel: 'Card', category: 'Entertainment', amount: 15.99 },
  { ref: 'TRXN9P5R8T3', date: 'Sep 25, 2026, 6:37 PM', party: 'Bolt', logo: 'Bolt', logoBg: '#34d186', kind: 'Card purchase', direction: 'Debit', channel: 'Card', category: 'Transport', amount: 12.4 },
  { ref: 'TRXN2D6V9J8', date: 'Sep 25, 2026, 3:21 PM', party: 'Hinstantt Checking •••• 4367', logo: 'H', logoBg: '#111927', kind: 'Card account funding', direction: 'Credit', channel: 'Internal transfer', category: 'Transfer', amount: 500 },
]

const KIND_COLOR: Record<Kind, BadgeColor> = { 'Card purchase': 'info', 'Card account funding': 'green', Refund: 'navy' }

const Logo = ({ t, size = 24 }: { t: Txn; size?: number }) => (
  <span className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: t.logoBg, fontSize: size * (t.logo.length > 2 ? 0.3 : 0.42) }}>
    {t.logo}
  </span>
)

export default function CardTransactions() {
  const location = useLocation()
  useCardStore()
  const card = getCard(new URLSearchParams(location.search).get('card'))
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Txn | null>(null)
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TXNS.filter((t) => !q || t.ref.toLowerCase().includes(q) || t.party.toLowerCase().includes(q))
  }, [query])

  const exportCsv = () => {
    const text = ['Reference,Date,Parties,Type,Direction,Channel,Category,Amount,Status', ...rows.map((t) => [t.ref, `"${t.date}"`, `"${t.party}"`, t.kind, t.direction, t.channel, t.category, t.amount, 'Successful'].join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'card-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-6 pb-16 pt-8">
        <nav className="flex items-center gap-3 text-sm" aria-label="Breadcrumb">
          <Link to="/cards" className="text-[#70707d] hover:text-[#111927]">
            Cards
          </Link>
          <span className="text-[#70707d]">›</span>
          <Link to={card ? `/cards/account?card=${card.id}` : '/cards/account'} className="text-[#70707d] hover:text-[#111927]">
            {card ? card.nickname : 'Card account'}
          </Link>
          <span className="text-[#70707d]">›</span>
          <span className="font-medium text-[#004b87]">Card transactions</span>
        </nav>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Transactions</h1>
            <p className="text-base text-[#70707d]">Manage your card account transactions in one place</p>
          </div>
          <HdsButton variant="ghost" size="sm" onClick={exportCsv} leadingIcon={<span className="text-sm leading-none">↗</span>}>
            Export
          </HdsButton>
        </div>
        <div className="flex items-center gap-3">
          <HdsSearch value={query} onChange={setQuery} placeholder="Search by reference ID" className="w-[300px]" />
          <HdsButton variant="ghost" size="sm" leadingIcon={<img src={filterIcon} alt="" className="size-[14px]" />}>
            Filter
          </HdsButton>
        </div>
        <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr className="text-[#525866]">
              {['Reference', 'Date', 'Parties', 'Type', 'Direction', 'Channel', 'Category', 'Amount', 'Status', ''].map((h, i, all) => (
                <th key={i} className={`bg-[#efefef] px-1.5 py-2 font-medium ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.ref} onClick={() => setOpen(t)} className="cursor-pointer font-medium text-[#0e121b] transition-colors hover:bg-[#f8f9fa]">
                <td className="h-12 border-b border-[#efefef] px-1.5">{t.ref}</td>
                <td className="whitespace-nowrap border-b border-[#efefef] px-1.5">{t.date}</td>
                <td className="border-b border-[#efefef] px-1.5">
                  <span className="flex items-center gap-2">
                    <Logo t={t} />
                    <span className="max-w-[110px] truncate">{t.party}</span>
                  </span>
                </td>
                <td className="border-b border-[#efefef] px-1.5">
                  <HdsBadge color={KIND_COLOR[t.kind]} size="sm">
                    {t.kind}
                  </HdsBadge>
                </td>
                <td className="border-b border-[#efefef] px-1.5">
                  <HdsBadge color={t.direction === 'Debit' ? 'red' : 'green'} size="sm">
                    {t.direction === 'Debit' ? '↗ Debit' : '↙ Credit'}
                  </HdsBadge>
                </td>
                <td className="whitespace-nowrap border-b border-[#efefef] px-1.5">{t.channel}</td>
                <td className="whitespace-nowrap border-b border-[#efefef] px-1.5">{t.category}</td>
                <td className="border-b border-[#efefef] px-1.5">{usd(t.amount)}</td>
                <td className="border-b border-[#efefef] px-1.5">
                  <HdsBadge color="green" size="sm" dot>
                    Successful
                  </HdsBadge>
                </td>
                <td className="border-b border-[#efefef] px-1.5" onClick={(e) => e.stopPropagation()}>
                  <HdsActionMenu
                    theme="light"
                    width={168}
                    items={[
                      { label: 'View details', onSelect: () => setOpen(t) },
                      { label: 'Copy reference', onSelect: () => navigator.clipboard?.writeText(t.ref).catch(() => {}) },
                    ]}
                    trigger={({ open: o, toggle }) => (
                      <button type="button" onClick={toggle} aria-label={`Actions for ${t.ref}`} aria-expanded={o} className="flex size-7 items-center justify-center rounded-md text-[#4b5563] hover:bg-[#edeff2]">
                        ⋮
                      </button>
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-10 text-center text-sm text-[#70707d]">No transactions match “{query}”.</p>}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" onClick={() => setPage(n)} className={`size-8 rounded-lg border text-sm ${n === page ? 'border-[#d6d6d6] bg-white font-semibold text-[#111927]' : 'border-transparent text-[#4b5563] hover:bg-[#edeff2]'}`}>
              {n}
            </button>
          ))}
          <span className="px-1 text-sm text-[#6b7280]">…</span>
          <button type="button" onClick={() => setPage(516)} className={`h-8 rounded-lg border px-2 text-sm ${page === 516 ? 'border-[#d6d6d6] bg-white font-semibold' : 'border-transparent text-[#4b5563] hover:bg-[#edeff2]'}`}>
            516
          </button>
        </div>
      </main>

      <Drawer open={Boolean(open)} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex min-h-full flex-col px-6 pb-6 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Transaction details</h2>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="flex size-5 items-center justify-center rounded-[5px] bg-[#9aa1ac] text-white hover:bg-[#6b7280]">
                <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#edeff2] py-6">
              <p className="flex items-center gap-3 font-heading text-[28px] font-semibold text-[#111927]">
                {open.direction === 'Credit' ? '+' : '-'}
                {usd(open.amount)}
                <span className="flex items-center gap-1 text-xs font-medium text-[#077155]">
                  <span className="size-1.5 rounded-full bg-[#0e9e74]" />
                  Completed
                </span>
              </p>
              <p className="text-sm text-[#111927]">{open.kind === 'Card account funding' ? 'Card account funding' : open.party}</p>
              <p className="text-xs text-[#6b7280]">{open.date}</p>
            </div>
            <div className="flex flex-col gap-3 border-b border-[#edeff2] py-5 text-sm">
              <p className="font-semibold text-[#111927]">Transaction information</p>
              {[
                ['Status', <span key="s" className="flex items-center gap-1 text-[#077155]"><span className="size-1.5 rounded-full bg-[#0e9e74]" />Completed</span>],
                ['Transaction ID', open.ref],
                ['Transaction type', open.kind],
                ['Date', open.date],
                ['Amount', usd(open.amount)],
                ['Fee', usd(0)],
              ].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between">
                  <span className="text-[#4b5563]">{l}</span>
                  <span className="text-[#111927]">{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold">
                <span className="text-[#111927]">Total</span>
                <span className="text-[#111927]">{usd(open.amount)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 py-5 text-sm">
              <p className="font-semibold text-[#111927]">{open.kind === 'Card purchase' ? 'Payment details' : 'Transfer details'}</p>
              {(open.kind === 'Card account funding'
                ? [
                    ['Sender', 'Ops/Payroll •••• 4367'],
                    ['Beneficiary', 'Card account •••• 5654'],
                    ['Currency', 'USD'],
                    ['Funding method', 'Hinstantt account'],
                    ['Settlement', 'Instant'],
                  ]
                : [
                    ['Merchant', open.party],
                    ['Card', card ? `${card.nickname} •••• ${card.last4}` : 'Marketing •••• 2529'],
                    ['Category', open.category],
                    ['Currency', 'USD'],
                    ['Channel', open.channel],
                  ]
              ).map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[#4b5563]">{l}</span>
                  <span className="text-[#111927]">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <HdsButton variant="ghost" fullWidth>
                Get help with this transaction
              </HdsButton>
              <HdsButton fullWidth onClick={() => window.print()}>
                Download receipt
              </HdsButton>
            </div>
          </div>
        )}
      </Drawer>
    </AppShell>
  )
}
