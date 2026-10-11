import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { DropdownMenu, HdsActionMenu, HdsBadge, HdsButton, HdsSearch, type BadgeColor, type SelectOption } from '../../components/ui/hds'
import bankIcon from '../../assets/icons/cards-bank.svg'
import filterIcon from '../../assets/icons/cards-filter.svg'
import rowMoreIcon from '../../assets/icons/cards-row-more.svg'
import fundIcon from '../../assets/icons/cards-menu-fund.svg'
import withdrawIcon from '../../assets/icons/cards-menu-withdraw.svg'
import freezeIcon from '../../assets/icons/cards-menu-freeze.svg'
import viewIcon from '../../assets/icons/cards-menu-view.svg'
import { FundAccountDrawer, FundCardDrawer } from './FundDrawers'
import { CardDrawer, CardNotice, ConfirmCardModal, type CardAction } from './CardDrawers'
import { addCard, adjustAccountBalance, clearNotice, notify, updateCard, usd, useCardStore, type Card, type CardStatus } from './cardStore'
import physicalCardArt from '../../assets/images/card-thumb-physical.png'
import virtualCardArt from '../../assets/images/card-thumb-virtual.png'

// HDS Badge colours: Active = green, Deleted = red, Inactive = grey.
const STATUS_STYLE: Record<CardStatus, { label: string; color: BadgeColor }> = {
  active: { label: 'Active', color: 'green' },
  deleted: { label: 'Deleted', color: 'red' },
  inactive: { label: 'Inactive', color: 'grey' },
  frozen: { label: 'Frozen', color: 'info' },
}

const ROW_ACTIONS = [
  { label: 'Fund', icon: fundIcon, iconClass: 'size-3' },
  { label: 'Withdraw', icon: withdrawIcon, iconClass: 'size-3' },
  { label: 'Freeze', icon: freezeIcon, iconClass: 'h-[9.75px] w-[10.75px]' },
  { label: 'View detail', icon: viewIcon, iconClass: 'h-[7.75px] w-[10.75px]' },
]

// Filter menu (not designed in Figma) — status and card type, multi-select.
const FILTER_OPTIONS: SelectOption[] = [
  { value: 'status:active', label: 'Active', group: 'Status' },
  { value: 'status:inactive', label: 'Inactive', group: 'Status' },
  { value: 'status:deleted', label: 'Deleted', group: 'Status' },
  { value: 'type:Physical', label: 'Physical', group: 'Card type' },
  { value: 'type:Virtual', label: 'Virtual', group: 'Card type' },
]

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex w-[182px] flex-col gap-2">
      <p className="text-[13px] font-medium text-[#6b7280]">{label}</p>
      <p className="text-xl font-semibold text-[#111927]">{value}</p>
      <p className="text-xs text-[#9ca3af]">{note}</p>
    </div>
  )
}

/** HDS ghost button that opens the dark multi-select filter menu (click to open; outside click / Esc closes). */
function FilterMenu({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <HdsButton
        variant="ghost"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        leadingIcon={<img src={filterIcon} alt="" className="size-[14.33px]" />}
      >
        Filter{values.length > 0 && ` · ${values.length}`}
      </HdsButton>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[220px]">
          <DropdownMenu
            multiple
            options={FILTER_OPTIONS}
            values={values}
            onSelect={(v) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])}
            footer={
              <button
                type="button"
                disabled={values.length === 0}
                onClick={() => onChange([])}
                className="flex h-9 w-full items-center rounded-[10px] px-3.5 text-left text-[13px] font-medium text-white hover:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear filters
              </button>
            }
          />
        </div>
      )}
    </div>
  )
}

const th = 'bg-[#efefef] px-2.5 py-2 text-left text-sm font-medium text-[#525866]'
const td = 'h-[62px] border-b border-[#efefef] px-2.5 align-middle text-sm font-medium text-[#0e121b]'

type NewCard = { nickname: string; last4: string; assignee: string | null; funded: number }

export default function CardsHome() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { newCard?: NewCard } }
  const newCard = location.state?.newCard
  const { cards, accountBalance, notice } = useCardStore()
  // A card created in the Create card flow arrives in router state; add it to the shared store once.
  useEffect(() => {
    if (!newCard) return
    addCard({
      id: `new-${newCard.last4}`,
      assignee: newCard.assignee ?? 'General',
      assigneeRole: 'Admin',
      nickname: newCard.nickname,
      last4: newCard.last4,
      number: `4549 8800 5299 ${newCard.last4}`,
      expiry: '10/2031',
      cvv: '421',
      spentToday: 0,
      type: 'Virtual',
      balance: newCard.funded,
      status: 'active',
      purpose: 'General',
      limitType: 'Monthly',
      cap: 1000,
      spent: 0,
    })
    navigate('/cards', { replace: true, state: null })
  }, [newCard, navigate])
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  // Funding drawers (Figma 48041:238690 / 48041:237786), card drawer (48062:251993) and the confirm modal.
  const [viewCard, setViewCard] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ action: 'freeze' | 'unfreeze' | 'cancel'; card: Card } | null>(null)
  const [fundAccountOpen, setFundAccountOpen] = useState(false)
  const [fundCard, setFundCard] = useState<{ open: boolean; cardId: string | null }>({ open: false, cardId: null })
  const fundable = cards
    .filter((c) => c.status !== 'deleted')
    .map((c) => ({ id: c.id, nickname: c.nickname, last4: c.last4, assignee: c.assignee, balance: c.balance, frozen: c.status === 'frozen', statusLabel: STATUS_STYLE[c.status].label }))
  const onCardAction = (action: CardAction, card: Card) => {
    if (action === 'reassign') return navigate(`/cards/reassign?id=${card.id}`)
    if (action === 'edit') return navigate(`/cards/edit?id=${card.id}`)
    setConfirm({ action, card })
  }
  const confirmAction = () => {
    if (!confirm) return
    const { action, card } = confirm
    const next: CardStatus = action === 'freeze' ? 'frozen' : action === 'unfreeze' ? 'active' : 'deleted'
    updateCard(card.id, { status: next })
    if (action === 'freeze') notify('Card frozen', 'This card is now frozen and cannot be used for new purchases.')
    if (action === 'unfreeze') notify('Card unfrozen', 'This card is active again and can now be used for purchases.')
    if (action === 'cancel') notify('Card cancelled', `${card.nickname} has been closed permanently.`)
    setConfirm(null)
  }

  const q = query.trim().toLowerCase()
  const statusFilters = filters.filter((f) => f.startsWith('status:')).map((f) => f.slice(7))
  const typeFilters = filters.filter((f) => f.startsWith('type:')).map((f) => f.slice(5))
  const rows = cards.filter(
    (c) =>
      (!q || c.assignee.toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)) &&
      (statusFilters.length === 0 || statusFilters.includes(c.status)) &&
      (typeFilters.length === 0 || typeFilters.includes(c.type)),
  )

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-10 pb-10 pt-8">
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Cards</h1>
              <p className="text-base text-[#70707d]">Manage all your cards at a glance</p>
            </div>
            <div className="flex items-center gap-2">
              <HdsButton variant="secondary" onClick={() => setFundAccountOpen(true)}>
                Fund account
              </HdsButton>
              <HdsButton onClick={() => navigate('/cards/create')}>Create card</HdsButton>
            </div>
          </div>

          <div className="flex w-full items-center gap-10 border-b border-[#e5e7eb] py-6">
            <button type="button" onClick={() => navigate('/cards/account')} className="flex flex-col gap-2 rounded-lg text-left transition-opacity hover:opacity-80">
              <div className="flex items-center gap-1.5">
                <img src={bankIcon} alt="" className="size-4" />
                <p className="text-[13px] font-medium text-[#6b7280]">Card account balance</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-heading text-[30px] font-semibold leading-none text-[#111011]">{usd(accountBalance)}</p>
                <p className="flex items-center gap-1 text-[11px] font-medium text-[#2d2d2d]">
                  Checking account <span className="size-1 rounded-full bg-[#2d2d2d]" /> 4367
                </p>
              </div>
            </button>
            <span className="h-14 w-px bg-[#e5e7eb]" />
            <Stat label="Spent today" value={usd(cards.reduce((sum, c) => sum + c.spentToday, 0))} note={`Across ${cards.length} cards`} />
            <span className="h-14 w-px bg-[#e5e7eb]" />
            <Stat
              label="Active cards"
              value={`${cards.filter((c) => c.status === 'active').length} of ${cards.length}`}
              note={(['deleted', 'inactive', 'frozen'] as const)
                .map((st) => [st, cards.filter((c) => c.status === st).length] as const)
                .filter(([, n]) => n > 0)
                .map(([st, n]) => `${n} ${st}`)
                .join(' · ')}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center gap-3">
            <HdsSearch value={query} onChange={setQuery} placeholder="Search by assignee, card nickname" className="w-[300px]" />
            <FilterMenu values={filters} onChange={setFilters} />
          </div>

          <table className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col className="w-12" />
            </colgroup>
            <thead>
              <tr>
                <th className={`${th} rounded-l-lg`}>Assigned to</th>
                <th className={th}>Card detail</th>
                <th className={th}>Spent today</th>
                <th className={th}>Card type</th>
                <th className={th}>Balance</th>
                <th className={th}>Status</th>
                <th className={`${th} rounded-r-lg`} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="border-b border-[#efefef] px-2.5 py-10 text-center">
                    <p className="text-sm font-medium text-[#111927]">No cards match your search or filters</p>
                    <p className="mt-1 text-xs text-[#6b7280]">Try a different name, or clear the filters.</p>
                  </td>
                </tr>
              )}
              {rows.map((card) => {
                const status = STATUS_STYLE[card.status]
                return (
                  <tr
                    key={card.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, [role="menu"]')) return
                      navigate(`/cards/account?card=${card.id}`)
                    }}
                    className={`cursor-pointer transition-colors hover:bg-[#f8f9fa] ${card.id.startsWith('new-') ? 'bg-[#f8fbfe]' : ''}`}
                  >
                    <td className={td}>
                      <span className="flex items-center gap-2">
                        {card.assignee}
                        {card.id.startsWith('new-') && (
                          <HdsBadge color="navy" size="sm">
                            New
                          </HdsBadge>
                        )}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={card.type === 'Physical' ? physicalCardArt : virtualCardArt}
                          alt=""
                          className="h-6 w-[38px] shrink-0 rounded-[2px]"
                        />
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="truncate">{card.nickname}</p>
                          <p className="text-xs font-normal text-[#555354]">**{card.last4}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{usd(card.spentToday)}</td>
                    <td className={td}>{card.type}</td>
                    <td className={td}>{usd(card.balance)}</td>
                    <td className={td}>
                      <HdsBadge color={status.color} dot>
                        {status.label}
                      </HdsBadge>
                    </td>
                    <td className={`${td} text-center`}>
                      {/* Card actions (Figma 47475:371541): Fund · Withdraw · Freeze · View detail */}
                      <HdsActionMenu
                        theme="light"
                        width={152}
                        items={ROW_ACTIONS.map((action) => ({
                          label: action.label === 'Freeze' && card.status === 'frozen' ? 'Unfreeze' : action.label,
                          icon: <img src={action.icon} alt="" className={action.iconClass} />,
                          disabled: (card.status === 'deleted' && action.label !== 'View detail') || (action.label === 'Freeze' && card.status === 'inactive'),
                          onSelect:
                            action.label === 'Fund'
                              ? () => setFundCard({ open: true, cardId: card.status === 'frozen' ? null : card.id })
                              : action.label === 'Freeze'
                                ? () => setConfirm({ action: card.status === 'frozen' ? 'unfreeze' : 'freeze', card })
                                : action.label === 'View detail'
                                  ? () => setViewCard(card.id)
                                  : () => {},
                        }))}
                        trigger={({ open, toggle }) => (
                          <button
                            type="button"
                            onClick={toggle}
                            aria-label={`Open actions for ${card.nickname}`}
                            aria-haspopup="menu"
                            aria-expanded={open}
                            className={`mx-auto flex h-8 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#f5f6f8] ${open ? 'bg-[#edeff2]' : ''}`}
                          >
                            <img src={rowMoreIcon} alt="" className="h-[15px] w-[2.5px]" />
                          </button>
                        )}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      <FundAccountDrawer open={fundAccountOpen} onClose={() => setFundAccountOpen(false)} onFunded={(amount) => adjustAccountBalance(amount)} />
      <FundCardDrawer
        open={fundCard.open}
        cards={fundable}
        initialCardId={fundCard.cardId}
        accountBalance={accountBalance}
        onClose={() => setFundCard((f) => ({ ...f, open: false }))}
        onFunded={(id, amount) => {
          const c = cards.find((x) => x.id === id)
          if (c) updateCard(id, { balance: c.balance + amount })
          adjustAccountBalance(-amount)
        }}
      />
      <CardDrawer cardId={viewCard} onClose={() => setViewCard(null)} onAction={onCardAction} />
      {confirm && <ConfirmCardModal action={confirm.action} onClose={() => setConfirm(null)} onConfirm={confirmAction} />}
      {notice && <CardNotice title={notice.title} body={notice.body} onClose={clearNotice} />}
    </AppShell>
  )
}
