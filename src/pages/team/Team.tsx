import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useBusinessContext } from '../../context/BusinessContext'
import InviteMemberDrawer, { type InviteDraft } from './InviteMember'
import {
  ACCESS_REQUESTS,
  INVITATIONS,
  MEMBERS,
  AccessRequestsTable,
  InvitationsTable,
  MembersTable,
  PendingSubTabs,
  RejectRequestModal,
  ReviewAccessRequestModal,
  TeamPageHeader,
  TeamViewToggle,
  TeamSearchBar,
  TeamPagination,
  type AccessRequestRow,
  type MemberRow,
  type PendingSubTab,
  type TeamTab,
} from './shared'

// Teams section (Figma 48029:228003). "All members" lists the team; "Pending (N)" splits into Invitations
// (people we invited) and Access requests (people asking to join this business). A request is reviewed
// from its row menu: Review request → assign a role → Approve access, or Reject → confirm. Both outcomes
// land on Home with the matching notice (48029:228011 approved, 48029:228890 declined).
/** `inviteStart` opens the Invite team member drawer on load (the /team/invite/review route uses 'review'). */
export default function Team({ inviteStart, inviteDraft }: { inviteStart?: 'form' | 'review'; inviteDraft?: InviteDraft } = {}) {
  const navigate = useNavigate()
  const { currentBusiness } = useBusinessContext()
  const [tab, setTab] = useState<TeamTab>('pending')
  const [subTab, setSubTab] = useState<PendingSubTab>('invitations')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [members, setMembers] = useState<MemberRow[]>(MEMBERS)
  const [invites, setInvites] = useState(INVITATIONS)
  const [requests, setRequests] = useState<AccessRequestRow[]>(ACCESS_REQUESTS)
  const [reviewing, setReviewing] = useState<AccessRequestRow | null>(null)
  const [rejecting, setRejecting] = useState<AccessRequestRow | null>(null)
  // Invite team member drawer (48029:232162); the key remounts it so every open starts fresh.
  const [invite, setInvite] = useState<{ key: number; step: 'form' | 'review'; draft?: InviteDraft } | null>(inviteStart ? { key: 0, step: inviteStart, draft: inviteDraft } : null)
  const closeInvite = () => {
    setInvite(null)
    if (inviteStart) navigate('/team', { replace: true })
  }

  const q = query.trim().toLowerCase()
  const matches = (...parts: string[]) => !q || parts.join(' ').toLowerCase().includes(q)
  const visibleMembers = useMemo(
    () => members.filter((m) => (roleFilter === 'all' || m.role === roleFilter) && matches(m.name, m.email, m.role)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, roleFilter, q],
  )
  const visibleInvites = useMemo(
    () => invites.filter((i) => (roleFilter === 'all' || i.businessAccess.some((g) => g.role === roleFilter)) && matches(i.name, i.email, ...i.businessAccess.map((g) => g.role))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invites, roleFilter, q],
  )
  const visibleRequests = useMemo(
    () => requests.filter((r) => matches(r.name, r.email, r.company)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requests, q],
  )

  const setStatus = (id: string, status: MemberRow['status']) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
  const resolve = (r: AccessRequestRow) => setRequests((prev) => prev.filter((x) => x.id !== r.id))

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-6 py-8">
        <TeamPageHeader />
        <div className="flex flex-col gap-5">
          <TeamViewToggle active={tab} pendingCount={invites.length + requests.length} onChange={setTab} />
          {tab === 'pending' && <PendingSubTabs active={subTab} invitations={invites.length} requests={requests.length} onChange={setSubTab} />}
        </div>
        <TeamSearchBar
          onInvite={() => setInvite({ key: Date.now(), step: 'form' })}
          query={query}
          onQueryChange={setQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />

        {tab === 'all' ? (
          <MembersTable
            rows={visibleMembers}
            onDeactivateRow={(r) => setStatus(r.id, 'Deactivated')}
            onReactivateRow={(r) => setStatus(r.id, 'Active')}
            onRemoveRow={(r) => setMembers((prev) => prev.filter((m) => m.id !== r.id))}
          />
        ) : subTab === 'invitations' ? (
          <InvitationsTable
            rows={visibleInvites}
            onReviewRow={(r) =>
              setInvite({
                key: Date.now(),
                step: 'review',
                draft: { name: r.name, email: r.email, iso: 'US', phone: r.phone.replace(/^\+1\s*/, ''), access: r.businessAccess.map((g) => ({ business: g.businessName, role: g.role })) },
              })
            }
            onRevokeRow={(r) => setInvites((prev) => prev.filter((i) => i.id !== r.id))}
          />
        ) : (
          <AccessRequestsTable rows={visibleRequests} onReview={setReviewing} onReject={setRejecting} />
        )}

        {tab === 'all' && <TeamPagination />}
      </main>

      {reviewing && (
        <ReviewAccessRequestModal
          request={reviewing}
          businessName={currentBusiness.name}
          onCancel={() => setReviewing(null)}
          onApprove={(role) => {
            resolve(reviewing)
            navigate('/businesses/access-approved-toast', { state: { company: reviewing.company, business: currentBusiness.name, role } })
          }}
        />
      )}
      {invite && (
        <InviteMemberDrawer
          key={invite.key}
          open
          initialStep={invite.step}
          initialDraft={invite.draft}
          onClose={closeInvite}
          onSent={(sent) => {
            setInvites((prev) => [sent, ...prev.filter((i) => i.email !== sent.email)])
            setTab('pending')
            setSubTab('invitations')
            closeInvite()
          }}
        />
      )}
      {rejecting && (
        <RejectRequestModal
          onCancel={() => setRejecting(null)}
          onConfirm={() => {
            resolve(rejecting)
            navigate('/businesses/access-declined-toast', { state: { company: rejecting.company, business: currentBusiness.name } })
          }}
        />
      )}
    </AppShell>
  )
}
