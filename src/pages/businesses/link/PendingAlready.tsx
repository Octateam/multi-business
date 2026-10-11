import { useNavigate } from 'react-router-dom'
import { LinkModalBackdrop, LinkModalShell, LinkModalTitle, EmailField, BusinessMatchCard, LinkAlert, ModalButton, FOUND_BUSINESS } from '../shared'

// Figma node 46940:238493 ("Link 08 — Approval already pending", modal
// node 47107:218874). Spec: "If the same user requests access again while
// approval is pending, do not create another request — show that approval
// is already pending." Single "Done" button, no Cancel, matching Figma.
// Triggered by the special email `pending@example.com`.
export default function PendingAlready() {
  const navigate = useNavigate()

  return (
    <LinkModalBackdrop>
      <LinkModalShell
        matched
        onClose={() => navigate('/businesses')}
        footer={
          <ModalButton variant="primary" onClick={() => navigate('/businesses')}>
            Done
          </ModalButton>
        }
      >
        <LinkModalTitle
          title="Link an existing business"
          subtitle="Connect a business that's already on Hinstantt. Its owner will need to approve your access."
        />
        <EmailField value={FOUND_BUSINESS.email} disabled />
        <BusinessMatchCard
          name={FOUND_BUSINESS.name}
          maskedEmail={FOUND_BUSINESS.maskedEmail}
          useLogo
          badge="Connected"
        />
        <LinkAlert tone="warning">Your initial request is still pending approval</LinkAlert>
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
