import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import tabBankIcon from '../../assets/icons/accounts-tab-bank.svg'
import tabYieldIcon from '../../assets/icons/accounts-tab-yield.svg'
import tabWalletIcon from '../../assets/icons/accounts-tab-wallet.svg'
import infoIcon from '../../assets/icons/accounts-info.svg'
import eyeIcon from '../../assets/icons/dashboard-view-icon.svg'
import filterIcon from '../../assets/icons/accounts-filter.svg'
import rowBankIcon from '../../assets/icons/accounts-row-bank.svg'
import maskDotsIcon from '../../assets/icons/accounts-mask-dots.svg'
import rowMoreIcon from '../../assets/icons/accounts-row-more.svg'
import walletRowIcon from '../../assets/icons/accounts-wallet-row.svg'
import menuFundIcon from '../../assets/icons/accounts-menu-fund.svg'
import menuSendIcon from '../../assets/icons/accounts-menu-send.svg'
import menuTransferIcon from '../../assets/icons/accounts-menu-transfer.svg'
import menuStatementIcon from '../../assets/icons/accounts-menu-statement.svg'
import menuConfigureIcon from '../../assets/icons/accounts-menu-configure.svg'
import menuWithdrawIcon from '../../assets/icons/accounts-menu-withdraw.svg'
import {
  ASSET_LOGO,
  CURRENCIES,
  MAIN_ACCOUNTS,
  createdStore,
  saveCreated,
  newCustomerRef,
  backfillSokinAccounts,
  TAB_PATH,
  WALLETS,
  YIELD_ACCOUNTS,
  type AccountTab,
  type MainAccount,
  type Wallet,
} from './data'
import { ActionMenu, ActionsButton, FilterMenu, Flag, NetworkLogo, SearchField, StatusPill, filterValues, useToast, type FilterGroup, type MenuItem } from './ui'
import { HdsBadge, HdsButton, HdsToggleSegment } from '../../components/ui/hds'
import { symbolFor } from './currencies'
import CreateAccountDrawer, { type CreateKind, type CreatedAccount } from './CreateAccount'
import { COLLAPSE_PAGE_ACTIONS } from './actions'
import FundAccountDrawer from './FundAccount'
import FundingDetailsDrawer, { type FundingDetailsAccount } from './FundingDetails'
import type { FundingAccount } from './funding'

const TABS: { key: AccountTab; label: string; icon: string; create: string }[] = [
  { key: 'main', label: 'Main accounts', icon: tabBankIcon, create: 'Create Main Account' },
  { key: 'yield', label: 'Yield accounts', icon: tabYieldIcon, create: 'Create Yield Account' },
  { key: 'wallets', label: 'Wallets', icon: tabWalletIcon, create: 'Create Wallet' },
]

const CREATE_KIND: Record<AccountTab, CreateKind | null> = { main: 'main', yield: null, wallets: 'wallet' }

const STATUS_FILTER: FilterGroup = {
  key: 'status',
  title: 'Status',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ],
}
const ASSET_FILTER: FilterGroup = { key: 'asset', title: 'Asset', options: [{ value: 'USDC', label: 'USDC' }, { value: 'USDT', label: 'USDT' }] }

// Filter options per tab (not drawn in Figma): status everywhere, then the columns each table shows.
const FILTERS: Record<AccountTab, FilterGroup[]> = {
  main: [
    STATUS_FILTER,
    { key: 'currency', title: 'Currency', options: CURRENCIES.map((c) => ({ value: c.code, label: c.label })) },
    {
      key: 'type',
      title: 'Account type',
      options: [
        { value: 'global', label: 'Global USD account' },
        { value: 'local', label: 'Local USD account' },
        { value: 'standard', label: 'Local currency account' },
      ],
    },
  ],
  yield: [STATUS_FILTER, { key: 'asset', title: 'Asset', options: [{ value: 'USDC', label: 'USDC' }] }],
  wallets: [
    STATUS_FILTER,
    ASSET_FILTER,
    { key: 'network', title: 'Network', options: (['Stellar', 'Polygon', 'Ethereum', 'Arbitrum'] as const).map((n) => ({ value: n, label: `${n} Network` })) },
  ],
}

const GridGlyph = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
const ListGlyph = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="2.75" cy="4" r="0.9" fill="currentColor" />
    <circle cx="2.75" cy="8" r="0.9" fill="currentColor" />
    <circle cx="2.75" cy="12" r="0.9" fill="currentColor" />
  </svg>
)

function tabFromPath(pathname: string): AccountTab {
  if (pathname.startsWith('/accounts/yield')) return 'yield'
  if (pathname.startsWith('/accounts/wallets')) return 'wallets'
  return 'main'
}

function MoreButton({ name, open, toggle }: { name: string; open: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Open actions for ${name}`}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(event) => {
        event.stopPropagation()
        toggle()
      }}
      className={`flex h-[62px] w-12 items-center justify-center rounded-lg transition-colors hover:bg-[#ebebef] ${open ? 'bg-[#ebebef]' : ''}`}
    >
      <img src={rowMoreIcon} alt="" className="h-[62px] w-12" />
    </button>
  )
}

function RowMenu({ name, items }: { name: string; items: MenuItem[] }) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <ActionMenu items={items} trigger={({ open, toggle }) => <MoreButton name={name} open={open} toggle={toggle} />} />
    </div>
  )
}

const th = 'text-sm font-semibold leading-5 text-[#2a2a2a]'
const row =
  'group grid h-[62px] cursor-pointer items-center border-b border-[#e1e4ea] transition-colors last:border-b-0 hover:bg-[#f5f6f8]/70'

export default function AccountsHome() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = tabFromPath(pathname)
  const [toast, notify] = useToast()

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  useEffect(() => setFilters([]), [tab])
  const [hidden, setHidden] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>(() => [...createdStore.main, ...MAIN_ACCOUNTS])
  const [wallets, setWallets] = useState<Wallet[]>(() => [...createdStore.wallets, ...WALLETS])
  useEffect(() => {
    void backfillSokinAccounts().then((changed) => changed && setMainAccounts([...createdStore.main, ...MAIN_ACCOUNTS]))
  }, [])
  const [funding, setFunding] = useState<FundingAccount | null>(null)
  const [fundOpen, setFundOpen] = useState(false)
  const [providerFunding, setProviderFunding] = useState<FundingDetailsAccount | null>(null)
  const [providerOpen, setProviderOpen] = useState(false)

  const createParam = searchParams.get('create')
  const createOpen = createParam !== null
  const createKind: CreateKind | null = createParam === 'main' || createParam === 'wallet' ? createParam : null

  const openCreate = (kind: CreateKind | null) => setSearchParams({ create: kind ?? 'choose' })
  const closeCreate = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams])

  const onCreated = (created: CreatedAccount) => {
    if (created.kind === 'main') {
      const currency = CURRENCIES.find((c) => c.code === created.currency)
      const account: MainAccount = {
        id: `new-${Date.now()}`,
        name: created.label,
        flag: created.flag ?? currency?.flag ?? MAIN_ACCOUNTS[0].flag,
        // Sokin balances sit on a collection account held in Kredete's name — shown as a Collection account.
        kind: created.provider === 'sokin' ? 'Collection' : 'Checking',
        last4: '••••',
        symbol: created.symbol ?? symbolFor(created.currency),
        whole: '0.',
        cents: '00',
        status: 'pending',
        currency: created.currency,
        usdType: created.usdType,
        provider: created.provider,
        recipients: created.recipients,
        bank: created.bank,
        customerRef: created.provider === 'sokin' ? newCustomerRef() : undefined,
      }
      createdStore.main.unshift(account)
      saveCreated()
      if (created.provider === 'sokin') void backfillSokinAccounts().then((changed) => changed && setMainAccounts([...createdStore.main, ...MAIN_ACCOUNTS]))
      setMainAccounts((list) => [account, ...list])
    } else {
      const wallet: Wallet = {
        id: `new-${Date.now()}`,
        name: created.label,
        address: 'Generating address…',
        asset: created.asset,
        network: created.network,
        balance: `0.00 ${created.asset}`,
        status: 'pending',
      }
      createdStore.wallets.unshift(wallet)
      saveCreated()
      setWallets((list) => [wallet, ...list])
    }
    // Land on the tab that holds the new account; this also clears ?create and closes the drawer.
    navigate(created.kind === 'main' ? TAB_PATH.main : TAB_PATH.wallets, { replace: true })
    notify(`${created.label} is being set up`)
  }

  const q = query.trim().toLowerCase()
  const match = (...fields: string[]) => !q || fields.some((f) => f.toLowerCase().includes(q))
  // Filters only apply to groups that have a selection (OR within a group, AND across groups).
  const pass = (key: string, value: string | undefined) => {
    const allowed = filterValues(filters, key)
    return allowed.length === 0 || (value !== undefined && allowed.includes(value))
  }
  const mainRows = useMemo(
    () => mainAccounts.filter((a) => match(a.name, a.last4, a.kind) && pass('status', a.status) && pass('currency', a.currency) && pass('type', a.usdType ?? 'standard')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mainAccounts, q, filters],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const yieldRows = useMemo(() => YIELD_ACCOUNTS.filter((a) => match(a.name, a.asset) && pass('status', a.status) && pass('asset', a.asset)), [q, filters])
  const walletRows = useMemo(
    () => wallets.filter((w) => match(w.name, w.address, w.asset, w.network) && pass('status', w.status) && pass('asset', w.asset) && pass('network', w.network)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallets, q, filters],
  )

  const openDetail = (id: string) => navigate(`/accounts/detail?id=${id}`)
  const soon = (action: string, name: string) => () => notify(`${action} · ${name}`)

  const mainMenu = (a: MainAccount): MenuItem[] => [
    {
      label: 'Fund',
      icon: menuFundIcon,
      onSelect: () => {
        // Sokin-held accounts are funded with their own account details, not the bank transfer / crypto chooser.
        if (a.provider === 'sokin') {
          setProviderFunding({ name: a.name, currency: a.currency, provider: a.provider, last4: a.last4, recipients: a.recipients, bank: a.bank, customerRef: a.customerRef })
          setProviderOpen(true)
          return
        }
        setFunding({ id: a.id, name: a.name, currency: a.currency, usdType: a.usdType, last4: a.last4 })
        setFundOpen(true)
      },
    },
    { label: 'Send', icon: menuSendIcon, onSelect: soon('Send', a.name) },
    { label: 'Transfer', icon: menuTransferIcon, onSelect: soon('Transfer', a.name) },
    { label: 'Statement', icon: menuStatementIcon, onSelect: () => notify(`Statement for ${a.name} is downloading`) },
    { label: 'Configure', icon: menuConfigureIcon, onSelect: () => openDetail(a.id) },
  ]
  const yieldMenu = (a: { name: string }): MenuItem[] => [
    { label: 'Deposit', icon: menuFundIcon, onSelect: soon('Deposit', a.name) },
    { label: 'Withdraw', icon: menuWithdrawIcon, onSelect: soon('Withdraw', a.name) },
    { label: 'Statement', icon: menuStatementIcon, onSelect: () => notify(`Statement for ${a.name} is downloading`) },
  ]
  const walletMenu = (w: { name: string }): MenuItem[] => [
    { label: 'Fund', icon: menuFundIcon, onSelect: soon('Fund', w.name) },
    { label: 'Send', icon: menuSendIcon, onSelect: soon('Send', w.name) },
    { label: 'Statement', icon: menuStatementIcon, onSelect: () => notify(`Statement for ${w.name} is downloading`) },
  ]

  const activeTab = TABS.find((t) => t.key === tab)!
  const pageActions: MenuItem[] = [
    { label: 'Create main account', icon: tabBankIcon, onSelect: () => openCreate('main') },
    { label: 'Create wallet', icon: tabWalletIcon, onSelect: () => openCreate('wallet') },
    { label: 'Create yield account', icon: tabYieldIcon, onSelect: () => openCreate(null) },
    { label: 'Transfer funds', icon: menuTransferIcon, onSelect: () => notify('Transfer funds') },
  ]

  const balance = (
    <span className="font-heading text-[32px] font-semibold leading-10 tracking-[-0.32px]">
      <span className="text-[#4d5761]">$</span>
      <span className="text-[#1e1e2a]">{hidden ? '••••••••' : '25,144,707.08'}</span>
    </span>
  )

  return (
    <AppShell>
      <main className="flex w-full flex-col pb-16 pt-4">
        <header className="flex items-center justify-between border-b border-[#ebebeb] py-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-black">Accounts</h1>
            <p className="text-base leading-6 text-[#70707d]">Create and manage all your accounts in one place</p>
          </div>
          {COLLAPSE_PAGE_ACTIONS ? (
            <ActionsButton items={pageActions} />
          ) : (
            <HdsButton variant="secondary" onClick={() => notify('Transfer funds')}>
              Transfer funds
            </HdsButton>
          )}
        </header>

        <div className="flex flex-col">
          <nav className="relative flex items-center gap-8 border-b border-[#ebebeb] pt-5" aria-label="Account types">
            {TABS.map((t) => {
              const active = t.key === tab
              return (
                <Link
                  key={t.key}
                  to={TAB_PATH[t.key]}
                  className={`relative flex items-center gap-1.5 pb-3.5 text-base font-medium leading-6 transition-colors ${ active ? 'text-[#171717]' : 'text-[#70707d] hover:text-[#171717]' }`}
                >
                  <img src={t.icon} alt="" className={`size-5 transition-opacity ${active ? '' : 'opacity-60'}`} />
                  {t.label}
                  <span
                    className={`absolute inset-x-0 bottom-[-1px] h-1 bg-[#141b34] transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </Link>
              )
            })}
          </nav>

          <section className="flex items-center justify-between border-b border-[#ebebeb] py-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[13.78px] leading-5 text-[#535461]">Total balance</p>
                <span className="group relative">
                  <img src={infoIcon} alt="" className="size-3.5" />
                  <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111927] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Sum of all {activeTab.label.toLowerCase()} in USD
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {balance}
                <button
                  type="button"
                  onClick={() => setHidden((h) => !h)}
                  aria-label={hidden ? 'Show balance' : 'Hide balance'}
                  className="relative flex size-8 items-center justify-center rounded-full hover:bg-[#edeff2]"
                >
                  <img src={eyeIcon} alt="" className="h-[15.5px] w-[21.5px]" />
                  {hidden && <span className="absolute h-[2px] w-6 rotate-45 rounded bg-[#4d5761]" />}
                </button>
              </div>
            </div>
            {!COLLAPSE_PAGE_ACTIONS && (
              <HdsButton variant="primary" onClick={() => openCreate(CREATE_KIND[tab])}>
                {activeTab.create}
              </HdsButton>
            )}
          </section>

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <SearchField value={query} onChange={setQuery} placeholder="Search by name, number..." />
              <FilterMenu key={tab} groups={FILTERS[tab]} selected={filters} onChange={setFilters} icon={filterIcon} />
            </div>
            <HdsToggleSegment
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: <span className="flex items-center" aria-label="Grid view"><GridGlyph /></span> },
                { value: 'list', label: <span className="flex items-center" aria-label="List view"><ListGlyph /></span> },
              ]}
            />
          </div>

          <div key={`${tab}-${view}`} className="animate-[fadeIn_220ms_ease-out]">
            {tab === 'main' &&
              (view === 'list' ? (
                <div className="flex flex-col">
                  <div className="grid grid-cols-[1fr_220px_120px_48px] items-center gap-4 pb-4">
                    <p className={th}>Account</p>
                    <p className={`${th} text-right`}>Balance</p>
                    <p className={`${th} pl-3`}>Status</p>
                    <span />
                  </div>
                  {mainRows.map((a) => (
                    <div key={a.id} onClick={() => openDetail(a.id)} className={`${row} grid-cols-[1fr_220px_120px_48px] gap-4`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 py-1">
                          <span className="rounded-lg bg-[#cce2fc] p-1">
                            <Flag src={a.flag} />
                          </span>
                          <p className="font-heading text-base font-medium leading-6 tracking-[-0.08px] text-black">{a.name}</p>
                          {a.usdType === 'global' && (
                            <HdsBadge color="navy" size="sm">
                              Global USD
                            </HdsBadge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 px-1">
                          <img src={rowBankIcon} alt="" className="size-3.5" />
                          <p className="text-[11px] font-medium leading-4 text-[#555354]">{a.kind}</p>
                          <img src={maskDotsIcon} alt="" className="h-1 w-3" />
                          <p className="text-[11px] font-medium leading-4 text-[#555354]">{a.last4}</p>
                        </div>
                      </div>
                      <p className="whitespace-nowrap text-right font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#0f0e0e]">
                        {hidden ? '••••••' : (
                          <>
                            {a.symbol}
                            {a.whole}
                            <span className="text-[#525866]">{a.cents}</span>
                          </>
                        )}
                      </p>
                      <div className="pl-3">
                        <StatusPill status={a.status} />
                      </div>
                      <RowMenu name={a.name} items={mainMenu(a)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {mainRows.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => openDetail(a.id)}
                      className="flex cursor-pointer flex-col gap-6 rounded-2xl border border-[#e1e4ea] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(17,25,39,0.06)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#cce2fc] p-1">
                            <Flag src={a.flag} />
                          </span>
                          <p className="font-heading text-base font-medium text-black">{a.name}</p>
                        </div>
                        <StatusPill status={a.status} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="font-heading text-2xl font-semibold text-[#0f0e0e]">
                            {hidden ? '••••••' : (
                              <>
                                {a.symbol}
                                {a.whole}
                                <span className="text-[#525866]">{a.cents}</span>
                              </>
                            )}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] font-medium text-[#555354]">
                            <img src={rowBankIcon} alt="" className="size-3.5" />
                            {a.kind} •• {a.last4}
                          </p>
                        </div>
                        <RowMenu name={a.name} items={mainMenu(a)} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {tab === 'yield' && (
              <div className="flex flex-col">
                <div className="grid grid-cols-[1fr_140px_120px_160px_120px_48px] items-center gap-4 pb-4">
                  <p className={th}>Account</p>
                  <p className={th}>Asset</p>
                  <p className={th}>APY</p>
                  <p className={th}>Balance</p>
                  <p className={th}>Status</p>
                  <span />
                </div>
                {yieldRows.map((a) => (
                  <div key={a.id} onClick={() => openDetail(a.id)} className={`${row} grid-cols-[1fr_140px_120px_160px_120px_48px] gap-4`}>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#cce2fc] p-1">
                        <Flag src={MAIN_ACCOUNTS[0].flag} />
                      </span>
                      <p className="text-base font-medium leading-6 text-black">{a.name}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <img src={ASSET_LOGO[a.asset]} alt="" className="size-5 rounded-full object-cover" />
                      <p className="text-base font-medium leading-6 text-[#0f0e0e]">{a.asset}</p>
                    </div>
                    <p className="text-base font-medium leading-6 text-[#0f0e0e]">{a.apy}</p>
                    <p className="text-base font-medium leading-6 text-[#0f0e0e]">{hidden ? '••••••' : a.balance}</p>
                    <StatusPill status={a.status} />
                    <RowMenu name={a.name} items={yieldMenu(a)} />
                  </div>
                ))}
              </div>
            )}

            {tab === 'wallets' && (
              <div className="flex flex-col">
                <div className="grid grid-cols-[1fr_160px_160px_170px_120px_48px] items-center gap-4 pb-4">
                  <p className={th}>Wallet</p>
                  <p className={th}>Asset</p>
                  <p className={th}>Network</p>
                  <p className={th}>Balance</p>
                  <p className={th}>Status</p>
                  <span />
                </div>
                {walletRows.map((w) => (
                  <div key={w.id} onClick={() => openDetail(w.id)} className={`${row} grid-cols-[1fr_160px_160px_170px_120px_48px] gap-4`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 py-1">
                        <span className="rounded-lg bg-[#cce2fc] p-1">
                          <img src={walletRowIcon} alt="" className="size-4" />
                        </span>
                        <p className="text-base font-medium leading-6 text-black">{w.name}</p>
                      </div>
                      <p className="px-1 text-[11px] font-medium leading-4 text-[#555354]">{w.address}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <img src={ASSET_LOGO[w.asset]} alt="" className="size-5 rounded-full object-cover" />
                      <p className="text-base font-medium leading-6 text-[#0f0e0e]">{w.asset}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <NetworkLogo network={w.network} />
                      <p className="text-base font-medium leading-6 text-[#0f0e0e]">{w.network}</p>
                    </div>
                    <p className="text-base font-medium leading-6 text-[#0f0e0e]">{hidden ? '••••••' : w.balance}</p>
                    <StatusPill status={w.status} />
                    <RowMenu name={w.name} items={walletMenu(w)} />
                  </div>
                ))}
              </div>
            )}

            {((tab === 'main' && mainRows.length === 0) ||
              (tab === 'yield' && yieldRows.length === 0) ||
              (tab === 'wallets' && walletRows.length === 0)) && (
              <div className="flex flex-col items-center gap-3 py-16">
                <p className="text-sm text-[#70707d]">{query ? <>No accounts match “{query}”.</> : 'No accounts match these filters.'}</p>
                {filters.length > 0 && (
                  <HdsButton variant="link" size="sm" onClick={() => setFilters([])}>
                    Clear filters
                  </HdsButton>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <FundAccountDrawer account={funding} open={fundOpen} onClose={() => setFundOpen(false)} />
      <FundingDetailsDrawer account={providerFunding} open={providerOpen} onClose={() => setProviderOpen(false)} />
      <CreateAccountDrawer open={createOpen} initialKind={createKind} onClose={closeCreate} onCreated={onCreated} />
      {toast}
    </AppShell>
  )
}
