import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import detailFlagUs from '../../assets/icons/accounts-detail-flag-us.svg'
import infoIcon from '../../assets/icons/accounts-info.svg'
import rowBankIcon from '../../assets/icons/accounts-row-bank.svg'
import walletRowIcon from '../../assets/icons/accounts-wallet-row.svg'
import moreVerticalIcon from '../../assets/icons/accounts-more-vertical.svg'
import filterIcon from '../../assets/icons/accounts-filter.svg'
import transactionsIcon from '../../assets/icons/accounts-dmenu-transactions.svg'
import statementIcon from '../../assets/icons/accounts-dmenu-statement.svg'
import editIcon from '../../assets/icons/accounts-dmenu-edit.svg'
import scheduledIcon from '../../assets/icons/accounts-dmenu-scheduled.svg'
import fundIcon from '../../assets/icons/accounts-menu-fund.svg'
import sendIcon from '../../assets/icons/accounts-menu-send.svg'
import { MAIN_ACCOUNTS, TAB_PATH, WALLETS, YIELD_ACCOUNTS, backfillSokinAccounts, createdStore, type AccountTab } from './data'
import { ActionMenu, ActionsButton, FilterMenu, SearchField, filterValues, useDismiss, useToast, type FilterGroup, type MenuItem } from './ui'
import { Chevron, DropdownMenu, HdsBadge, HdsButton, inputRowClass, type BadgeColor } from '../../components/ui/hds'
import { COLLAPSE_PAGE_ACTIONS } from './actions'
import FundAccountDrawer from './FundAccount'
import FundingDetailsDrawer, { type FundingDetailsAccount } from './FundingDetails'
import SendMoneyDrawer from './SendMoney'
import UnsettledDepositDrawer from './UnsettledDeposit'
import type { ApprovedRecipient } from './currencies'
import type { FundingAccount } from './funding'

type Resolved = { tab: AccountTab; name: string; balance: string; flag: string | null; sub: string; tooltip: string; funding?: FundingAccount; badge?: string; currency?: string; provider?: string; recipients?: ApprovedRecipient[]; bank?: string; customerRef?: string }

function resolve(id: string | null): Resolved {
  const main = [...createdStore.main, ...MAIN_ACCOUNTS].find((a) => a.id === id)
  if (main)
    return {
      tab: 'main',
      name: main.name,
      balance: `${main.symbol}${main.whole}${main.cents}`,
      flag: main.flag === MAIN_ACCOUNTS[0].flag ? detailFlagUs : main.flag,
      // Sokin balances sit on a collection account held in Kredete's name: ....<last 4> • Collection account.
      sub: `....${main.last4} • ${main.provider === 'sokin' ? 'Collection' : main.kind} account`,
      tooltip: main.usdType === 'global' ? 'Can be funded in several currencies' : 'Swift deposit not supported',
      funding: { id: main.id, name: main.name, currency: main.currency, usdType: main.usdType, last4: main.last4 },
      badge: main.usdType === 'local' ? 'Local USD account' : undefined,
      currency: main.currency,
      provider: main.provider,
      recipients: main.recipients,
      bank: main.bank,
      customerRef: main.customerRef,
    }
  const y = YIELD_ACCOUNTS.find((a) => a.id === id)
  if (y) return { tab: 'yield', name: y.name, balance: y.balance, flag: detailFlagUs, sub: `${y.asset} • ${y.apy} APY`, tooltip: 'Yield accrues daily' }
  const w = [...createdStore.wallets, ...WALLETS].find((a) => a.id === id)
  if (w) return { tab: 'wallets', name: w.name, balance: w.balance, flag: null, sub: `${w.address} • ${w.network}`, tooltip: `Only send ${w.asset} on ${w.network}` }
  return resolve(MAIN_ACCOUNTS[0].id)
}

const TAB_CRUMB: Record<AccountTab, string> = { main: 'Main Accounts', yield: 'Yield Accounts', wallets: 'Wallets' }

// PayIn / PayOut bars — heights verbatim from Figma 47582:382276.
const BARS = [
  { label: 'Feb 24', payIn: 124, payOut: 72 },
  { label: 'Feb 28', payIn: 95, payOut: 36 },
  { label: 'Mar 3', payIn: 52, payOut: 44 },
  { label: 'Mar 7', payIn: 95, payOut: 23 },
  { label: 'Mar 10', payIn: 97, payOut: 41 },
  { label: 'Mar 17', payIn: 114, payOut: 72 },
  { label: 'Mar 24', payIn: 97, payOut: 72 },
]
const AXIS = ['Feb 24', 'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24']

type TxType = 'Payout' | 'Conversion' | 'PayIn' | 'Refund'
type TxStatus = 'Successful' | 'Failed' | 'Pending'
type Tx = { ref: string; date: string; party: string; type: TxType; direction: 'Credit' | 'Debit'; category: string; channel: string; amount: string; status: TxStatus }

const TXS: Tx[] = [
  { ref: 'xYcvbund7Q2', date: 'Jan 6, 9:45PM', party: 'Adam Johnson', type: 'Payout', direction: 'Credit', category: 'Mortgage', channel: 'ACH', amount: '$13.25', status: 'Successful' },
  { ref: 'xYcvbund8L4', date: 'Jan 6, 9:45PM', party: 'Sophie Thompson', type: 'Conversion', direction: 'Credit', category: 'Personal Loan', channel: 'Wire', amount: '$13.25', status: 'Failed' },
  { ref: 'xYcvbund2K9', date: 'Jan 6, 9:45PM', party: 'James Jones', type: 'PayIn', direction: 'Debit', category: 'Home Equity', channel: 'Onchain', amount: '$13.25', status: 'Pending' },
  { ref: 'xYcvbund5M1', date: 'Jan 6, 9:45PM', party: 'Nita Smithson', type: 'Conversion', direction: 'Credit', category: 'Business Loan', channel: 'Remittance', amount: '$13.25', status: 'Failed' },
  { ref: 'xYcvbund9P3', date: 'Jan 8, 9:45PM', party: 'Philips Phelps', type: 'PayIn', direction: 'Debit', category: 'Line of Credit', channel: 'Wire', amount: '$13.25', status: 'Successful' },
  { ref: 'xYcvbund3R6', date: 'Jan 19, 9:45PM', party: 'James Jones', type: 'Refund', direction: 'Debit', category: 'Student Loan', channel: 'Onchain', amount: '$13.25', status: 'Pending' },
  { ref: 'xYcvbund1T8', date: 'Jan 31, 9:45PM', party: 'James Jones', type: 'Refund', direction: 'Debit', category: 'Debt Loan', channel: 'Conversion', amount: '$13.25', status: 'Successful' },
]

// Transaction pills → HDS Badge colours (Figma HDS 798:7), keeping the design's hue for each value.
const TYPE_COLOR: Record<TxType, BadgeColor> = { Payout: 'amber', Conversion: 'navy', PayIn: 'green', Refund: 'red' }
const DIRECTION_COLOR: Record<Tx['direction'], BadgeColor> = { Credit: 'amber', Debit: 'red' }
const STATUS_COLOR: Record<TxStatus, BadgeColor> = { Successful: 'green', Failed: 'red', Pending: 'amber' }

const Pill = ({ color, children }: { color: BadgeColor; children: string }) => (
  <HdsBadge color={color} dot>
    {children}
  </HdsBadge>
)

// Table filters (not drawn in Figma) — the columns the statement table shows.
const TX_FILTERS: FilterGroup[] = [
  { key: 'type', title: 'Type', options: (['Payout', 'Conversion', 'PayIn', 'Refund'] as const).map((v) => ({ value: v, label: v })) },
  { key: 'direction', title: 'Direction', options: ['Credit', 'Debit'].map((v) => ({ value: v, label: v })) },
  { key: 'status', title: 'Status', options: ['Successful', 'Pending', 'Failed'].map((v) => ({ value: v, label: v })) },
  { key: 'channel', title: 'Channel', options: ['ACH', 'Wire', 'Onchain', 'Remittance', 'Conversion'].map((v) => ({ value: v, label: v })) },
]

// Chart filter: which flows the PayIn / PayOut chart draws.
const CHART_FILTERS: FilterGroup[] = [
  {
    key: 'flow',
    title: 'Show',
    options: [
      { value: 'in', label: 'PayIn' },
      { value: 'out', label: 'PayOut' },
    ],
  },
]

// "Show N items" — HDS Select (sm trigger) with the dark menu opening upwards from the footer.
function PageSizeSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative w-[164px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${inputRowClass({ focus: open })} h-9 text-left`}
      >
        <span className="flex-1 text-sm text-[#111927]">Show {value} items</span>
        <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
      </button>
      {open && (
        <div className="absolute bottom-[calc(100%+6px)] right-0 z-20 w-full">
          <DropdownMenu
            options={[10, 20, 50, 100].map((n) => ({ value: String(n), label: `${n} items` }))}
            value={String(value)}
            onSelect={(v) => {
              onChange(Number(v))
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function AccountDetail() {
  const [params] = useSearchParams()
  // Completes older Sokin accounts (last 4 digits, Collection, Kredete reference) and re-renders once done.
  const [, refresh] = useState(0)
  useEffect(() => {
    void backfillSokinAccounts().then((changed) => changed && refresh((n) => n + 1))
  }, [])
  const account = resolve(params.get('id'))
  const [toast, notify] = useToast()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [hoverBar, setHoverBar] = useState<number | null>(null)
  const [txFilters, setTxFilters] = useState<string[]>([])
  const [chartFilters, setChartFilters] = useState<string[]>([])
  const flows = filterValues(chartFilters, 'flow')
  const showIn = flows.length === 0 || flows.includes('in')
  const showOut = flows.length === 0 || flows.includes('out')
  const [fundOpen, setFundOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [unsettledOpen, setUnsettledOpen] = useState(false)
  // Sokin accounts open the Send money chooser (Figma 48340:222536); others keep the existing behaviour.
  const send = () => (account.provider === 'sokin' ? setSendOpen(true) : notify(`Send · ${account.name}`))
  // Accounts held with Sokin (shown as BMO Bank) expose their funding details from More actions.
  const providerAccount = useMemo<FundingDetailsAccount | null>(
    () => (account.provider === 'sokin' && account.currency ? { name: account.name, currency: account.currency, provider: account.provider, last4: account.funding?.last4, recipients: account.recipients, bank: account.bank, customerRef: account.customerRef } : null),
    [account.provider, account.currency, account.name, account.recipients, account.funding?.last4, account.bank, account.customerRef],
  )
  // Sokin-held accounts are funded with their own account details, not the bank transfer / crypto chooser.
  const fund = () => (account.provider === 'sokin' ? setDetailsOpen(true) : account.funding ? setFundOpen(true) : notify(`Fund · ${account.name}`))
  const tableRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pass = (key: string, value: string) => {
      const allowed = filterValues(txFilters, key)
      return allowed.length === 0 || allowed.includes(value)
    }
    return TXS.filter(
      (t) =>
        (!q || t.ref.toLowerCase().includes(q) || t.party.toLowerCase().includes(q)) &&
        pass('type', t.type) &&
        pass('direction', t.direction) &&
        pass('status', t.status) &&
        pass('channel', t.channel),
    )
  }, [query, txFilters])

  const scrollToTable = () => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const menuItems: MenuItem[] = [
    ...(providerAccount ? [{ label: 'Funding details', icon: rowBankIcon, onSelect: () => setDetailsOpen(true) }] : []),
    { label: 'Transactions', icon: transactionsIcon, onSelect: scrollToTable },
    { label: 'Statement', icon: statementIcon, onSelect: () => notify(`Statement for ${account.name} is downloading`) },
    { label: 'Edit account', icon: editIcon, onSelect: () => notify(`Edit account · ${account.name}`) },
    { label: 'Scheduled Payments', icon: scheduledIcon, onSelect: () => notify(`Scheduled payments · ${account.name}`) },
  ]

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-8 pb-16 pt-10">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-3 text-sm" aria-label="Breadcrumb">
            <Link to={TAB_PATH[account.tab]} className="text-[#70707d] transition-colors hover:text-[#111927]">
              {TAB_CRUMB[account.tab]}
            </Link>
            <span className="text-[#70707d]">›</span>
            <span className="font-medium text-[#00a9e0]">{account.name}</span>
          </nav>
          {/* Sokin accounts: report a deposit that hasn't reached the balance (upload proof of payment). */}
          {account.provider === 'sokin' && (
            <HdsButton variant="secondary" size="sm" onClick={() => setUnsettledOpen(true)}>
              Expecting a payment?
            </HdsButton>
          )}
        </div>

        <section className="flex items-end justify-between gap-9 pt-6">
          <div className="flex flex-col gap-[22px]">
            <div className="flex flex-col gap-4">
              <p className="text-base font-medium leading-6 text-[#555354]">{account.name}</p>
              <div className="flex items-center gap-2 py-1.5">
                {account.flag ? (
                  <span className="relative h-8 w-9 shrink-0">
                    <img src={account.flag} alt="" className="absolute left-0 -top-0.5 size-10 max-w-none" />
                  </span>
                ) : (
                  <span className="rounded-lg bg-[#cce2fc] p-1.5">
                    <img src={walletRowIcon} alt="" className="size-5" />
                  </span>
                )}
                <p className="font-heading text-4xl font-bold leading-10 text-[#111011]">{account.balance}</p>
                <span className="group relative">
                  <img src={infoIcon} alt="" className="size-4" />
                  <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111927] px-3 py-2 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {account.tooltip}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#111927]" />
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <img src={rowBankIcon} alt="" className="size-3.5" />
                <p className="text-[11px] font-medium leading-4 text-[#2d2d2d]">{account.sub}</p>
                {account.badge && (
                  <HdsBadge color="navy" size="sm" className="ml-1">
                    {account.badge}
                  </HdsBadge>
                )}
              </div>
            </div>
            {COLLAPSE_PAGE_ACTIONS ? (
              <div className="w-fit">
                <ActionsButton
                  items={[
                    { label: 'Fund', icon: fundIcon, onSelect: fund },
                    { label: 'Send', icon: sendIcon, onSelect: send },
                    ...menuItems,
                  ]}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <HdsButton variant="primary" shape="pill" onClick={fund}>
                  Fund
                </HdsButton>
                <HdsButton variant="secondary" shape="pill" onClick={send}>
                  Send
                </HdsButton>
                <ActionMenu
                  items={menuItems}
                  size="md"
                  align="left"
                  trigger={({ open, toggle }) => (
                    <HdsButton
                      variant="ghost"
                      shape="pill"
                      iconOnly
                      onClick={toggle}
                      aria-label="More actions"
                      aria-haspopup="menu"
                      aria-expanded={open}
                      className={open ? '!bg-[#e1e4e9]' : '!bg-[#edeff2] hover:!bg-[#e1e4e9]'}
                    >
                      <img src={moreVerticalIcon} alt="" className="size-3" />
                    </HdsButton>
                  )}
                />
              </div>
            )}
          </div>

          <div className="flex w-[486px] shrink-0 flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11.6px] tracking-[0.2px] text-[#535461]">PayIn</span>
                  <span className="size-1.5 rounded-[3px] bg-[#001521]" />
                  <span className="text-base font-semibold leading-6 text-[#2c2c2c]">$14,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11.4px] tracking-[0.2px] text-[#535461]">PayOut</span>
                  <span className="size-1.5 rounded-[3px] bg-[#b6e9ff]" />
                  <span className="text-base font-semibold leading-6 text-[#2c2c2c]">$8,000</span>
                </div>
              </div>
              <FilterMenu groups={CHART_FILTERS} selected={chartFilters} onChange={setChartFilters} icon={filterIcon} align="right" />
            </div>
            <div className="relative h-[136px] border-b border-[#d6d6d6]">
              <div className="pointer-events-none absolute inset-0 grid grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="border-l border-[#ebebeb] first:border-l-0" />
                ))}
              </div>
              <div className="absolute inset-x-[13px] bottom-0 flex items-end justify-between">
                {BARS.map((bar, i) => (
                  <div
                    key={bar.label}
                    onMouseEnter={() => setHoverBar(i)}
                    onMouseLeave={() => setHoverBar(null)}
                    className="relative flex items-end"
                  >
                    {showIn && (
                      <span
                        className="w-6 origin-bottom animate-[grow_600ms_ease-out_both] rounded-t bg-[#001521]"
                        style={{ height: bar.payIn, animationDelay: `${i * 50}ms` }}
                      />
                    )}
                    {showOut && (
                      <span
                        className="w-6 origin-bottom animate-[grow_600ms_ease-out_both] rounded-t bg-[#b6e9ff]"
                        style={{ height: bar.payOut, animationDelay: `${i * 50 + 80}ms` }}
                      />
                    )}
                    {hoverBar === i && (
                      <span className="absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111927] px-2.5 py-1.5 text-[11px] text-white">
                        {bar.label} · In ${(bar.payIn * 20).toLocaleString()} · Out ${(bar.payOut * 20).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[11px] leading-4 text-[#70707d]">
              {AXIS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </section>

        <div ref={tableRef} className="flex scroll-mt-6 flex-col gap-6">
          <div className="flex items-center gap-3">
            <SearchField value={query} onChange={setQuery} placeholder="Search by reference ID" />
            <FilterMenu groups={TX_FILTERS} selected={txFilters} onChange={setTxFilters} icon={filterIcon} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-sm font-medium text-[#525866]">
                  {['Reference', 'Date', 'Parties', 'Type', 'Direction', 'Category', 'Channel', 'Amount credited', 'Status'].map((h, i, all) => (
                    <th
                      key={h}
                      className={`bg-[#efefef] px-2.5 py-2 font-medium ${i === 0 ? 'rounded-l-lg' : ''} ${i === all.length - 1 ? 'rounded-r-lg' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.ref} className="text-sm font-medium text-[#0e121b] transition-colors hover:bg-[#f5f6f8]/70">
                    <td className="h-[66px] border-b border-[#efefef] px-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(t.ref).catch(() => {})
                          notify('Reference copied')
                        }}
                        className="max-w-[110px] truncate hover:text-[#004b87]"
                        title="Copy reference"
                      >
                        {t.ref}
                      </button>
                    </td>
                    <td className="border-b border-[#efefef] px-2.5 whitespace-nowrap">{t.date}</td>
                    <td className="max-w-[130px] truncate border-b border-[#efefef] px-2.5">{t.party}</td>
                    <td className="border-b border-[#efefef] px-2.5">
                      <Pill color={TYPE_COLOR[t.type]}>{t.type}</Pill>
                    </td>
                    <td className="border-b border-[#efefef] px-2.5">
                      <Pill color={DIRECTION_COLOR[t.direction]}>{t.direction}</Pill>
                    </td>
                    <td className="border-b border-[#efefef] px-2.5 whitespace-nowrap">{t.category}</td>
                    <td className="border-b border-[#efefef] px-2.5">{t.channel}</td>
                    <td className="border-b border-[#efefef] px-2.5">{t.amount}</td>
                    <td className="border-b border-[#efefef] px-2.5">
                      <Pill color={STATUS_COLOR[t.status]}>{t.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="py-12 text-center text-sm text-[#70707d]">{query ? <>No transactions match “{query}”.</> : 'No transactions match these filters.'}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span />
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-2 text-lg text-[#4b5563] disabled:opacity-30">
                ‹
              </button>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`size-8 rounded-lg border text-sm transition-colors ${n === page ? 'border-[#d6d6d6] bg-white font-semibold text-[#111927]' : 'border-transparent text-[#4b5563] hover:bg-[#edeff2]'}`}
                >
                  {n}
                </button>
              ))}
              <button type="button" aria-label="Next page" disabled={page === 5} onClick={() => setPage((p) => p + 1)} className="px-2 text-lg text-[#4b5563] disabled:opacity-30">
                ›
              </button>
            </div>
            <PageSizeSelect value={pageSize} onChange={setPageSize} />
          </div>
        </div>
      </main>
      <FundAccountDrawer account={account.funding ?? null} open={fundOpen} onClose={() => setFundOpen(false)} />
      <FundingDetailsDrawer account={providerAccount} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
      <UnsettledDepositDrawer open={unsettledOpen} currency={account.currency ?? ''} accountName={account.name} onClose={() => setUnsettledOpen(false)} />
      <SendMoneyDrawer
        open={sendOpen}
        currency={account.currency ?? ''}
        onClose={() => setSendOpen(false)}
        onPick={(kind) => {
          setSendOpen(false)
          notify(kind === 'domestic' ? `Domestic ${account.currency} transfer · ${account.name}` : `International transfer · ${account.name}`)
        }}
      />
      {toast}
    </AppShell>
  )
}
