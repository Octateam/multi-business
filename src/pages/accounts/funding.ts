// Funding details service.
//
// Bank / correspondent details and instructions are never bundled into the app. Every time a customer
// asks for them we request the latest configuration (no cache), so any change to the configuration
// shows up the next time details are requested. In this prototype the "endpoint" is
// /api/funding-config.json (public/api/funding-config.json); swap FUNDING_ENDPOINT for the real
// API and nothing else changes.

const FUNDING_ENDPOINT = '/api/funding-config.json'

export type FundingField = { label: string; value: string }

export type BankRoute = {
  id: string
  currency: string
  /** Singular display name, e.g. "Singapore Dollar". */
  name: string
  /** Used in "Fund with Singapore dollars". */
  plural: string
  country: string
  flag: string
  rail: string
  eta: string
  converts: boolean
  /** Instruction shown above the details, with {currency} and {target} tokens. */
  summary: string
  fields: FundingField[]
  instructions: string[]
}

export type RouteSummary = Pick<BankRoute, 'id' | 'currency' | 'name' | 'country' | 'flag'>

export type CryptoNetwork = { name: string; address: string; memo?: string; minimum: string; confirmation: string }
export type CryptoAsset = { code: string; networks: CryptoNetwork[] }

type FundingConfig = {
  version: number
  updatedAt: string
  routes: Record<string, { popular: string[]; all: string[] }>
  bank: Record<string, Omit<BankRoute, 'id'>>
  crypto: { instructions: string[]; assets: CryptoAsset[] }
}

export type FundingAccount = {
  id: string
  name: string
  currency: string
  usdType?: 'global' | 'local'
  last4: string
}

export type Fetched<T> = { data: T; version: number; updatedAt: string }

async function fetchConfig(): Promise<FundingConfig> {
  const res = await fetch(`${FUNDING_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Funding details are unavailable (${res.status})`)
  const config = (await res.json()) as FundingConfig
  // Keep the loading state perceptible so a fresh fetch reads as one.
  await new Promise((r) => setTimeout(r, 350))
  return config
}

const routeKey = (account: FundingAccount) => `${account.currency}:${account.usdType ?? 'local'}`

// Fills account-specific values into the configured templates.
export function personalise(text: string, account: FundingAccount, beneficiary: string) {
  return text
    .replace(/\{beneficiary\}/g, beneficiary)
    .replace(/\{accountName\}/g, account.name)
    .replace(/\{last4\}/g, account.last4)
    .replace(/\{reference\}/g, referenceFor(account))
}

export function referenceFor(account: FundingAccount) {
  return `HNT-${account.last4}-${account.id.slice(0, 3).toUpperCase()}`
}

/** The funding currencies this account can receive by bank transfer (summaries only, no details). */
export async function fetchBankRoutes(account: FundingAccount): Promise<Fetched<{ popular: RouteSummary[]; all: RouteSummary[] }>> {
  const config = await fetchConfig()
  const group = config.routes[routeKey(account)] ?? { popular: [], all: [] }
  const summarise = (ids: string[]) =>
    ids
      .filter((id) => config.bank[id])
      .map((id) => {
        const { currency, name, country, flag } = config.bank[id]
        return { id, currency, name, country, flag }
      })
  return { data: { popular: summarise(group.popular), all: summarise(group.all) }, version: config.version, updatedAt: config.updatedAt }
}

/** The current details and instructions for one funding route, requested fresh every time. */
export async function fetchBankRoute(routeId: string): Promise<Fetched<BankRoute>> {
  const config = await fetchConfig()
  const route = config.bank[routeId]
  if (!route) throw new Error('This funding route is no longer available')
  return { data: { id: routeId, ...route }, version: config.version, updatedAt: config.updatedAt }
}

export async function fetchCrypto(): Promise<Fetched<FundingConfig['crypto']>> {
  const config = await fetchConfig()
  return { data: config.crypto, version: config.version, updatedAt: config.updatedAt }
}
