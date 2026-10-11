export type RouteEntry = {
  path: string
  label: string
  group: string
  nodeId: string
  component: string // relative to src/pages
}

// Canonical (latest-revision) screens pulled from Figma file XWbFOsBSyeBTrk7EpLB5Kq,
// section "Requests" (node 37453:197545).
// Multi-business access management only: business switcher, Manage businesses, Add / Link a business,
// Team access. Home is kept because switching businesses and access outcomes land there; every other
// sidebar destination renders an empty screen (see App.tsx).
export const ROUTES: RouteEntry[] = [
  { path: '/', label: 'Home', group: 'Home', nodeId: '34758:140415', component: 'home/Home' },
  { path: '/businesses', label: 'Manage businesses', group: 'Multi-Business', nodeId: '46940:432386', component: 'businesses/ManageBusinesses' },
  { path: '/businesses/access-approved-toast', label: 'Home — access request approved (owner toast)', group: 'Multi-Business', nodeId: '46940:431100', component: 'businesses/AccessApprovedToast' },
  { path: '/businesses/access-declined-toast', label: 'Home — access request declined (owner toast)', group: 'Multi-Business', nodeId: '46940:431979', component: 'businesses/AccessDeclinedToast' },
  { path: '/businesses/add', label: 'Add a new business — initial info', group: 'Multi-Business', nodeId: '46940:241060', component: 'businesses/add/InitialInfo' },
  { path: '/businesses/add/company', label: 'Add a new business — KYB: Company', group: 'Multi-Business', nodeId: '46940:433218', component: 'businesses/add/KybCompany' },
  { path: '/businesses/add/ownership', label: 'Add a new business — KYB: Ownership', group: 'Multi-Business', nodeId: '46940:245205', component: 'businesses/add/KybOwnership' },
  { path: '/businesses/add/business-profile', label: 'Add a new business — KYB: Business & financial profile', group: 'Multi-Business', nodeId: '46940:245380', component: 'businesses/add/KybBusinessProfile' },
  { path: '/businesses/add/review', label: 'Add a new business — KYB: Review & submit', group: 'Multi-Business', nodeId: '46940:245553', component: 'businesses/add/KybReview' },
  { path: '/businesses/link', label: 'Link an existing business — enter email', group: 'Multi-Business', nodeId: '46940:241500', component: 'businesses/link/EnterEmail' },
  { path: '/businesses/link/found', label: 'Link an existing business — business found', group: 'Multi-Business', nodeId: '46940:242356', component: 'businesses/link/BusinessFound' },
  { path: '/businesses/link/requested', label: 'Link an existing business — request sent (pending approval)', group: 'Multi-Business', nodeId: '46940:236349', component: 'businesses/link/RequestSent' },
  { path: '/businesses/link/not-found', label: 'Link an existing business — business not found', group: 'Multi-Business', nodeId: '46940:237172', component: 'businesses/link/NotFound' },
  { path: '/businesses/link/already-access', label: 'Link an existing business — already have access', group: 'Multi-Business', nodeId: '46940:237607', component: 'businesses/link/AlreadyHaveAccess' },
  { path: '/businesses/link/owner-connected', label: 'Link an existing business — owner links own business (already connected)', group: 'Multi-Business', nodeId: '46940:238050', component: 'businesses/link/OwnerConnected' },
  { path: '/businesses/link/pending-already', label: 'Link an existing business — approval already pending', group: 'Multi-Business', nodeId: '46940:238493', component: 'businesses/link/PendingAlready' },
  { path: '/team', label: 'Team — Members (default view)', group: 'Multi-Business', nodeId: '46940:435333', component: 'team/Team' },
  { path: '/team/invite/review', label: 'Team — Review invite (business access & role)', group: 'Multi-Business', nodeId: '46940:435333', component: 'team/ReviewInvite' },
]
