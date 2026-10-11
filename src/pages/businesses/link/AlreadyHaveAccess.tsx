import { useNavigate } from 'react-router-dom'
import { useBusinessContext } from '../../../context/BusinessContext'
import { LinkModalBackdrop, LinkModalShell, LinkModalTitle, EmailField, BusinessMatchCard, LinkAlert, ModalButton, FOUND_BUSINESS } from '../shared'

// Figma node 46940:237607 ("Link 06 — Already have access", modal node
// 47107:218581). Triggered by the special email `member@example.com` —
// the "you're a team member, not the owner" case. Only one footer button
// ("Open business") — no Cancel — matching Figma exactly.
//
// Judgment call: the business card is shown with the literal Figma demo
// content (Bright Logistics Ltd), but "Open business" sets the app's
// `currentBusinessId` to a real BUSINESSES entry (Hyperion Freight — the
// one business in the dataset owned by someone else, "Priya Raman",
// matching this screen's "you have access but don't own it" semantics)
// so the rest of the prototype's business switcher stays consistent.
export default function AlreadyHaveAccess() {
  const navigate = useNavigate()
  const { setCurrentBusinessId } = useBusinessContext()

  const openBusiness = () => {
    setCurrentBusinessId('hyperion-freight')
    navigate('/')
  }

  return (
    <LinkModalBackdrop>
      <LinkModalShell
        matched
        onClose={() => navigate('/businesses')}
        footer={
          <ModalButton variant="primary" onClick={openBusiness}>
            Open business
          </ModalButton>
        }
      >
        <LinkModalTitle
          title="Link an existing business"
          subtitle="Connect a business that's already on Hinstantt. Its owner will need to approve your access."
        />
        <EmailField value={FOUND_BUSINESS.email} disabled />
        <BusinessMatchCard name={FOUND_BUSINESS.name} maskedEmail={FOUND_BUSINESS.maskedEmail} useLogo />
        <LinkAlert tone="success">You already have access to this business.</LinkAlert>
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
