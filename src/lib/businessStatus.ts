import type { BadgeStatus } from '../components/ui/Badge'
import type { BusinessStatus } from '../data/businesses'

// Maps each non-active business status onto the existing Badge color language
// (see Badge.tsx) instead of inventing new status colors for this feature.
// Colors verified against Figma node 46940:432497 (Manage Businesses table, Status column):
// Active=green, Verification pending=navy/blue, Action required=red, KYB pending=grey,
// Pending approval=amber/yellow — 'pending' and 'info-needed' are swapped from their
// (incorrect) original assignment below to match those hues using the existing token set.
export const BUSINESS_STATUS_BADGE: Record<BusinessStatus, BadgeStatus> = {
  active: 'approved',
  'verification-pending': 'info-needed',
  'action-required': 'payment-failed',
  'kyb-pending': 'draft',
  'pending-approval': 'pending',
}

// Added for the Business Switcher rebuild (Figma "Switcher 03 — Default
// business and Set as default", node 46988:213440): the short "what's needed
// from you" clause shown after the status label on each non-active row, e.g.
// "In review  ·  nothing needed from you". Verbatim from Figma.
export const BUSINESS_STATUS_HINT: Record<BusinessStatus, string> = {
  active: '',
  'verification-pending': 'nothing needed from you',
  'action-required': 'compliance needs info',
  'kyb-pending': 'finish setup',
  'pending-approval': 'waiting on owner',
}

// Status-label text color used on the switcher's dark dropdown (distinct from
// BUSINESS_STATUS_BADGE, which is tuned for light badge pills elsewhere).
// Colors verified against Figma node 46988:214112 (the switcher's populated
// dropdown panel).
export const BUSINESS_STATUS_ACCENT: Record<BusinessStatus, string> = {
  active: 'text-white',
  'verification-pending': 'text-[#5aa9ff]',
  'action-required': 'text-[#f87171]',
  'kyb-pending': 'text-[#c9ced6]',
  'pending-approval': 'text-[#fbbf24]',
}

// Which progress-ring treatment wraps a row's avatar in the switcher dropdown.
// 'none' = plain avatar (Active). Verified against the same node.
export type BusinessStatusRing = 'none' | 'blue' | 'red' | 'gray' | 'dashed'

export const BUSINESS_STATUS_RING: Record<BusinessStatus, BusinessStatusRing> = {
  active: 'none',
  'verification-pending': 'blue',
  'action-required': 'red',
  'kyb-pending': 'gray',
  'pending-approval': 'dashed',
}
