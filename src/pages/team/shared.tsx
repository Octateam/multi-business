import { useState } from 'react'
import { BUSINESSES } from '../../data/businesses'
import {
  HdsActionMenu,
  HdsBadge,
  HdsButton,
  HdsSearch,
  HdsSelect,
  HdsToggleSegment,
  type BadgeColor,
  type SelectOption,
} from '../../components/ui/hds'

import iconFilter from '../../assets/icons/dashboard-filter.svg'
import iconPlus from '../../assets/icons/list1-plus.svg'
import iconRowMenuDots from '../../assets/icons/dashboard-row-menu-dots.svg'
import iconPaginationArrow from '../../assets/icons/vendors-icon-pagination-arrow.svg'

/* ---------------------------------------------------------------------- */
/*  Data — Figma node 46940:435333 ("Admin — Team: Members (default        */
/*  view) — Redesign")                                                     */
/* ---------------------------------------------------------------------- */

export type MemberStatus = 'Active' | 'Invited' | 'Deactivated'

export type MemberRow = {
  id: string
  name: string
  email: string
  role: string
  dateJoined: string
  status: MemberStatus
}

// Matches the member rows visible in the Figma frame exactly.
export const MEMBERS: MemberRow[] = [
  { id: 'isabel-hastings', name: 'Isabel Hastings', email: 'isabel@fracisoltd.com', role: 'Admin', dateJoined: 'Jan 6, 9:45PM', status: 'Active' },
  { id: 'dana-avery', name: 'Dana Avery', email: 'dana@fracisoltd.com', role: 'Operations', dateJoined: 'Jan 6, 9:45PM', status: 'Active' },
  { id: 'kevin-vance', name: 'Kevin Vance', email: 'kevin@fracisoltd.com', role: 'Finance Manager', dateJoined: 'Jan 6, 9:45PM', status: 'Active' },
  { id: 'sarah-owens', name: 'Sarah Owens', email: 'sarah@fracisoltd.com', role: 'Admin', dateJoined: 'Jan 6, 9:45PM', status: 'Invited' },
  { id: 'tyler-bates', name: 'Tyler Bates', email: 'tyler@fracisoltd.com', role: 'Operations', dateJoined: 'Jan 8, 9:45PM', status: 'Active' },
  { id: 'grace-jameson', name: 'Grace Jameson', email: 'grace@fracisoltd.com', role: 'Admin', dateJoined: 'Jan 19, 9:45PM', status: 'Active' },
  { id: 'amelia-matthews', name: 'Amelia Matthews', email: 'amelia@fracisoltd.com', role: 'Finance Manager', dateJoined: 'Jan 6, 9:45PM', status: 'Deactivated' },
]

export type BusinessAccessGrant = { businessName: string; role: string }

export type PendingInviteRow = {
  id: string
  name: string
  email: string
  phone: string
  invitedOn: string
  invitedAt?: string
  businessAccess: BusinessAccessGrant[]
}

// The first row ("Anthony Johnson") matches the Figma "Review invite" drawer's example data
// exactly (personal info + "Business 1"/"Business 2" business access), per the task brief.
// The remaining 6 rows reuse real business names from src/data/businesses.ts (BUSINESSES)
// instead of fabricating new company names, while still demonstrating the same
// per-business role assignment pattern the drawer renders.
export const PENDING_INVITES: PendingInviteRow[] = [
  {
    id: 'anthony-johnson',
    name: 'Anthony Johnson',
    email: 'ajohn@fracisoltd.com',
    phone: '+1 (555) 000-0003',
    invitedOn: 'Jan 21, 2026',
    businessAccess: [
      { businessName: 'Northwind Foods', role: 'Admin' },
      { businessName: 'Lisbon Creative Studio', role: 'Finance Manager' },
    ],
  },
  {
    id: 'priya-raman',
    name: 'Priya Raman',
    email: 'priya@fracisoltd.com',
    phone: '+1 (555) 000-0012',
    invitedOn: 'Jan 20, 2026',
    businessAccess: [{ businessName: BUSINESSES[0].name, role: 'Operations' }],
  },
  {
    id: 'daniel-oakes',
    name: 'Daniel Oakes',
    email: 'daniel@fracisoltd.com',
    phone: '+1 (555) 000-0019',
    invitedOn: 'Jan 19, 2026',
    businessAccess: [
      { businessName: BUSINESSES[1].name, role: 'Finance Manager' },
      { businessName: BUSINESSES[2].name, role: 'Admin' },
    ],
  },
  {
    id: 'ruth-anderson',
    name: 'Ruth Anderson',
    email: 'ruth@fracisoltd.com',
    phone: '+1 (555) 000-0027',
    invitedOn: 'Jan 18, 2026',
    businessAccess: [{ businessName: BUSINESSES[3].name, role: 'Admin' }],
  },
  {
    id: 'michael-ellis',
    name: 'Michael Ellis',
    email: 'michael@fracisoltd.com',
    phone: '+1 (555) 000-0031',
    invitedOn: 'Jan 17, 2026',
    businessAccess: [{ businessName: BUSINESSES[4].name, role: 'Operations' }],
  },
  {
    id: 'florence-upton',
    name: 'Florence Upton',
    email: 'florence@fracisoltd.com',
    phone: '+1 (555) 000-0044',
    invitedOn: 'Jan 15, 2026',
    businessAccess: [{ businessName: BUSINESSES[5].name, role: 'Finance Manager' }],
  },
  {
    id: 'carl-nielsen',
    name: 'Carl Nielsen',
    email: 'carl@fracisoltd.com',
    phone: '+1 (555) 000-0050',
    invitedOn: 'Jan 14, 2026',
    businessAccess: [
      { businessName: BUSINESSES[0].name, role: 'Admin' },
      { businessName: BUSINESSES[2].name, role: 'Operations' },
    ],
  },
]

/** Invitations shown under Pending → Invitations (Teams 48029:229952). */
export const INVITATIONS: PendingInviteRow[] = PENDING_INVITES.slice(0, 3).map((i) => ({ ...i, invitedAt: '2:14pm' }))

/* ---------------------------------------------------------------------- */
/*  Access requests — people asking to join this business (48029:229297)   */
/* ---------------------------------------------------------------------- */

export type AccessRequestRow = { id: string; name: string; email: string; company: string; requestedOn: string; requestedAt: string }

export const ACCESS_REQUESTS: AccessRequestRow[] = [
  { id: 'ava-olsson', name: 'Ava Olsson', email: 'aolsson@abcltd.com', company: 'ABC Ltd', requestedOn: 'Jan 6, 2025', requestedAt: '2:14pm' },
  { id: 'tina-brooks', name: 'Tina Brooks', email: 'tina@lisboncreative.co', company: 'Lisbon Creative', requestedOn: 'Jan 6, 2025', requestedAt: '2:14pm' },
  { id: 'felix-adler', name: 'Felix Adler', email: 'felix@northwindfoods.com', company: 'Northwind Foods', requestedOn: 'Jan 6, 2025', requestedAt: '2:14pm' },
  { id: 'sarah-owens', name: 'Sarah Owens', email: 'sarah@fracisoltd.com', company: 'Fracis Ltd', requestedOn: 'Jan 6, 2025', requestedAt: '2:14pm' },
]

/* ---------------------------------------------------------------------- */
/*  Roles (team-invite role picker + filter)                               */
/* ---------------------------------------------------------------------- */

export const TEAM_ROLES: SelectOption[] = [
  { value: 'Admin', label: 'Admin', description: 'Full access, incl. team & settings' },
  { value: 'Finance Manager', label: 'Finance Manager', description: 'Payments, bills, cards & approvals' },
  { value: 'Operations', label: 'Operations', description: 'Create requests, bills & vendors' },
  { value: 'Approver', label: 'Approver', description: 'Approve or reject requests & bills' },
  { value: 'Bookkeeper', label: 'Bookkeeper', description: 'Expenses, receipts & exports' },
  { value: 'Viewer', label: 'Viewer', description: 'Read-only access' },
]

/* ---------------------------------------------------------------------- */
/*  Status pill — HDS Badge                                                */
/* ---------------------------------------------------------------------- */

const MEMBER_STATUS_COLOR: Record<MemberStatus, BadgeColor> = {
  Active: 'green',
  Invited: 'navy',
  Deactivated: 'red',
}

export function MemberStatusPill({ status }: { status: MemberStatus }) {
  return (
    <HdsBadge color={MEMBER_STATUS_COLOR[status]} dot>
      {status}
    </HdsBadge>
  )
}

/* ---------------------------------------------------------------------- */
/*  Page header                                                            */
/* ---------------------------------------------------------------------- */

export function TeamPageHeader() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Team</h1>
        <p className="text-base text-[#70707d]">Manage your people, roles, and permissions.</p>
      </div>
      <div className="h-px w-full bg-[#edeff2]" />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  View toggle (All / Pending invites)                                    */
/* ---------------------------------------------------------------------- */

export type TeamTab = 'all' | 'pending'

export function TeamViewToggle({
  active,
  pendingCount,
  onChange,
}: {
  active: TeamTab
  pendingCount: number
  onChange: (tab: TeamTab) => void
}) {
  return (
    <HdsToggleSegment
      className="self-start"
      options={[
        { value: 'all' as TeamTab, label: 'All members' },
        { value: 'pending' as TeamTab, label: `Pending (${pendingCount})` },
      ]}
      value={active}
      onChange={onChange}
    />
  )
}

/* ---------------------------------------------------------------------- */
/*  Search / filter / invite bar                                           */
/* ---------------------------------------------------------------------- */

export function TeamSearchBar({
  onInvite,
  query = '',
  onQueryChange,
  roleFilter = 'all',
  onRoleFilterChange,
  onManageRoles,
}: {
  onManageRoles?: () => void
  onInvite?: () => void
  query?: string
  onQueryChange?: (q: string) => void
  roleFilter?: string
  onRoleFilterChange?: (role: string) => void
}) {
  const filters = [{ value: 'all', label: 'All roles' }, ...TEAM_ROLES.map((r) => ({ value: r.value, label: r.label }))]
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <HdsSearch value={query} onChange={(q) => onQueryChange?.(q)} placeholder="Search team member" className="w-[320px]" />
        <HdsActionMenu
          align="left"
          width={200}
          items={filters.map((f) => ({
            label: f.value === roleFilter ? `${f.label} ✓` : f.label,
            onSelect: () => onRoleFilterChange?.(f.value),
          }))}
          trigger={({ open, toggle }) => (
            <HdsButton
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-expanded={open}
              className={open ? 'ring-1 ring-[#004b87]' : ''}
              leadingIcon={<img src={iconFilter} alt="" className="h-[14.33px] w-[14.33px]" />}
            >
              {roleFilter === 'all' ? 'Filter' : roleFilter}
            </HdsButton>
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <HdsButton variant="secondary" size="sm" shape="pill" className="px-6" onClick={onManageRoles}>
          Manage roles
        </HdsButton>
        <HdsButton
          variant="primary"
          size="sm"
          shape="pill"
          className="px-6"
          onClick={onInvite}
          leadingIcon={<img src={iconPlus} alt="" className="h-[11.67px] w-[11.67px]" />}
        >
          Invite
        </HdsButton>
      </div>
    </div>
  )
}

const RowDotsTrigger = ({ label, open, toggle }: { label: string; open: boolean; toggle: () => void }) => (
  <button
    type="button"
    onClick={toggle}
    className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#edeff2] ${open ? 'bg-[#edeff2]' : ''}`}
    aria-label={label}
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <img src={iconRowMenuDots} alt="" className="h-[15px] w-[2.5px]" />
  </button>
)

const EmptyRows = ({ text }: { text: string }) => (
  <div className="flex w-full flex-col items-center gap-1 border-b border-[#efefef] py-10 text-center">
    <p className="text-sm font-medium text-[#111927]">{text}</p>
    <p className="text-xs text-[#6b7280]">Try a different search term or filter.</p>
  </div>
)

/* ---------------------------------------------------------------------- */
/*  Members table ("All" tab)                                              */
/* ---------------------------------------------------------------------- */

export function MembersTable({
  rows,
  onDeactivateRow,
  onReactivateRow,
  onRemoveRow,
}: {
  rows: MemberRow[]
  onDeactivateRow?: (row: MemberRow) => void
  onReactivateRow?: (row: MemberRow) => void
  onRemoveRow?: (row: MemberRow) => void
}) {
  const th = 'flex h-9 shrink-0 items-center bg-[#efefef] px-2.5 text-sm font-medium text-[#525866]'
  const td = 'flex h-[62px] shrink-0 items-center border-b border-[#efefef] px-2.5'

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-full min-w-[1071px]">
        <div className="flex w-[206px] shrink-0 flex-col">
          <div className={`${th} rounded-l-lg`}>Name</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.name}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[206px] shrink-0 flex-col">
          <div className={th}>Email</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.email}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[206px] shrink-0 flex-col">
          <div className={th}>Role</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.role}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[206px] shrink-0 flex-col">
          <div className={th}>Date joined</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.dateJoined}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[205px] shrink-0 flex-col">
          <div className={th}>Status</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <MemberStatusPill status={r.status} />
            </div>
          ))}
        </div>
        <div className="flex w-[42px] shrink-0 flex-col">
          <div className={`${th} rounded-r-lg`} />
          {rows.map((r) => {
            const items = [
              ...(r.status !== 'Deactivated' && onDeactivateRow ? [{ label: 'Deactivate', onSelect: () => onDeactivateRow(r) }] : []),
              ...(r.status === 'Deactivated' && onReactivateRow ? [{ label: 'Reactivate', onSelect: () => onReactivateRow(r) }] : []),
              ...(onRemoveRow ? [{ label: 'Remove from team', tone: 'danger' as const, onSelect: () => onRemoveRow(r) }] : []),
            ]
            return (
              <div key={r.id} className="flex h-[62px] shrink-0 items-center justify-center border-b border-[#efefef]">
                {items.length > 0 ? (
                  <HdsActionMenu
                    width={200}
                    items={items}
                    trigger={({ open, toggle }) => <RowDotsTrigger label={`Open actions for ${r.name}`} open={open} toggle={toggle} />}
                  />
                ) : (
                  <img src={iconRowMenuDots} alt="" className="h-[15px] w-[2.5px] opacity-40" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      {rows.length === 0 && <EmptyRows text="No team members found" />}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pending invites table                                                  */
/* ---------------------------------------------------------------------- */

function BusinessAccessCell({ grants }: { grants: BusinessAccessGrant[] }) {
  const [first, ...rest] = grants
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-medium text-[#222121]">{first.businessName}</p>
      <p className="text-[11px] text-[#9aa1ac]">
        {first.role}
        {rest.length > 0 ? ` +${rest.length} more` : ''}
      </p>
    </div>
  )
}

export function PendingInvitesTable({
  rows,
  onReviewRow,
  onRevokeRow,
}: {
  rows: PendingInviteRow[]
  onReviewRow?: (row: PendingInviteRow) => void
  onRevokeRow?: (row: PendingInviteRow) => void
}) {
  const th = 'flex h-9 shrink-0 items-center bg-[#efefef] px-2.5 text-sm font-medium text-[#525866]'
  const td = 'flex h-[62px] shrink-0 items-center border-b border-[#efefef] px-2.5'

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-full min-w-[1071px]">
        <div className="flex w-[206px] shrink-0 flex-col">
          <div className={`${th} rounded-l-lg`}>Invitee</div>
          {rows.map((r) => (
            <div key={r.id} className="flex h-[62px] shrink-0 flex-col justify-center gap-0.5 border-b border-[#efefef] px-2.5">
              <p className="text-sm font-medium text-[#222121]">{r.name}</p>
              <p className="text-[11px] text-[#9aa1ac]">{r.email}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[260px] shrink-0 flex-col">
          <div className={th}>Business access</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <BusinessAccessCell grants={r.businessAccess} />
            </div>
          ))}
        </div>
        <div className="flex w-[180px] shrink-0 flex-col">
          <div className={th}>Invited on</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.invitedOn}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[205px] shrink-0 flex-col">
          <div className={th}>Status</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <HdsBadge color="amber" dot>
                Pending
              </HdsBadge>
            </div>
          ))}
        </div>
        <div className="flex w-[138px] shrink-0 flex-col">
          <div className={`${th} rounded-r-lg`} />
          {rows.map((r) => (
            <div key={r.id} className="flex h-[62px] shrink-0 items-center justify-end gap-2 border-b border-[#efefef] px-2.5">
              <HdsButton variant="secondary" size="sm" onClick={() => onReviewRow?.(r)}>
                Review
              </HdsButton>
              {onRevokeRow ? (
                <HdsActionMenu
                  width={180}
                  items={[
                    { label: 'Resend invite', onSelect: () => {} },
                    { label: 'Revoke invite', tone: 'danger', onSelect: () => onRevokeRow(r) },
                  ]}
                  trigger={({ open, toggle }) => <RowDotsTrigger label={`More actions for ${r.name}`} open={open} toggle={toggle} />}
                />
              ) : (
                <img src={iconRowMenuDots} alt="" className="mx-3 h-[15px] w-[2.5px] opacity-40" />
              )}
            </div>
          ))}
        </div>
      </div>
      {rows.length === 0 && <EmptyRows text="No pending invites" />}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pagination (same demo convention as bills2 / vendors list screens)     */
/* ---------------------------------------------------------------------- */

export function TeamPagination() {
  const [page, setPage] = useState(2)
  const [perPage, setPerPage] = useState(20)
  return (
    <div className="flex w-full items-center justify-between pt-2">
      <p className="px-2.5 py-1.5 text-sm text-[#9aa1ac]">Page {page} of 12</p>
      <div className="flex items-center gap-6">
        <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8]">
          <img src={iconPaginationArrow} alt="" className="size-5 rotate-180" />
        </button>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === page ? 'page' : undefined}
              className={`flex size-8 items-center justify-center rounded-lg text-sm transition-colors ${ n === page ? 'bg-[#111927] font-medium text-white' : 'border border-[#e1e4e9] text-[#4b5563] hover:bg-[#f5f6f8]' }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(5, p + 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8]">
          <img src={iconPaginationArrow} alt="" className="size-5" />
        </button>
      </div>
      <div className="w-[176px]">
        <HdsSelect
          size="sm"
          value={String(perPage)}
          onChange={(v) => setPerPage(Number(v))}
          options={[10, 20, 50, 100].map((n) => ({ value: String(n), label: `Show ${n} items` }))}
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pending → Invitations / Access requests sub-tabs (48029:229952)        */
/* ---------------------------------------------------------------------- */

export type PendingSubTab = 'invitations' | 'requests'

export function PendingSubTabs({ active, invitations, requests, onChange }: { active: PendingSubTab; invitations: number; requests: number; onChange: (t: PendingSubTab) => void }) {
  const tabs: { key: PendingSubTab; label: string; count: number }[] = [
    { key: 'invitations', label: 'Invitations', count: invitations },
    { key: 'requests', label: 'Access requests', count: requests },
  ]
  return (
    <div role="tablist" className="flex items-end gap-8 self-start border-b border-[#edeff2]">
      {tabs.map((t) => {
        const on = t.key === active
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={`-mb-px flex items-center gap-2 border-b-[3px] pb-2.5 text-base transition-colors ${on ? 'border-[#111927] font-semibold text-[#111927]' : 'border-transparent text-[#6b7280] hover:text-[#111927]'}`}
          >
            {t.label}
            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${on ? 'bg-[#111927] text-white' : 'text-[#4b5563]'}`}>{t.count}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pending tables — Name / Email / Role / Date (48029:229952, 229297)     */
/* ---------------------------------------------------------------------- */

const tableHead = 'grid items-center rounded-lg bg-[#efefef] px-2.5 text-sm font-medium text-[#525866]'
const tableRow = 'grid min-h-[60px] items-center border-b border-[#efefef] px-2.5 text-sm text-[#222121]'

function DateCell({ date, time }: { date: string; time?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-[#111927]">{date}</span>
      {time && <span className="text-[11px] text-[#9aa1ac]">{time}</span>}
    </div>
  )
}

const EyeGlyph = () => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
    <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Z" fill="currentColor" />
    <circle cx="8" cy="8" r="2" fill="white" />
  </svg>
)
const TrashGlyph = () => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
    <path d="M6 1.75h4a.75.75 0 0 1 .75.75V3.5h2.5a.75.75 0 0 1 0 1.5H12.6l-.6 8.2A1.75 1.75 0 0 1 10.26 15H5.74A1.75 1.75 0 0 1 4 13.2L3.4 5h-.65a.75.75 0 0 1 0-1.5h2.5V2.5A.75.75 0 0 1 6 1.75Zm.75 1.75h2.5V3.25h-2.5V3.5Z" />
  </svg>
)

export function InvitationsTable({ rows, onReviewRow, onResendRow, onRevokeRow }: { rows: PendingInviteRow[]; onReviewRow?: (r: PendingInviteRow) => void; onResendRow?: (r: PendingInviteRow) => void; onRevokeRow?: (r: PendingInviteRow) => void }) {
  const cols = 'grid-cols-[1fr_1fr_1fr_1fr_40px]'
  return (
    <div className="flex w-full flex-col">
      <div className={`${tableHead} ${cols} h-9`}>
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Date joined</span>
        <span />
      </div>
      {rows.map((r) => (
        <div key={r.id} className={`${tableRow} ${cols}`}>
          <span className="font-medium">{r.name}</span>
          <span className="truncate pr-4 font-medium">{r.email}</span>
          <span className="font-medium">
            {r.businessAccess[0]?.role}
            {r.businessAccess.length > 1 && <span className="block text-[11px] font-normal text-[#9aa1ac]">+{r.businessAccess.length - 1} more business</span>}
          </span>
          <DateCell date={r.invitedOn} time={r.invitedAt} />
          <div className="flex justify-end">
            <HdsActionMenu
              theme="light"
              width={168}
              items={[
                { label: 'Review invite', icon: <EyeGlyph />, onSelect: () => onReviewRow?.(r) },
                { label: 'Resend invite', onSelect: () => onResendRow?.(r) },
                { label: 'Revoke invite', icon: <TrashGlyph />, tone: 'danger', onSelect: () => onRevokeRow?.(r) },
              ]}
              trigger={({ open, toggle }) => <RowDotsTrigger label={`Actions for ${r.name}`} open={open} toggle={toggle} />}
            />
          </div>
        </div>
      ))}
      {rows.length === 0 && <EmptyRows text="No pending invitations" />}
    </div>
  )
}

export function AccessRequestsTable({ rows, onReview, onReject }: { rows: AccessRequestRow[]; onReview: (r: AccessRequestRow) => void; onReject: (r: AccessRequestRow) => void }) {
  const cols = 'grid-cols-[1fr_1fr_1fr_40px]'
  return (
    <div className="flex w-full flex-col">
      <div className={`${tableHead} ${cols} h-9`}>
        <span>Name</span>
        <span>Email</span>
        <span>Request date</span>
        <span />
      </div>
      {rows.map((r) => (
        <div key={r.id} className={`${tableRow} ${cols}`}>
          <span className="font-medium">{r.name}</span>
          <span className="truncate pr-4 font-medium">{r.email}</span>
          <DateCell date={r.requestedOn} time={r.requestedAt} />
          <div className="flex justify-end">
            <HdsActionMenu
              theme="light"
              width={176}
              items={[
                { label: 'Review request', icon: <EyeGlyph />, onSelect: () => onReview(r) },
                { label: 'Reject', icon: <TrashGlyph />, tone: 'danger', onSelect: () => onReject(r) },
              ]}
              trigger={({ open, toggle }) => <RowDotsTrigger label={`Actions for ${r.name}`} open={open} toggle={toggle} />}
            />
          </div>
        </div>
      ))}
      {rows.length === 0 && <EmptyRows text="No access requests" />}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Review access request modal (48029:229502)                             */
/* ---------------------------------------------------------------------- */

const initialsOf = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export function ReviewAccessRequestModal({ request, businessName, onCancel, onApprove }: { request: AccessRequestRow; businessName: string; onCancel: () => void; onApprove: (role: string) => void }) {
  // Progressive: Approve access stays disabled until a role is assigned.
  const [role, setRole] = useState<string | null>(null)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,11,17,0.55)] px-4" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-label="Review access request" onClick={(e) => e.stopPropagation()} className="flex w-[600px] max-w-full animate-[popIn_180ms_ease-out] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-xl font-medium text-[#111927]">Review access request</h2>
              <p className="text-sm text-[#4b5563]">
                {request.name} wants to join {businessName.replace(/\.$/, '')}. Review and choose their role.
              </p>
            </div>
            <button type="button" onClick={onCancel} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-[#9aa1ac] text-white hover:bg-[#6b7280]">
              <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f5f6f8] px-5 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e1e4e9] text-sm font-semibold text-[#111927]">{initialsOf(request.name)}</span>
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-medium text-[#111927]">{request.name}</p>
              <p className="text-sm text-[#4b5563]">{request.email}</p>
            </div>
          </div>
          <HdsSelect
            label="Assign role"
            placeholder="Select a role"
            options={TEAM_ROLES}
            value={role}
            onChange={setRole}
            helper={`Choose what ${request.company} can access and manage in this business.`}
            menuMode="inline"
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edeff2] px-5 py-3">
          <HdsButton variant="secondary" shape="pill" onClick={onCancel}>
            Cancel
          </HdsButton>
          <HdsButton variant="primary" shape="pill" disabled={!role} onClick={() => role && onApprove(role)}>
            Approve access
          </HdsButton>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Reject request confirmation (48029:229736)                             */
/* ---------------------------------------------------------------------- */

export function RejectRequestModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,11,17,0.55)] px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reject request"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[442px] max-w-full animate-[popIn_180ms_ease-out] flex-col overflow-hidden rounded-[31px]"
        style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(190,30,45) 30%, rgb(240,190,195) 100%)' }}
      >
        <div className="relative h-[302px] shrink-0">
          <button type="button" onClick={onCancel} aria-label="Close" className="absolute right-6 top-6 flex size-6 items-center justify-center rounded-full bg-white text-[#111927]">
            <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="absolute left-1/2 top-[137px] flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-white">
            <span className="flex size-[26px] items-center justify-center rounded-full bg-[#1f2937] text-white">
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
                <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-[28px] font-semibold tracking-tight text-text-primary">Reject request?</p>
            <p className="text-base text-text-quaternary">Rejecting this request will prevent the user from accessing this business.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <HdsButton variant="secondary" size="lg" fullWidth onClick={onCancel}>
              Cancel
            </HdsButton>
            <HdsButton variant="primary" size="lg" fullWidth onClick={onConfirm}>
              Reject request
            </HdsButton>
          </div>
        </div>
      </div>
    </div>
  )
}
