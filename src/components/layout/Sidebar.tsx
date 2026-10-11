import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebarContext } from '../../context/SidebarContext'
import { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './sidebarDimensions'
import logomark from '../../assets/icons/logomark.svg'
import logotype from '../../assets/icons/logotype.svg'
import sidebarLeft from '../../assets/icons/sidebar-left.svg'
import homeIcon from '../../assets/icons/home-01.svg'
import bankIcon from '../../assets/icons/bank.svg'
import paymentIcon from '../../assets/icons/payment-01.svg'
import inboxIcon from '../../assets/icons/inbox-download.svg'
import creditCardIcon from '../../assets/icons/credit-card.svg'
import invoiceIcon from '../../assets/icons/invoice-04.svg'
import userGroupIcon from '../../assets/icons/user-group-02.svg'
import checkmarkIcon from '../../assets/icons/checkmark-circle-01.svg'
import arrowUpDownIcon from '../../assets/icons/arrow-up-down.svg'
import analyticsIcon from '../../assets/icons/analytics-02.svg'
import settingsIcon from '../../assets/icons/settings-01.svg'
import chevron from '../../assets/icons/chevron-alt.svg'
import arrowDown01 from '../../assets/icons/arrow-down-01.svg'
import homeActive from '../../assets/icons/nav-active-home.svg'
import bankActive from '../../assets/icons/nav-active-bank.svg'
import paymentActive from '../../assets/icons/nav-active-payment.svg'
import collectionsActive from '../../assets/icons/nav-active-collections.svg'
import cardsActive from '../../assets/icons/nav-active-cards.svg'
import expensesActive from '../../assets/icons/nav-active-expenses.svg'
import teamActive from '../../assets/icons/nav-active-team.svg'
import approvalsActive from '../../assets/icons/nav-active-approvals.svg'
import transactionsActive from '../../assets/icons/nav-active-transactions.svg'
import accountingActive from '../../assets/icons/nav-active-accounting.svg'
import settingsActive from '../../assets/icons/nav-active-settings.svg'

// Solid, white versions of each nav icon (Hugeicons "Solid" style, as used on the selected
// "Cards" row in Figma node 46333:357617), shown only for the currently selected tab. Each
// carries its own glyph size since the solid glyphs don't fill the 16px box uniformly.
type ActiveIcon = { src: string; className: string }
const ACTIVE = {
  home: { src: homeActive, className: 'size-[14.33px]' },
  bank: { src: bankActive, className: 'size-4' },
  payment: { src: paymentActive, className: 'size-4' },
  collections: { src: collectionsActive, className: 'h-[13.83px] w-[13.67px]' },
  cards: { src: cardsActive, className: 'size-4' },
  expenses: { src: expensesActive, className: 'size-[14.33px]' },
  team: { src: teamActive, className: 'h-[11px] w-[13.66px]' },
  approvals: { src: approvalsActive, className: 'size-[14.33px]' },
  transactions: { src: transactionsActive, className: 'size-3' },
  accounting: { src: accountingActive, className: 'size-[13.67px]' },
  settings: { src: settingsActive, className: 'h-[14.33px] w-[14px]' },
} satisfies Record<string, ActiveIcon>

function NavIcon({ icon, activeIcon, active }: { icon: string; activeIcon: ActiveIcon; active: boolean }) {
  return (
    <span className="flex size-4 items-center justify-center">
      {active ? <img src={activeIcon.src} alt="" className={activeIcon.className} /> : <img src={icon} alt="" className="size-4" />}
    </span>
  )
}

type SubItem = { label: string; to: string; isActive: boolean }

// ---------- Simple (no sub-items) nav row ----------
function NavItem({
  icon,
  activeIcon,
  label,
  active = false,
  badge,
  to,
  collapsed,
}: {
  icon: string
  activeIcon: ActiveIcon
  label: string
  active?: boolean
  badge?: number
  to: string
  collapsed: boolean
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`flex w-full items-center rounded-pill px-3 py-2.5 ${
        collapsed ? 'justify-center' : 'justify-between'
      } ${active ? 'bg-white/5' : ''}`}
    >
      <div className={`flex items-center ${collapsed ? '' : 'gap-2'}`}>
        <span className="relative shrink-0">
          <NavIcon icon={icon} activeIcon={activeIcon} active={active} />
          {collapsed && badge !== undefined && (
            <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-brand" />
          )}
        </span>
        {!collapsed && (
          <span className={`text-sm font-medium ${active ? 'text-white' : 'text-text-quaternary'}`}>
            {label}
          </span>
        )}
      </div>
      {!collapsed && badge !== undefined && (
        <span className="flex items-center justify-center rounded-pill bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}

// ---------- Flyout used when the sidebar is collapsed, for rows with sub-items ----------
function CollapsedGroupFlyout({ label, subItems }: { label: string; subItems: SubItem[] }) {
  return (
    // Padding (not margin) creates the visual gap while keeping this element's hit-box
    // flush against the icon's right edge — so moving the cursor across the gap never
    // leaves a descendant of the hover wrapper, and the flyout doesn't close prematurely.
    <div className="absolute left-full top-0 z-40 pl-2">
      <div className="w-52 rounded-xl border border-white/10 bg-sidebar-bg p-2 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium text-white">{label}</p>
        <div className="flex flex-col gap-0.5">
          {subItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                item.isActive
                  ? 'bg-white/5 text-white'
                  : 'text-text-quaternary hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- A collapsible group row (Expenses / Payments / Collections / Accounting) ----------
function GroupNavItem({
  icon,
  activeIcon,
  label,
  collapsed,
  subItems,
  isOpen,
  onToggle,
}: {
  icon: string
  activeIcon: ActiveIcon
  label: string
  collapsed: boolean
  subItems: SubItem[]
  isOpen: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const groupHasActiveChild = subItems.some((item) => item.isActive)

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-expanded={isOpen}
        className={`flex w-full items-center rounded-pill px-3 py-2.5 ${
          collapsed ? 'justify-center' : 'justify-between'
        } ${
          // The parent row only ever shows an "active" highlight when collapsed (as a stand-in
          // for whichever sub-page is actually open, since the sub-items themselves aren't
          // visible to carry that indicator). Expanded, the open sub-item's own indicator is
          // enough, and highlighting the group header too would just be redundant.
          collapsed && groupHasActiveChild ? 'bg-white/5' : ''
        }`}
      >
        <div className={`flex items-center ${collapsed ? '' : 'gap-2'}`}>
          <NavIcon icon={icon} activeIcon={activeIcon} active={groupHasActiveChild} />
          {!collapsed && (
            <span
              className={`text-sm font-medium ${
                groupHasActiveChild ? 'text-white' : 'text-text-quaternary'
              }`}
            >
              {label}
            </span>
          )}
        </div>
        {!collapsed && (
          <img
            src={chevron}
            alt=""
            className={`h-[4.43px] w-[7.62px] transition-transform ${isOpen ? '' : 'rotate-180'}`}
          />
        )}
      </button>

      {!collapsed && isOpen && (
        <div className="relative w-full">
          <div className="absolute left-5 top-0 h-[calc(100%-4px)] w-[3px] rounded-sm bg-white/[0.35]" />
          <div className="flex w-full flex-col">
            {subItems.map((item) => (
              <div key={item.label} className="relative">
                {item.isActive && (
                  <div className="absolute left-[-28px] top-2 h-6 w-[3px] rounded-full bg-white" />
                )}
                <Link to={item.to} className="block w-full py-2 pl-12 pr-3">
                  <span className={`text-[13px] ${item.isActive ? 'text-white' : 'text-text-quaternary'}`}>
                    {item.label}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {collapsed && hovered && <CollapsedGroupFlyout label={label} subItems={subItems} />}
    </div>
  )
}

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return null
  return <p className="w-full text-[11px] font-medium text-white">{children}</p>
}

function isExpensesActive(pathname: string) {
  return (
    pathname === '/empty-state' ||
    pathname.startsWith('/request') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/claim-reimbursement') ||
    pathname.startsWith('/pay-vendor')
  )
}

export default function Sidebar() {
  const location = useLocation()
  const { pathname } = location
  const { collapsed, toggleCollapsed, openGroups, toggleGroup } = useSidebarContext()
  const isHome = pathname === '/'

  const expensesSubItems: SubItem[] = [
    { label: 'Overview', to: '/expenses/overview', isActive: pathname === '/expenses/overview' },
    { label: 'Requests', to: '/requests', isActive: isExpensesActive(pathname) },
    { label: 'Bills', to: '/bills', isActive: pathname.startsWith('/bills') },
    { label: 'Vendors', to: '/vendors', isActive: pathname.startsWith('/vendors') },
    { label: 'Budgets', to: '/expenses/budgets', isActive: pathname === '/expenses/budgets' },
  ]
  const paymentsSubItems: SubItem[] = [
    { label: 'Overview', to: '/payments/overview', isActive: pathname === '/payments/overview' },
    { label: 'Send money', to: '/payments/send-money', isActive: pathname === '/payments/send-money' },
    { label: 'Bulk payments', to: '/payments/bulk-payments', isActive: pathname === '/payments/bulk-payments' },
  ]
  const collectionsSubItems: SubItem[] = [
    { label: 'Overview', to: '/collections/overview', isActive: pathname === '/collections/overview' },
    { label: 'Invoices', to: '/collections/invoices', isActive: pathname === '/collections/invoices' },
    { label: 'Payment links', to: '/collections/payment-links', isActive: pathname === '/collections/payment-links' },
  ]
  const accountingSubItems: SubItem[] = [
    { label: 'Overview', to: '/accounting/overview', isActive: pathname === '/accounting/overview' },
    { label: 'Reports', to: '/accounting/reports', isActive: pathname === '/accounting/reports' },
    { label: 'Reconciliation', to: '/accounting/reconciliation', isActive: pathname === '/accounting/reconciliation' },
  ]

  return (
    <div
      className="flex h-full shrink-0 flex-col justify-between border border-white/10 bg-sidebar-bg pb-6 pt-8 transition-[width] duration-200"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
    >
      <div className={`flex w-full flex-col gap-3.5 ${collapsed ? 'px-2.5' : 'px-4'}`}>
        <div className={`flex w-full items-center ${collapsed ? 'flex-col gap-4' : 'justify-between'}`}>
          <Link to="/" className="flex items-center gap-1.5">
            <img src={logomark} alt="" className="h-4" />
            {!collapsed && <img src={logotype} alt="hinstantt" className="h-3.5" />}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex size-6 items-center justify-center rounded-md hover:bg-white/5"
          >
            <img src={sidebarLeft} alt="" className={`size-4 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex w-full flex-col gap-2 pb-2">
          <NavItem icon={homeIcon} activeIcon={ACTIVE.home} label="Home" to="/" active={isHome} collapsed={collapsed} />
          <NavItem icon={bankIcon} activeIcon={ACTIVE.bank} label="Accounts" to="/accounts" active={pathname.startsWith('/accounts')} collapsed={collapsed} />
          <GroupNavItem
            icon={paymentIcon}
            activeIcon={ACTIVE.payment}
            label="Payments"
            collapsed={collapsed}
            subItems={paymentsSubItems}
            isOpen={openGroups.payments}
            onToggle={() => toggleGroup('payments')}
          />
          <GroupNavItem
            icon={inboxIcon}
            activeIcon={ACTIVE.collections}
            label="Collections"
            collapsed={collapsed}
            subItems={collectionsSubItems}
            isOpen={openGroups.collections}
            onToggle={() => toggleGroup('collections')}
          />
          <NavItem icon={creditCardIcon} activeIcon={ACTIVE.cards} label="Cards" to="/cards" active={pathname.startsWith('/cards')} collapsed={collapsed} />
        </div>

        <div className="flex w-full flex-col gap-3.5 pb-2">
          <div className={`flex w-full flex-col gap-2 ${collapsed ? '' : 'items-end'}`}>
            <SectionLabel collapsed={collapsed}>OPERATIONS</SectionLabel>

            <GroupNavItem
              icon={invoiceIcon}
              activeIcon={ACTIVE.expenses}
              label="Expenses"
              collapsed={collapsed}
              subItems={expensesSubItems}
              isOpen={openGroups.expenses}
              onToggle={() => toggleGroup('expenses')}
            />

            <NavItem
              icon={userGroupIcon}
              activeIcon={ACTIVE.team}
              label="Team"
              to="/team"
              active={pathname.startsWith('/team')}
              badge={7}
              collapsed={collapsed}
            />
            <NavItem icon={checkmarkIcon} activeIcon={ACTIVE.approvals} label="Approvals" to="/approvals" active={pathname.startsWith('/approvals')} badge={3} collapsed={collapsed} />
            <NavItem icon={arrowUpDownIcon} activeIcon={ACTIVE.transactions} label="Transactions" to="/transactions" active={pathname.startsWith('/transactions')} collapsed={collapsed} />
            <GroupNavItem
              icon={analyticsIcon}
              activeIcon={ACTIVE.accounting}
              label="Accounting"
              collapsed={collapsed}
              subItems={accountingSubItems}
              isOpen={openGroups.accounting}
              onToggle={() => toggleGroup('accounting')}
            />
          </div>
        </div>

        <NavItem icon={settingsIcon} activeIcon={ACTIVE.settings} label="Settings" to="/settings" active={pathname.startsWith('/settings')} collapsed={collapsed} />
      </div>

      <div className={`flex w-full flex-col gap-4 ${collapsed ? 'px-2.5' : 'px-4'}`}>
        <div className={`flex w-full items-center gap-4 rounded-pill py-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`flex items-center gap-2 ${collapsed ? '' : 'flex-1'}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-medium text-black">
              JD
            </div>
            {!collapsed && (
              <div className="flex flex-col text-white">
                <p className="text-base leading-6">John Doe</p>
                <p className="text-sm leading-5">johndoe@hinstantt.com</p>
              </div>
            )}
          </div>
          {!collapsed && <img src={arrowDown01} alt="" className="size-6 -rotate-90" />}
        </div>
      </div>
    </div>
  )
}
