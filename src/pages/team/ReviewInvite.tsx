import Team from './Team'
import { PENDING_INVITES } from './shared'

// /team/invite/review — the Team page with the Invite team member drawer open on its Review step
// (Figma 48029:231724), using the sample invitee from the design.
const sample = PENDING_INVITES[0]

export default function ReviewInvite() {
  return (
    <Team
      inviteStart="review"
      inviteDraft={{
        name: sample.name,
        email: sample.email,
        iso: 'US',
        phone: sample.phone.replace(/^\+1\s*/, ''),
        access: sample.businessAccess.map((g) => ({ business: g.businessName, role: g.role })),
      }}
    />
  )
}
