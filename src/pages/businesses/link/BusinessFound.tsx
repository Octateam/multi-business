import { useLocation, useNavigate } from 'react-router-dom'
import { BUSINESSES } from '../../../data/businesses'
import {
  LinkModalBackdrop,
  LinkModalShell,
  LinkModalTitle,
  EmailField,
  BusinessMatchCard,
  ModalButton,
  FOUND_BUSINESS,
  maskEmail,
} from '../shared'

// Figma node 46940:242356 ("Link 03 — Business found", modal node
// 47040:225030). Per spec's "protect business information" rule, the
// matched business only ever shows its logo, name and a masked email —
// never owner, team, balances or KYB status, even though the Business
// type in businesses.ts carries them.
//
// Judgment call: the Figma primary button here is literally labeled
// "Link business" (not "Request access") — kept verbatim since the task
// says to implement exclusively from get_design_context, but it still
// performs the "request access" action (navigates to the "request sent"
// toast), matching the written flow description.
export default function BusinessFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as { businessId?: string; email?: string } | null) ?? {}

  const matchedBusiness = state.businessId ? BUSINESSES.find((b) => b.id === state.businessId) : undefined
  const isFoundBusinessDemo = !matchedBusiness

  const name = matchedBusiness?.name ?? FOUND_BUSINESS.name
  const email = matchedBusiness?.email ?? state.email ?? FOUND_BUSINESS.email
  const maskedEmail = matchedBusiness ? maskEmail(matchedBusiness.email) : FOUND_BUSINESS.maskedEmail

  return (
    <LinkModalBackdrop>
      <LinkModalShell
        matched
        onClose={() => navigate('/businesses')}
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => navigate('/businesses')}>
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => navigate('/businesses/link/requested', { state: { businessName: name } })}
            >
              Link business
            </ModalButton>
          </>
        }
      >
        <LinkModalTitle
          title="Link an existing business"
          subtitle="Connect a business that's already on Hinstantt. Its owner will need to approve your access."
        />
        <EmailField value={email} disabled />
        <BusinessMatchCard
          name={name}
          maskedEmail={maskedEmail}
          useLogo={isFoundBusinessDemo}
          initials={matchedBusiness?.initials}
        />
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
