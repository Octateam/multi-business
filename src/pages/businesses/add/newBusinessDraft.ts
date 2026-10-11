import { useSyncExternalStore } from 'react'

/**
 * Module-level draft for the "Add a new business" -> KYB flow.
 *
 * The router remounts the whole page tree on every navigation, so per-page useState can't carry what
 * the user typed in "Tell us about your new business" (InitialInfo) into the 4 KYB steps. This tiny
 * external store (read with useSyncExternalStore) survives those remounts, so:
 *   - "Finish setting up {name}" uses the name the user actually entered,
 *   - the Company step's Business details are prefilled from InitialInfo (and stay editable),
 *   - every step keeps its values when the user goes back / uses "Edit" from Review,
 *   - the Review step shows the real entered values.
 * It lives for the browser session (lost on a hard refresh), which is all a prototype needs.
 */

export const FALLBACK_BUSINESS_NAME = 'Novu Bistro'

export type NewBusinessDraft = {
  /** Id of the business entry added to BusinessContext when InitialInfo was submitted. */
  businessId: string | null
  /** Name as entered on InitialInfo. */
  businessName: string
  // Company — Business details
  legalName: string
  tradingName: string
  email: string
  phoneCountry: string
  phone: string
  // Company — Business information
  category: string
  type: string
  // Company — Registration
  registrationNumber: string
  dateOfIncorporation: string
  countryOfIncorporation: string
  countryOfOperation: string
  tin: string
  website: string
  // Company — Address
  registeredAddress: string
  sameAddress: boolean
  proofType: string
  certificateUploaded: boolean
  articlesUploaded: boolean
  proofUploaded: boolean
  // Ownership
  firstName: string
  lastName: string
  ownershipPercent: string
  designation: string
  pep: boolean
  isDirector: boolean
  isSelf: boolean
  verified: boolean
  structureUploaded: boolean
  // Business & financial profile
  profileCategory: string
  description: string
  currencies: string[]
  extraCurrencies: string[]
  sourceOfFunds: string
  sourceOfFundsDetail: string
  expectedVolume: string
  services: string[]
}

const EMPTY: NewBusinessDraft = {
  businessId: null,
  businessName: '',
  legalName: '',
  tradingName: '',
  email: '',
  phoneCountry: 'US',
  phone: '',
  category: '',
  type: '',
  registrationNumber: '',
  dateOfIncorporation: '',
  countryOfIncorporation: '',
  countryOfOperation: '',
  tin: '',
  website: '',
  registeredAddress: '',
  sameAddress: true,
  proofType: '',
  certificateUploaded: true,
  articlesUploaded: true,
  proofUploaded: true,
  firstName: '',
  lastName: '',
  ownershipPercent: '60',
  designation: '',
  pep: false,
  isDirector: false,
  isSelf: true,
  verified: true,
  structureUploaded: true,
  profileCategory: 'Marketplace/platform',
  description: '',
  currencies: ['USD', 'EUR', 'GBP', 'NGN', 'GHS'],
  extraCurrencies: [],
  sourceOfFunds: '',
  sourceOfFundsDetail: '',
  expectedVolume: '',
  services: ['Multi-currency accounts', 'Onramp & Offramp', 'Collections (Payment Links, Cards and Invoices)'],
}

let draft: NewBusinessDraft = EMPTY
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function updateDraft(patch: Partial<NewBusinessDraft>) {
  draft = { ...draft, ...patch }
  emit()
}

/** Called when "Tell us about your new business" is submitted: starts a fresh draft and prefills
 * the Company step's Business details/information from what the user entered. */
export function startDraft(initial: { businessId: string; businessName: string; email: string; phoneCountry: string; phone: string; category: string; type: string }) {
  const name = initial.businessName.trim()
  // Coming back to edit the same business keeps the later steps' answers; a new business starts clean.
  const base = draft.businessId === initial.businessId ? draft : EMPTY
  draft = {
    ...base,
    businessId: initial.businessId,
    businessName: name,
    legalName: name,
    tradingName: name,
    email: initial.email.trim(),
    phoneCountry: initial.phoneCountry,
    phone: initial.phone.trim(),
    category: initial.category,
    type: initial.type,
    profileCategory: initial.category || base.profileCategory,
  }
  emit()
}

export const getDraft = () => draft

export function useNewBusinessDraft() {
  return useSyncExternalStore(subscribe, () => draft, () => draft)
}

/** Display name for titles/toasts: the (possibly edited) legal name, else what was entered on
 * InitialInfo, else the design's sample name for deep links. */
export function draftDisplayName(d: NewBusinessDraft) {
  return d.legalName.trim() || d.businessName.trim() || FALLBACK_BUSINESS_NAME
}

export function initialsOf(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || 'NB'
}
