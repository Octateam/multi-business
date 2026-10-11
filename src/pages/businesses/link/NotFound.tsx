import { useLocation, useNavigate } from 'react-router-dom'
import { LinkModalBackdrop, LinkModalShell, LinkModalTitle, EmailField, ModalButton } from '../shared'

// Figma node 46940:237172 ("Link 05 — Business not found", modal node
// 47107:218165). Spec: "If the email does not match an existing Hinstantt
// business, do not expose information about other businesses." — the
// error is an inline red border + caption under the email field, not a
// full-page error state.
//
// Judgment call: Figma's own enabled button here is literally "Add
// business" (not "Try again"), with no separate retry button — the email
// field itself isn't re-editable on this screen in Figma. Kept verbatim
// per "implement exclusively from get_design_context", and wired Cancel to
// go back to the (editable) email step rather than all the way out to
// Manage Businesses, so a true retry is still one click away.
export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

  return (
    <LinkModalBackdrop>
      <LinkModalShell
        matched={false}
        onClose={() => navigate('/businesses')}
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => navigate('/businesses/link')}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={() => navigate('/businesses/add')}>
              Add business
            </ModalButton>
          </>
        }
      >
        <LinkModalTitle
          title="Link an existing business"
          subtitle="Connect a business that's already on Hinstantt. Its owner will need to approve your access."
        />
        <EmailField value={email} disabled error="We couldn't find a business with these details." />
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
