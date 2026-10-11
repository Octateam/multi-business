import { useNavigate } from 'react-router-dom'
import { useBusinessContext } from '../../../context/BusinessContext'
import { LinkModalBackdrop, LinkModalShell, LinkModalTitle, EmailField, BusinessMatchCard, LinkAlert, ModalButton, FOUND_BUSINESS } from '../shared'

// Figma node 46940:238050 ("Link 07 — Owner links own business", modal
// node 47107:218726). DISTINCT from AlreadyHaveAccess: this is the "owner
// links their own business" case — "Business already connected" copy +
// a navy "Connected" badge on the business card (AlreadyHaveAccess has
// neither), plus Cancel is back (AlreadyHaveAccess only has one button).
// Triggered by the special email `owner@example.com`.
//
// Judgment call: same as AlreadyHaveAccess — card shows the literal Figma
// demo business (Bright Logistics Ltd), but "Open business" points
// `currentBusinessId` at a real BUSINESSES entry owned by "John Doe (you)"
// (Acme Trading Co.) to keep the switcher consistent.
export default function OwnerConnected() {
  const navigate = useNavigate()
  const { setCurrentBusinessId } = useBusinessContext()

  const openBusiness = () => {
    setCurrentBusinessId('acme-trading')
    navigate('/')
  }

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
            <ModalButton variant="primary" onClick={openBusiness}>
              Open business
            </ModalButton>
          </>
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
        <LinkAlert tone="success">Business already connected</LinkAlert>
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
