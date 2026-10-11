import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUSINESSES } from '../../../data/businesses'
import {
  LinkModalBackdrop,
  LinkModalShell,
  LinkModalTitle,
  EmailField,
  ModalButton,
  FOUND_BUSINESS,
} from '../shared'

// Figma node 46940:241500 ("Link 01 — Enter business email") +
// 46940:241928 ("Link 02 — Searching", node 47040:224972 for the modal
// itself) implemented together in one component — see the "searching"
// local state below.
//
// Email-matching rules (exact strings, case-insensitive, trimmed):
//   - finance@brightlogistics.com        -> found (the literal Figma demo
//                                            business, "Bright Logistics
//                                            Ltd" — businesses.ts hadn't
//                                            been renamed to the Figma
//                                            sample names yet when this was
//                                            built, see FOUND_BUSINESS in
//                                            ../shared.tsx)
//   - any BUSINESSES[].email             -> found (using that business's
//                                            real name/initials)
//   - owner@example.com                  -> owner-connected ("Business
//                                            already connected" — the owner
//                                            linking their own business)
//   - member@example.com                 -> already-access ("You already
//                                            have access to this business")
//   - pending@example.com                -> pending-already (duplicate
//                                            request while one is pending)
//   - anything else                      -> not-found
const SPECIAL_TRIGGERS: Record<string, string> = {
  'owner@example.com': '/businesses/link/owner-connected',
  'member@example.com': '/businesses/link/already-access',
  'pending@example.com': '/businesses/link/pending-already',
}

export default function EnterEmail() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)

  const canSubmit = email.trim() !== '' && !searching

  const runSearch = () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || searching) return

    setSearching(true)
    // Transient "Link 02 — Searching" state (node 46940:241928): ~800ms of
    // the "Finding business..." spinner button before branching — modeled
    // as local state inside this screen rather than a separate route,
    // since Figma treats it as a button-state change within the same
    // modal, not a navigation.
    window.setTimeout(() => {
      const special = SPECIAL_TRIGGERS[trimmed]
      if (special) {
        navigate(special, { state: { email: trimmed } })
        return
      }
      if (trimmed === FOUND_BUSINESS.email) {
        navigate('/businesses/link/found', { state: { email: trimmed } })
        return
      }
      const match = BUSINESSES.find((b) => b.email.toLowerCase() === trimmed)
      if (match) {
        navigate('/businesses/link/found', { state: { businessId: match.id, email: trimmed } })
        return
      }
      navigate('/businesses/link/not-found', { state: { email: trimmed } })
    }, 800)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    runSearch()
  }

  return (
    <LinkModalBackdrop>
      <LinkModalShell
        matched={false}
        onClose={() => navigate('/businesses')}
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => navigate('/businesses')} disabled={searching}>
              Cancel
            </ModalButton>
            <ModalButton
              variant={canSubmit ? 'primary' : 'disabled'}
              disabled={!canSubmit}
              loading={searching}
              onClick={runSearch}
            >
              {searching ? 'Finding business...' : 'Find business'}
            </ModalButton>
          </>
        }
      >
        <LinkModalTitle
          title="Link an existing business"
          subtitle="Connect a business that's already on Hinstantt. Its owner will need to approve your access."
        />
        <form onSubmit={handleSubmit} className="w-full">
          <EmailField value={email} onChange={setEmail} disabled={searching} />
        </form>
        <p className="w-full rounded-lg bg-surface-2 px-3.5 py-2.5 text-center text-[11px] leading-relaxed text-text-quaternary">
          Try <span className="font-medium text-text-primary">finance@brightlogistics.com</span> (found),{' '}
          <span className="font-medium text-text-primary">owner@example.com</span> (owner-connected),{' '}
          <span className="font-medium text-text-primary">member@example.com</span> (already have access),{' '}
          <span className="font-medium text-text-primary">pending@example.com</span> (pending) — or a{' '}
          <span className="font-medium text-text-primary">Manage Businesses</span> email — or anything else (not
          found).
        </p>
      </LinkModalShell>
    </LinkModalBackdrop>
  )
}
