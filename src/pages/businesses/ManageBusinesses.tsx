import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsActionMenu, HdsBadge, HdsButton, HdsSearch, type ActionItem, type BadgeColor } from '../../components/ui/hds'
import breadcrumbCaret from '../../assets/icons/manage-businesses-breadcrumb-caret.svg'
import plusIcon from '../../assets/icons/manage-businesses-add-plus.svg'
import filterIcon from '../../assets/icons/manage-businesses-filter.svg'
import linkAlertSuccessCheck from '../../assets/icons/link-alert-success-check.svg'
import linkAlertClose from '../../assets/icons/link-alert-close.svg'
import rowMoreIcon from '../../assets/icons/manage-businesses-row-more.svg'
import paginationChevron from '../../assets/icons/manage-businesses-pagination-chevron.svg'
import iconOpen from '../../assets/icons/mb-open.svg'
import iconSetDefault from '../../assets/icons/mb-default.svg'
import iconTeam from '../../assets/icons/mb-team.svg'
import iconView from '../../assets/icons/mb-view.svg'
import iconResolve from '../../assets/icons/mb-resolve.svg'
import iconContinueKyb from '../../assets/icons/mb-kyb.svg'
import { type BusinessStatus } from '../../data/businesses'
import { useBusinessContext } from '../../context/BusinessContext'
import { startDraft, updateDraft } from './add/newBusinessDraft'

// Status copy verbatim from THIS table's own Figma node (46940:432497, "Businesses table" —
// Status column). Deliberately not the shared STATUS_LABEL in data/businesses.ts: that constant
// is being tuned by a parallel agent to match the Switcher component's copy (e.g. "In review"),
// which reads differently from what this table literally shows ("Verification pending").
const TABLE_STATUS_LABEL: Record<BusinessStatus, string> = {
  active: 'Active',
  'verification-pending': 'Verification pending',
  'action-required': 'Action required',
  'kyb-pending': 'KYB pending',
  'pending-approval': 'Pending approval',
}

// Status -> HDS Badge colour (Figma HDS 798:7), size sm to fit this dense table.
const STATUS_BADGE_COLOR: Record<BusinessStatus, BadgeColor> = {
  active: 'green',
  'verification-pending': 'navy',
  'action-required': 'red',
  'kyb-pending': 'grey',
  'pending-approval': 'amber',
}

function StatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <HdsBadge color={STATUS_BADGE_COLOR[status]} size="sm">
      {TABLE_STATUS_LABEL[status]}
    </HdsBadge>
  )
}

type Row = {
  id: string
  name: string
  type: string
  email: string
  owner: string
  teamLabel: string
  status: BusinessStatus
  plan: string
  dateAdded: string
}

// Literal row content from Figma node 46940:432497 ("Businesses table", clean state under
// "Manage 01 — Manage businesses (default)" / 46940:432386). Display fields (email/owner/team
// count/plan/date) are kept Figma-literal rather than sourced from src/data/businesses.ts, but
// `id` is mapped onto that shared dataset's real ids (not a local slug) so "Open business" /
// "Set as default" here update the same BusinessContext the TopBar switcher reads — picking a
// business in this table and seeing it reflected in the switcher (and vice versa) now works for
// every row, not just Acme Trading Co. The switcher and this table list the same 6 businesses.
const ROWS: Row[] = [
  {
    id: 'acme-trading',
    name: 'Acme Trading Co.',
    type: 'Limited company',
    email: 'finance@acme.co',
    owner: 'You',
    teamLabel: '6 members',
    status: 'active',
    plan: 'Growth',
    dateAdded: 'Jan 6, 2025',
  },
  {
    id: 'northwind-design',
    name: 'Bright Logistics Ltd',
    type: 'Limited company',
    email: 'ops@bright.co',
    owner: 'Chris Oakley',
    teamLabel: '3 members',
    status: 'active',
    plan: 'Starter',
    dateAdded: 'Feb 12, 2025',
  },
  {
    id: 'meridian-legal',
    name: 'Northwind Foods',
    type: 'Limited company',
    email: 'hello@northwind.co',
    owner: 'You',
    teamLabel: '1 member',
    status: 'verification-pending',
    plan: '—',
    dateAdded: 'Apr 18, 2025',
  },
  {
    id: 'acme-print',
    name: 'Lisbon Creative Studio',
    type: 'Limited company',
    email: 'team@lagos.co',
    owner: 'You',
    teamLabel: '2 members',
    status: 'action-required',
    plan: '—',
    dateAdded: 'May 2, 2025',
  },
  {
    id: 'figma-inc',
    name: 'Kite Analytics',
    type: 'Sole proprietor',
    email: 'admin@kite.io',
    owner: 'Tyler Bates',
    teamLabel: '4 members',
    status: 'kyb-pending',
    plan: '—',
    dateAdded: 'May 20, 2025',
  },
  {
    id: 'hyperion-freight',
    name: 'Greenfield Farms',
    type: 'Limited company',
    email: 'g••••@g••••.com',
    owner: '—',
    teamLabel: '—',
    status: 'pending-approval',
    plan: '—',
    dateAdded: 'Jun 1, 2025',
  },
]

function DefaultBadge() {
  return (
    <HdsBadge color="navy" size="sm">
      Default
    </HdsBadge>
  )
}

const th = 'flex h-10 shrink-0 items-center whitespace-nowrap bg-[#edeff2] px-3 text-sm font-medium text-[#4b5563]'
const td = 'flex h-16 shrink-0 items-center border-b border-[#edeff2] px-3'

const STATUS_FILTERS: { value: BusinessStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: TABLE_STATUS_LABEL.active },
  { value: 'verification-pending', label: TABLE_STATUS_LABEL['verification-pending'] },
  { value: 'action-required', label: TABLE_STATUS_LABEL['action-required'] },
  { value: 'kyb-pending', label: TABLE_STATUS_LABEL['kyb-pending'] },
  { value: 'pending-approval', label: TABLE_STATUS_LABEL['pending-approval'] },
]

// Masks the exported glyph so it takes the menu item's text colour.
function MenuGlyph({ src, inset }: { src: string; inset: string }) {
  const url = `url(${JSON.stringify(src)})`
  return (
    <span className="relative block size-3 shrink-0">
      <span className="absolute bg-current" style={{ inset, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }} />
    </span>
  )
}
// Row-action icons exported from the design file (Figma 46940:432524 — office, toggle-on, user-multiple, view,
// checkmark-circle-02, clock-01), tinted to the menu text colour via MenuGlyph.
const ICONS = {
  open: { src: iconOpen, inset: '5.21%' },
  setDefault: { src: iconSetDefault, inset: '21.88% 5.21%' },
  team: { src: iconTeam, inset: '10.42% 2.08%' },
  view: { src: iconView, inset: '17.71% 5.21%' },
  resolve: { src: iconResolve, inset: '5.21%' },
  continueKyb: { src: iconContinueKyb, inset: '5.21%' },
}

const RowMoreTrigger = ({ label, open, toggle }: { label: string; open: boolean; toggle: () => void }) => (
  <button
    type="button"
    onClick={toggle}
    className={`flex size-8 items-center justify-center rounded-full transition-[background-color,opacity] hover:bg-[#edeff2] focus-visible:opacity-100 ${open ? 'bg-[#edeff2]' : ''}`}
    aria-label={label}
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <img src={rowMoreIcon} alt="" className="h-[1.75px] w-[8.75px]" />
  </button>
)

export default function ManageBusinesses() {
  const navigate = useNavigate()
  const location = useLocation()
  const { defaultBusinessId, setDefaultBusinessId, setCurrentBusinessId, addedBusinesses } = useBusinessContext()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  // Set by the KYB Review step's "Submit application" — shows the entered business name.
  const [submittedName, setSubmittedName] = useState<string | null>(
    (location.state as { submittedBusinessName?: string } | null)?.submittedBusinessName ?? null,
  )
  useEffect(() => {
    if (!submittedName) return
    const t = window.setTimeout(() => setSubmittedName(null), 6000)
    return () => window.clearTimeout(t)
  }, [submittedName])

  // Businesses created through "Add a new business" this session, newest first.
  const rows = useMemo<Row[]>(() => {
    const added: Row[] = addedBusinesses
      .slice()
      .reverse()
      .map((b) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        email: b.email,
        owner: 'You',
        teamLabel: `${b.teamCount} member${b.teamCount === 1 ? '' : 's'}`,
        status: b.status,
        plan: b.plan,
        dateAdded: b.dateAdded,
      }))
    const q = query.trim().toLowerCase()
    return [...added, ...ROWS].filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (!q || `${r.name} ${r.email} ${r.owner} ${r.type}`.toLowerCase().includes(q)),
    )
  }, [addedBusinesses, query, statusFilter])

  // "Open business" (Active only): simulates entering that business's workspace by making it
  // the current business (same context the TopBar switcher reads) and returning to the home
  // route, since there's no per-business dashboard route in this prototype to deep-link into.
  const openBusiness = (row: Row) => {
    setCurrentBusinessId(row.id)
    navigate('/')
  }

  // Manage 04 — Set as default moves the Default badge straight away and confirms it.
  const [defaultNotice, setDefaultNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!defaultNotice) return
    const t = window.setTimeout(() => setDefaultNotice(null), 5000)
    return () => window.clearTimeout(t)
  }, [defaultNotice])
  const makeDefault = (row: Row) => {
    setDefaultBusinessId(row.id)
    setDefaultNotice(row.name)
  }

  // "Resolve" (Action required) opens the business's KYB form with the field that needs attention
  // flagged — here the registration number that's already registered (Figma 48029:232475).
  const resolve = (row: Row) => {
    startDraft({ businessId: row.id, businessName: row.name, email: row.email, phoneCountry: 'US', phone: '(555) 000-0003', category: 'Food & Beverage', type: 'Private limited company' })
    updateDraft({
      registrationNumber: 'RC 1234567',
      dateOfIncorporation: '14/03/2018',
      countryOfIncorporation: 'Nigeria',
      countryOfOperation: 'Nigeria',
      tin: '12345678-0001',
      website: 'https://acmetrading.com',
      registeredAddress: '12 Marina Street, Lagos, 101233',
      proofType: 'Utility bill',
    })
    navigate('/businesses/add/company')
  }

  const actionsFor = (row: Row): ActionItem[] => {
    switch (row.status) {
      case 'active':
        return [
          { label: 'Open business', icon: <MenuGlyph {...ICONS.open} />, onSelect: () => openBusiness(row) },
          // Every Active row offers Open business, Set as default and Team; on the current default it's already set.
          { label: 'Set as default', icon: <MenuGlyph {...ICONS.setDefault} />, disabled: row.id === defaultBusinessId, onSelect: () => makeDefault(row) },
          { label: 'Team', icon: <MenuGlyph {...ICONS.team} />, onSelect: () => navigate('/team') },
        ]
      case 'verification-pending':
        // KYB is submitted and under review — nothing further is required from the customer.
        return [{ label: 'View status', icon: <MenuGlyph {...ICONS.view} />, onSelect: () => {} }]
      case 'action-required':
        // The closest thing this prototype has to a "provide the missing KYB info" entry point.
        return [{ label: 'Resolve', icon: <MenuGlyph {...ICONS.resolve} />, onSelect: () => resolve(row) }]
      case 'kyb-pending':
        return [{ label: 'Continue KYB', icon: <MenuGlyph {...ICONS.continueKyb} />, onSelect: () => navigate('/businesses/add/company') }]
      default:
        return []
    }
  }

  const activeFilterLabel = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label

  return (
    <AppShell>
      <main className="flex w-full flex-col items-start gap-6 pb-10 pt-8">
        <nav className="flex items-center gap-3 text-sm text-[#555354]">
          <Link to="/" className="hover:text-text-primary">
            Home
          </Link>
          <img src={breadcrumbCaret} alt="" className="h-4 w-4 rotate-180" />
          <span>Manage businesses</span>
        </nav>

        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-text-primary">
              Manage businesses
            </h1>
            <p className="text-sm text-[#4b5563]">
              Every business connected to your profile, with its status, plan and team.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <HdsButton variant="secondary" onClick={() => navigate('/businesses/link')}>
              Link existing business
            </HdsButton>
            <HdsButton
              variant="primary"
              onClick={() => navigate('/businesses/add')}
              leadingIcon={<img src={plusIcon} alt="" className="h-[11.67px] w-[11.67px]" />}
            >
              Add new business
            </HdsButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-3">
            <HdsSearch value={query} onChange={setQuery} placeholder="Search businesses" className="w-80" />
            <HdsActionMenu
              align="left"
              width={220}
              items={STATUS_FILTERS.map((f) => ({
                label: f.value === statusFilter ? `${f.label} ✓` : f.label,
                onSelect: () => setStatusFilter(f.value),
              }))}
              trigger={({ open, toggle }) => (
                <HdsButton
                  variant="ghost"
                  size="sm"
                  onClick={toggle}
                  aria-expanded={open}
                  className={open ? 'ring-1 ring-[#004b87]' : ''}
                  leadingIcon={<img src={filterIcon} alt="" className="h-[14.33px] w-[14.33px]" />}
                >
                  {statusFilter === 'all' ? 'Filter' : activeFilterLabel}
                </HdsButton>
              )}
            />
            {statusFilter !== 'all' && (
              <HdsButton variant="link" size="sm" onClick={() => setStatusFilter('all')}>
                Clear filter
              </HdsButton>
            )}
          </div>

          <div className="w-full">
            <div className="flex w-full">
              {/* Business */}
              <div className="flex flex-1 flex-col">
                <div className={`${th} rounded-l-lg`}>Business</div>
                {rows.map((row) => (
                  <div key={row.id} className="flex h-16 shrink-0 flex-col items-start justify-center gap-0.5 border-b border-[#edeff2] px-3">
                    <p className="truncate text-sm font-medium text-text-primary">{row.name}</p>
                    <p className="truncate text-[11px] text-[#6b7280]">{row.type}</p>
                  </div>
                ))}
              </div>

              {/* Business email */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Business email</div>
                {rows.map((row) => (
                  <div key={row.id} className={td}>
                    <p className="truncate text-sm font-medium text-text-primary">{row.email}</p>
                  </div>
                ))}
              </div>

              {/* Owner */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Owner</div>
                {rows.map((row) => (
                  <div key={row.id} className={td}>
                    <p className="truncate text-sm font-medium text-text-primary">{row.owner}</p>
                  </div>
                ))}
              </div>

              {/* Team members */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Team members</div>
                {rows.map((row) => (
                  <div key={row.id} className={td}>
                    <p className="text-sm font-medium text-text-primary">{row.teamLabel}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Status</div>
                {rows.map((row) => (
                  <div key={row.id} className={`${td} gap-1.5`}>
                    <StatusBadge status={row.status} />
                    {row.id === defaultBusinessId && <DefaultBadge />}
                  </div>
                ))}
              </div>

              {/* Plan */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Plan</div>
                {rows.map((row) => (
                  <div key={row.id} className={td}>
                    <p className="text-sm font-medium text-text-primary">{row.plan}</p>
                  </div>
                ))}
              </div>

              {/* Date added */}
              <div className="flex flex-1 flex-col">
                <div className={th}>Date added</div>
                {rows.map((row) => (
                  <div key={row.id} className={td}>
                    <p className="text-sm font-medium text-text-primary">{row.dateAdded}</p>
                  </div>
                ))}
              </div>

              {/* Row actions */}
              <div className="flex flex-1 flex-col">
                <div className={`${th} justify-center rounded-r-lg`} />
                {rows.map((row) => {
                  // Pending approval: "No actions displayed until the business owner responds" —
                  // hide the three-dot trigger entirely for these rows rather than show a dead button.
                  if (row.status === 'pending-approval') {
                    return <div key={row.id} className={`${td} justify-center`} />
                  }
                  return (
                    <div key={row.id} className={`${td} justify-center`}>
                      <HdsActionMenu
                        theme="light"
                        width={172}
                        items={actionsFor(row)}
                        trigger={({ open, toggle }) => <RowMoreTrigger label={`Open actions for ${row.name}`} open={open} toggle={toggle} />}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {rows.length === 0 && (
              <div className="flex flex-col items-center gap-1 border-b border-[#edeff2] py-10 text-center">
                <p className="text-sm font-medium text-[#111927]">No businesses found</p>
                <p className="text-xs text-[#6b7280]">Try a different search term or filter.</p>
              </div>
            )}

            <div className="flex w-full items-center justify-center gap-6 pt-6">
              <button type="button" aria-label="Previous page" onClick={() => setPage((n) => Math.max(1, n - 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#edeff2]">
                <img src={paginationChevron} alt="" className="h-[6px] w-[10.67px] rotate-90" />
              </button>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === page ? 'page' : undefined}
                    className={`flex size-8 items-center justify-center rounded-lg border text-sm transition-colors ${n === page ? 'border-[#cbd0d8] bg-white font-medium text-[#111927]' : 'border-transparent bg-[#edeff2] text-[#4b5563] hover:bg-[#e1e4e9]'}`}
                  >
                    {n}
                  </button>
                ))}
                <span className="flex size-8 items-center justify-center rounded-lg border border-[#cbd0d8] text-sm text-[#4b5563]">…</span>
              </div>
              <button type="button" aria-label="Next page" onClick={() => setPage((n) => Math.min(5, n + 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#edeff2]">
                <img src={paginationChevron} alt="" className="h-[6px] w-[10.67px] -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {defaultNotice && (
        <div role="status" className="fixed right-10 top-20 z-50 flex w-[400px] animate-[popIn_140ms_ease-out] items-start gap-3 rounded-[10px] border-[0.5px] border-[#0e9e74] bg-[#e6f7f1] py-4 pl-4 pr-3.5 shadow-sm">
          <img src={linkAlertSuccessCheck} alt="" className="h-[18px] w-[18px] shrink-0" />
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-semibold text-[#077155]">Default business updated</p>
            <p className="text-xs text-[#4b5563]">{defaultNotice} is now your default business.</p>
          </div>
          <button type="button" onClick={() => setDefaultNotice(null)} aria-label="Dismiss" className="shrink-0 opacity-65 hover:opacity-100">
            <img src={linkAlertClose} alt="" className="h-4 w-4" />
          </button>
        </div>
      )}
      {submittedName && (
        <div
          role="status"
          className="fixed right-10 top-20 z-50 flex w-[400px] animate-[popIn_140ms_ease-out] items-start gap-3 rounded-[10px] border-[0.5px] border-[#0e9e74] bg-[#e6f7f1] py-4 pl-4 pr-3.5 shadow-sm"
        >
          <img src={linkAlertSuccessCheck} alt="" className="h-[18px] w-[18px] shrink-0" />
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-semibold text-[#077155]">Application submitted</p>
            <p className="text-xs text-[#4b5563]">
              We&rsquo;re reviewing {submittedName}&rsquo;s KYB details. This usually takes 1–2 business days.
            </p>
          </div>
          <button type="button" onClick={() => setSubmittedName(null)} aria-label="Dismiss" className="shrink-0 opacity-65 hover:opacity-100">
            <img src={linkAlertClose} alt="" className="h-4 w-4" />
          </button>
        </div>
      )}
    </AppShell>
  )
}
