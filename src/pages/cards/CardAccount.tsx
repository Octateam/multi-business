import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { Drawer } from '../accounts/ui'
import { HdsActionMenu, HdsBadge, HdsButton, HdsListItem, HdsSearch, type BadgeColor } from '../../components/ui/hds'
import { FundAccountDrawer, FundCardDrawer } from './FundDrawers'
import { CardNotice } from './CardDrawers'
import { adjustAccountBalance, clearNotice, getCard, notify, updateCard, usd, useCardStore } from './cardStore'
import bankIcon from '../../assets/icons/cards-bank.svg'
import filterIcon from '../../assets/icons/cards-filter.svg'

// Card details (Figma 48062:251998). Clicking a card on the Cards page opens this page for that card;
// clicking the card account balance opens it for the whole card account. Balance + Funds added / Card spend
// chart, Fund · Send · ⋯ (Transactions, Statement, Edit account, Scheduled Payments), and the latest card
// transactions. Fund opens the funding chooser (48062:243930) or, for a card, Fund card; Send opens
// Send money (48062:244371).

type Row = { ref: string; date: string; merchant: string; logo: string; logoBg: string; card: string; holder: string; category: string; catColor: BadgeColor; amount: number; status: 'Completed' | 'Declined' }

const ROWS: Row[] = [
  { ref: 'TXN-8F9D2K4L', date: 'Sep 27, 2:14 PM', merchant: 'Amazon', logo: 'a', logoBg: '#f5f6f8', card: 'Marketing •••• 2529', holder: 'Gred Grey', category: 'Retail', catColor: 'navy', amount: -120, status: 'Completed' },
  { ref: 'TXN-3K7P9M1Q', date: 'Sep 27, 11:32 AM', merchant: 'Meta Ads', logo: '∞', logoBg: '#0866ff', card: 'Marketing •••• 2529', holder: 'Gred Grey', category: 'Advertising', catColor: 'red', amount: -850, status: 'Completed' },
  { ref: 'TXN-4H2B8N7V', date: 'Sep 27, 9:06 AM', merchant: 'Google Workspace', logo: 'G', logoBg: '#e8f0fe', card: 'Operations •••• 5601', holder: 'Amelia Ortiz', category: 'Software', catColor: 'info', amount: -200, status: 'Completed' },
  { ref: 'TXN-1D9P3L6F', date: 'Sep 26, 6:42 PM', merchant: 'Uber', logo: 'Uber', logoBg: '#000000', card: 'Travel •••• 1842', holder: 'John Doe', category: 'Transport', catColor: 'amber', amount: -74.5, status: 'Completed' },
  { ref: 'TXN-7G5N1Q9R', date: 'Sep 26, 3:18 PM', merchant: 'AWS', logo: 'aws', logoBg: '#232f3e', card: 'Engineering •••• 7734', holder: 'James Jones', category: 'Software', catColor: 'info', amount: -1250, status: 'Completed' },
  { ref: 'TXN-2M6K4T8C', date: 'Sep 26, 1:05 PM', merchant: 'Notion', logo: 'N', logoBg: '#ffffff', card: 'Operations •••• 5601', holder: 'Amelia Ortiz', category: 'Software', catColor: 'info', amount: -18, status: 'Declined' },
  { ref: 'TXN-9L3F7P2D', date: 'Sep 25, 4:30 PM', merchant: 'Card account funding', logo: '🏛', logoBg: '#ffffff', card: '—', holder: '—', category: 'Funding', catColor: 'green', amount: 10000, status: 'Completed' },
]

const BARS = [
  { label: 'Feb 24', added: 106, spend: 58 },
  { label: 'Feb 28', added: 78, spend: 26 },
  { label: 'Mar 3', added: 43, spend: 35 },
  { label: 'Mar 7', added: 82, spend: 19 },
  { label: 'Mar 10', added: 82, spend: 27 },
  { label: 'Mar 17', added: 98, spend: 58 },
  { label: 'Mar 24', added: 79, spend: 58 },
]

const SEND_OPTIONS = [
  { title: 'Local transfer', subtitle: 'Send funds to a USD bank account.', d: 'M2 6.5 8 3l6 3.5M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12' },
  { title: 'International transfer', subtitle: 'Send funds to 40+ countries worldwide.', d: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM1.5 8h13M8 1.5c2 2 2.5 4 2.5 6.5S10 12.5 8 14.5C6 12.5 5.5 10.5 5.5 8S6 3.5 8 1.5Z' },
  { title: 'Crypto transfer', subtitle: 'Send funds to a crypto wallet.', d: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6 5.5h3a1.5 1.5 0 0 1 0 3H6V5.5Zm0 3h3.5a1.5 1.5 0 0 1 0 3H6v-3Z' },
  { title: 'Hinstantt account', subtitle: 'Move funds to an active internal account.', d: 'M2.5 8.5 13.5 3 10 13.5 7.5 9 2.5 8.5Z' },
]

const MERCHANT = ({ logo, bg }: { logo: string; bg: string }) => (
  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#edeff2] text-[10px] font-semibold" style={{ background: bg, color: bg === '#ffffff' || bg === '#f5f6f8' || bg === '#e8f0fe' ? '#111927' : '#ffffff' }}>
    {logo}
  </span>
)

const Glyph = ({ d }: { d: string }) => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] text-[#111927]">
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  </span>
)

export default function CardAccount() {
  const navigate = useNavigate()
  const location = useLocation()
  const { accountBalance, cards, notice } = useCardStore()
  const card = getCard(new URLSearchParams(location.search).get('card'))
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [fundOpen, setFundOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  // For a single card, the table shows that card's purchases; the account view shows every card.
  const rows = useMemo(() => {
    const base = card ? ROWS.filter((r) => r.category !== 'Funding').map((r) => ({ ...r, card: `${card.nickname} •••• ${card.last4}`, holder: card.assignee })) : ROWS
    const q = query.trim().toLowerCase()
    return base.filter((r) => !q || r.ref.toLowerCase().includes(q) || r.merchant.toLowerCase().includes(q))
  }, [card, query])

  const title = card ? card.nickname : 'Card account'
  const balance = card ? card.balance : accountBalance
  const sub = card ? `${card.type} card • ${card.last4}` : 'Checking account • 4367'

  const statement = () => {
    const text = ['Reference,Date,Merchant,Card,Cardholder,Category,Amount,Status', ...rows.map((r) => [r.ref, r.date, r.merchant, r.card, r.holder, r.category, r.amount, r.status].join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-statement.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify('Statement downloaded', `Your ${title} statement is in your downloads.`)
  }

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-8 pb-16 pt-8">
        <nav className="flex items-center gap-3 text-sm" aria-label="Breadcrumb">
          <Link to="/cards" className="text-[#70707d] hover:text-[#111927]">
            Cards
          </Link>
          <span className="text-[#70707d]">›</span>
          <span className="font-medium text-[#004b87]">{title}</span>
        </nav>

        <section className="flex items-end justify-between gap-9">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-base font-medium text-[#555354]">{title}</p>
              <p className="font-heading text-4xl font-bold leading-10 text-[#111011]">{usd(balance)}</p>
              <p className="flex items-center gap-1 text-[11px] font-medium text-[#2d2d2d]">
                <img src={bankIcon} alt="" className="size-3.5" />
                {sub}
                {card?.status === 'frozen' && (
                  <HdsBadge color="info" size="sm" className="ml-1">
                    Frozen
                  </HdsBadge>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <HdsButton shape="pill" onClick={() => setFundOpen(true)} disabled={card?.status === 'deleted'}>
                Fund
              </HdsButton>
              <HdsButton variant="secondary" shape="pill" onClick={() => setSendOpen(true)}>
                Send
              </HdsButton>
              <HdsActionMenu
                theme="light"
                align="left"
                width={176}
                items={[
                  { label: 'Transactions', onSelect: () => navigate(card ? `/cards/transactions?card=${card.id}` : '/cards/transactions') },
                  { label: 'Statement', onSelect: statement },
                  { label: card ? 'Edit card' : 'Edit account', disabled: !card, onSelect: () => card && navigate(`/cards/edit?id=${card.id}`) },
                  { label: 'Scheduled Payments', onSelect: () => notify('No scheduled payments', `There are no scheduled payments on ${title} yet.`) },
                ]}
                trigger={({ open, toggle }) => (
                  <HdsButton variant="ghost" shape="pill" iconOnly onClick={toggle} aria-label="More actions" aria-expanded={open} className={open ? '!bg-[#e1e4e9]' : '!bg-[#edeff2]'}>
                    <span className="text-base leading-none text-[#4b5563]">⋯</span>
                  </HdsButton>
                )}
              />
            </div>
          </div>

          <div className="flex w-[486px] shrink-0 flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[11.5px] text-[#535461]">
                <span className="flex items-center gap-2">
                  Funds added <span className="size-1.5 rounded-full bg-[#001521]" />
                  <span className="text-base font-semibold text-[#2c2c2c]">$14,000</span>
                </span>
                <span className="flex items-center gap-2">
                  Card spend <span className="size-1.5 rounded-full bg-[#b6e9ff]" />
                  <span className="text-base font-semibold text-[#2c2c2c]">$8,000</span>
                </span>
              </div>
              <HdsButton variant="ghost" size="sm" leadingIcon={<img src={filterIcon} alt="" className="size-[14px]" />}>
                Filter
              </HdsButton>
            </div>
            <div className="relative h-[120px] border-b border-[#d6d6d6]">
              <div className="absolute inset-x-[13px] bottom-0 flex items-end justify-between">
                {BARS.map((b, i) => (
                  <div key={b.label} className="relative flex items-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                    <span className="w-6 origin-bottom animate-[grow_600ms_ease-out_both] rounded-t bg-[#001521]" style={{ height: b.added, animationDelay: `${i * 50}ms` }} />
                    <span className="w-6 origin-bottom animate-[grow_600ms_ease-out_both] rounded-t bg-[#b6e9ff]" style={{ height: b.spend, animationDelay: `${i * 50 + 80}ms` }} />
                    {hover === i && (
                      <span className="absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111927] px-2.5 py-1.5 text-[11px] text-white">
                        {b.label} · Added ${(b.added * 20).toLocaleString()} · Spend ${(b.spend * 20).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-[#70707d]">
              {['Feb 24', 'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24'].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <HdsSearch value={query} onChange={setQuery} placeholder="Search by reference ID" className="w-[300px]" />
            <HdsButton variant="ghost" size="sm" leadingIcon={<img src={filterIcon} alt="" className="size-[14px]" />}>
              Filter
            </HdsButton>
          </div>
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-[#525866]">
                {['Reference', 'Date', 'Merchant', 'Card', 'Cardholder', 'Category', 'Amount', 'Status'].map((h, i, all) => (
                  <th key={h} className={`bg-[#efefef] px-2.5 py-2 font-medium ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref} className="font-medium text-[#0e121b]">
                  <td className="h-[60px] max-w-[110px] truncate border-b border-[#efefef] px-2.5">{r.ref}</td>
                  <td className="whitespace-nowrap border-b border-[#efefef] px-2.5">{r.date}</td>
                  <td className="border-b border-[#efefef] px-2.5">
                    <span className="flex items-center gap-2">
                      <MERCHANT logo={r.logo} bg={r.logoBg} />
                      <span className="max-w-[120px] truncate">{r.merchant}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-[#efefef] px-2.5">{r.card}</td>
                  <td className="whitespace-nowrap border-b border-[#efefef] px-2.5">{r.holder}</td>
                  <td className="border-b border-[#efefef] px-2.5">
                    <HdsBadge color={r.catColor} size="sm">
                      {r.category}
                    </HdsBadge>
                  </td>
                  <td className="whitespace-nowrap border-b border-[#efefef] px-2.5">{r.amount < 0 ? `-${usd(-r.amount)}` : `+${usd(r.amount)}`}</td>
                  <td className="border-b border-[#efefef] px-2.5">
                    <span className={`flex items-center gap-1.5 ${r.status === 'Completed' ? 'text-[#077155]' : 'text-[#b4232e]'}`}>
                      <span className={`size-1.5 rounded-full ${r.status === 'Completed' ? 'bg-[#0e9e74]' : 'bg-[#d92836]'}`} />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-10 text-center text-sm text-[#70707d]">No transactions match “{query}”.</p>}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setPage(n)} className={`size-8 rounded-lg border text-sm ${n === page ? 'border-[#d6d6d6] bg-white font-semibold text-[#111927]' : 'border-transparent text-[#4b5563] hover:bg-[#edeff2]'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </main>

      {card ? (
        <FundCardDrawer
          open={fundOpen}
          cards={cards.filter((c) => c.status !== 'deleted').map((c) => ({ id: c.id, nickname: c.nickname, last4: c.last4, assignee: c.assignee, balance: c.balance, frozen: c.status === 'frozen', statusLabel: c.status === 'frozen' ? 'Frozen' : c.status === 'inactive' ? 'Inactive' : 'Active' }))}
          initialCardId={card.status === 'frozen' ? null : card.id}
          accountBalance={accountBalance}
          onClose={() => setFundOpen(false)}
          onFunded={(id, amount) => {
            const c = getCard(id)
            if (c) updateCard(id, { balance: c.balance + amount })
            adjustAccountBalance(-amount)
          }}
        />
      ) : (
        <FundAccountDrawer variant="account" open={fundOpen} onClose={() => setFundOpen(false)} onFunded={(amount) => adjustAccountBalance(amount)} />
      )}

      <Drawer open={sendOpen} onClose={() => setSendOpen(false)}>
        <div className="flex flex-col gap-6 px-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Send money</h2>
              <p className="text-sm text-[#555354]">Choose how you want to send funds from your account.</p>
            </div>
            <button type="button" onClick={() => setSendOpen(false)} aria-label="Close" className="flex size-5 items-center justify-center rounded-[5px] bg-[#9aa1ac] text-white hover:bg-[#6b7280]">
              <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {SEND_OPTIONS.map((o) => (
              <HdsListItem key={o.title} style="card" title={o.title} subtitle={o.subtitle} leading={<Glyph d={o.d} />} trailing={{ type: 'chevron' }} onClick={() => navigate('/payments/send-money')} />
            ))}
          </div>
        </div>
      </Drawer>

      {notice && <CardNotice title={notice.title} body={notice.body} onClose={clearNotice} />}
    </AppShell>
  )
}
