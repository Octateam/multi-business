export type BusinessStatus =
  | 'active'
  | 'verification-pending'
  | 'action-required'
  | 'kyb-pending'
  | 'pending-approval'

export type Business = {
  id: string
  name: string
  type: string
  email: string
  owner: string
  teamCount: number
  plan: string
  status: BusinessStatus
  isDefault: boolean
  dateAdded: string
  initials: string
}

// Canonical sample dataset for the Multi-Business Access & Management feature,
// covering every status the spec calls out. Shared by the business switcher
// (TopBar), the Manage Businesses table, and the Link-existing-business flow
// so all three stay consistent.
//
// Names/emails/types below were reconciled to match the verified Figma section
// "Multi-Business Access & Management" (Switcher 01–07 frames), which uses a
// different sample cast than the original written spec. IDs were kept stable
// (several other pages — RequestSent.tsx's fallback, etc. — key off `id`, not
// `name`) — see BusinessSwitcher.tsx's handoff report for the full before/after
// name mapping.
export const BUSINESSES: Business[] = [
  {
    id: 'acme-trading',
    name: 'Acme Trading Co.',
    type: 'Limited company',
    email: 'billing@acmetrading.com',
    owner: 'John Doe (you)',
    teamCount: 8,
    plan: 'Growth plan',
    status: 'active',
    isDefault: true,
    dateAdded: 'Jan 6, 2025',
    initials: 'AT',
  },
  {
    id: 'northwind-design',
    name: 'Bright Logistics Ltd',
    type: 'Limited company',
    email: 'accounts@brightlogistics.com',
    owner: 'John Doe (you)',
    teamCount: 5,
    plan: 'Starter plan',
    status: 'active',
    isDefault: false,
    dateAdded: 'Feb 14, 2025',
    initials: 'BL',
  },
  {
    id: 'meridian-legal',
    name: 'Northwind Foods',
    type: 'Limited liability company',
    email: 'ops@northwindfoods.com',
    owner: 'John Doe (you)',
    teamCount: 1,
    plan: '—',
    status: 'verification-pending',
    isDefault: false,
    dateAdded: 'Mar 2, 2025',
    initials: 'NF',
  },
  {
    id: 'acme-print',
    name: 'Lisbon Creative Studio',
    type: 'Sole proprietorship',
    email: 'hello@lagoscreativestudio.com',
    owner: 'John Doe (you)',
    teamCount: 1,
    plan: '—',
    status: 'action-required',
    isDefault: false,
    dateAdded: 'Mar 18, 2025',
    initials: 'LC',
  },
  {
    id: 'figma-inc',
    name: 'Kite Analytics',
    type: 'Corporation',
    email: 'finance@kiteanalytics.io',
    owner: 'John Doe (you)',
    teamCount: 1,
    plan: '—',
    status: 'kyb-pending',
    isDefault: false,
    dateAdded: 'Apr 9, 2025',
    initials: 'KA',
  },
  {
    id: 'hyperion-freight',
    name: 'Greenfield Farms',
    type: 'Limited liability company',
    email: 'admin@greenfieldfarms.com',
    owner: 'Priya Raman',
    teamCount: 12,
    plan: 'Growth plan',
    status: 'pending-approval',
    isDefault: false,
    dateAdded: 'Apr 22, 2025',
    initials: 'GF',
  },
]

// Label text matches the Figma status copy exactly (e.g. "In review" rather
// than "Verification pending") since the switcher renders these verbatim.
export const STATUS_LABEL: Record<BusinessStatus, string> = {
  active: 'Active',
  'verification-pending': 'In review',
  'action-required': 'Action required',
  'kyb-pending': 'KYB pending',
  'pending-approval': 'Pending approval',
}
