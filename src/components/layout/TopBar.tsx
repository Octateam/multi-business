import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moonIcon from '../../assets/icons/moon-02.svg'
import notificationIcon from '../../assets/icons/notification-03.svg'
import helpIcon from '../../assets/icons/help-circle.svg'
import BusinessSwitcher from './BusinessSwitcher'
import { DropdownMenu, HdsSearch, type SelectOption } from '../ui/hds'

// Global search destinations (not drawn in Figma): the pages and the start of each main flow.
const DESTINATIONS: (SelectOption & { to: string })[] = [
  { value: 'create-card', label: 'Create a card', description: 'Issue a virtual Visa card', to: '/cards/create', group: 'Actions' },
  { value: 'pay-vendor', label: 'Pay a vendor', description: 'Submit a vendor payment', to: '/pay-vendor', group: 'Actions' },
  { value: 'reimburse', label: 'Claim a reimbursement', description: 'Get paid back for a business expense', to: '/claim-reimbursement', group: 'Actions' },
  { value: 'add-bill', label: 'Add a bill', description: 'Enter or upload a bill', to: '/bills/add/manual-entry-empty', group: 'Actions' },
  { value: 'add-business', label: 'Add a business', description: 'Set up another entity', to: '/businesses/add', group: 'Actions' },
  { value: 'home', label: 'Home', to: '/', group: 'Pages' },
  { value: 'accounts', label: 'Accounts', description: 'Main accounts, yield accounts and wallets', to: '/accounts', group: 'Pages' },
  { value: 'cards', label: 'Cards', to: '/cards', group: 'Pages' },
  { value: 'expenses', label: 'Expenses overview', to: '/expenses/overview', group: 'Pages' },
  { value: 'requests', label: 'Requests', to: '/requests', group: 'Pages' },
  { value: 'bills', label: 'Bills', to: '/bills', group: 'Pages' },
  { value: 'vendors', label: 'Vendors', to: '/vendors', group: 'Pages' },
  { value: 'approvals', label: 'Approvals', to: '/approvals', group: 'Pages' },
  { value: 'transactions', label: 'Transactions', to: '/transactions', group: 'Pages' },
  { value: 'team', label: 'Team', to: '/team', group: 'Pages' },
  { value: 'businesses', label: 'Manage businesses', to: '/businesses', group: 'Pages' },
  { value: 'settings', label: 'Settings', to: '/settings', group: 'Pages' },
]

// Top bar search — HDS Search (1958:11). Typing opens the dark HDS menu of matching pages and actions.
function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
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

  const q = query.trim().toLowerCase()
  const results = DESTINATIONS.filter((d) => `${d.label} ${d.description ?? ''}`.toLowerCase().includes(q))

  return (
    <div ref={ref} className="relative w-80">
      <HdsSearch
        value={query}
        onChange={(v) => {
          setQuery(v)
          setOpen(v.trim().length > 0)
        }}
        placeholder="Search"
      />
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40">
          <DropdownMenu
            options={results}
            value={null}
            onSelect={(v) => {
              const hit = DESTINATIONS.find((d) => d.value === v)
              setOpen(false)
              setQuery('')
              if (hit) navigate(hit.to)
            }}
          />
        </div>
      )}
    </div>
  )
}

const iconButton = 'flex size-8 items-center justify-center rounded-pill bg-surface-2 transition-colors hover:bg-[#edeff2]'

export default function TopBar() {
  return (
    // 91px margins left and right — the same as the content column — with the bar's content aligned to it.
    <div className="flex h-[84px] w-full items-center border-b border-border-disabled bg-white px-[91px]">
      <div className="mx-auto flex w-full max-w-[1071px] items-center justify-between">
      <BusinessSwitcher />

      <div className="flex shrink-0 items-center gap-3">
        <GlobalSearch />
        <button type="button" className={iconButton}>
          <img src={moonIcon} alt="Toggle theme" className="size-3.5" />
        </button>
        <button type="button" className={iconButton}>
          <img src={notificationIcon} alt="Notifications" className="size-3.5" />
        </button>
        <button type="button" className={iconButton}>
          <img src={helpIcon} alt="Help" className="size-3.5" />
        </button>
        <div className="flex items-center gap-2 rounded-pill bg-surface-2 py-1 pl-1 pr-3">
          <div className="flex size-6 items-center justify-center rounded-pill bg-surface-3 text-[10px] font-semibold text-text-primary">
            JD
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
