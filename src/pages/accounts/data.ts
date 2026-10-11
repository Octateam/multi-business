import flagUs from '../../assets/icons/accounts-flag-us.svg'
import flagNg from '../../assets/icons/accounts-flag-ng.svg'
import ddFlagUs from '../../assets/icons/accounts-dd-flag-us.svg'
import ddFlagEu from '../../assets/icons/accounts-dd-flag-eu.svg'
import ddFlagGb from '../../assets/icons/accounts-dd-flag-gb.svg'
import ddFlagNg from '../../assets/icons/accounts-dd-flag-ng.svg'
import usdcLogo from '../../assets/icons/accounts-asset-usdc.png'
import usdtLogo from '../../assets/icons/accounts-asset-usdt.png'
import ethereumLogo from '../../assets/icons/accounts-net-ethereum.png'
import polygonLogo from '../../assets/icons/accounts-net-polygon.png'
import arbitrumLogo from '../../assets/icons/accounts-net-arbitrum.png'
import stellarLogo from '../../assets/icons/accounts-net-stellar.png'

export type AccountStatus = 'active' | 'pending'
export type AccountTab = 'main' | 'yield' | 'wallets'

export type MainAccount = {
  id: string
  name: string
  flag: string
  kind: string
  last4: string
  symbol: string
  whole: string
  cents: string
  status: AccountStatus
  currency: string
  /** USD accounts only: global accounts can be funded from several currencies, local ones in USD only. */
  usdType?: 'global' | 'local'
  /** Account provider from the currency config (e.g. "sokin") — drives provider-specific actions. */
  provider?: string
  /** Approved senders captured at creation (Sokin). Read-only for the customer — changes go through Support. */
  recipients?: import('./currencies').ApprovedRecipient[]
  /** Bank the account is held with (Sokin currencies: BMO Bank or a local partner bank chosen at creation). */
  bank?: string
  /** Kredete Customer Reference (KRD-XXXXXX) — unique to this account, generated once, never regenerated. */
  customerRef?: string
}

export type YieldAccount = { id: string; name: string; asset: 'USDC'; apy: string; balance: string; status: AccountStatus }

export type Wallet = {
  id: string
  name: string
  address: string
  asset: 'USDC' | 'USDT'
  network: NetworkName
  balance: string
  status: AccountStatus
}

export type NetworkName = 'Ethereum' | 'Polygon' | 'Arbitrum' | 'Stellar'

// Row data verbatim from Figma section 47582:380727 (Accounts).
export const MAIN_ACCOUNTS: MainAccount[] = [
  // Expansion financing is a Global USD account (Figma 47625:386378 — the Fund account entry point).
  { id: 'expansion-financing', name: 'Expansion financing', flag: flagUs, kind: 'Checking', last4: '4367', symbol: '$', whole: '12,790.', cents: '65', status: 'active', currency: 'USD', usdType: 'global' },
  { id: 'ops-payroll', name: 'Ops/Payroll', flag: flagUs, kind: 'Checking', last4: '4367', symbol: '$', whole: '12,790.', cents: '65', status: 'active', currency: 'USD', usdType: 'local' },
  { id: 'travel-savings', name: 'Travel Savings', flag: flagUs, kind: 'Checking', last4: '8327', symbol: '$', whole: '3,023.', cents: '00', status: 'active', currency: 'USD', usdType: 'local' },
  { id: 'ad-hoc', name: 'Ad-hoc', flag: flagNg, kind: 'Checking', last4: '1342', symbol: '₦', whole: '2,321,720.', cents: '00', status: 'active', currency: 'NGN' },
]

export const YIELD_ACCOUNTS: YieldAccount[] = [
  { id: 'customer-float', name: 'Customer float', asset: 'USDC', apy: '4.10%', balance: '$12,790.65', status: 'active' },
  { id: 'hq-savings', name: 'HQ savings', asset: 'USDC', apy: '4.10%', balance: '$12,790.65', status: 'active' },
  { id: 'office-savings', name: 'Office savings', asset: 'USDC', apy: '4.10%', balance: '$12,790.65', status: 'active' },
]

export const WALLETS: Wallet[] = [
  { id: 'marketing', name: 'Marketing wallet', address: '0xA1b2...c3D4e5', asset: 'USDC', network: 'Ethereum', balance: '5,250.00 USDC', status: 'active' },
  { id: 'operations', name: 'Operations wallet', address: '0xB2c3...d4E5f6', asset: 'USDT', network: 'Polygon', balance: '3,200.50 USDT', status: 'active' },
  { id: 'treasury', name: 'Treasury wallet', address: '0xC3d4...e5F6g7', asset: 'USDC', network: 'Arbitrum', balance: '4,150.75 USDC', status: 'active' },
  { id: 'gas', name: 'Gas wallet', address: '0xD4e5...f6G7h8', asset: 'USDT', network: 'Stellar', balance: '2,644.53 USDT', status: 'active' },
]

export const ASSET_LOGO: Record<'USDC' | 'USDT', string> = { USDC: usdcLogo, USDT: usdtLogo }

export const NETWORK_LOGO: Record<NetworkName, string> = {
  Ethereum: ethereumLogo,
  Polygon: polygonLogo,
  Arbitrum: arbitrumLogo,
  Stellar: stellarLogo,
}

// Create-account options from Figma section 47582:379913.
export const CURRENCIES = [
  { code: 'USD', label: 'USD - US dollar', flag: ddFlagUs },
  { code: 'EUR', label: 'EUR - Euro', flag: ddFlagEu },
  { code: 'GBP', label: 'GBP - Pounds', flag: ddFlagGb },
  { code: 'NGN', label: 'NGN - Nigerian naira', flag: ddFlagNg },
] as const

export const BANKS = ['Lead Bank', 'Cross River Bank', 'Stearns Bank', 'SSB Bank'] as const

export const NETWORKS: { name: NetworkName; label: string }[] = [
  { name: 'Stellar', label: 'Stellar Network' },
  { name: 'Polygon', label: 'Polygon Network' },
]

export const WALLET_NETWORKS: { name: NetworkName; label: string }[] = [
  { name: 'Stellar', label: 'Stellar Network' },
  { name: 'Polygon', label: 'Polygon Network' },
  { name: 'Ethereum', label: 'Ethereum Network' },
  { name: 'Arbitrum', label: 'Arbitrum Network' },
]

export const BUSINESS_NAME = 'Acme Trading Co.'

export const TAB_PATH: Record<AccountTab, string> = {
  main: '/accounts',
  yield: '/accounts/yield',
  wallets: '/accounts/wallets',
}

// Accounts created in this session. Lives at module level so switching tabs (which remounts the
// page) keeps newly created accounts in the list until a full reload.
// Accounts and wallets created in the prototype. Persisted in localStorage so every account the user creates
// (Sokin, Global USD, any other currency, wallets) stays on the Accounts list across reloads and visits.
const CREATED_KEY = 'hinstantt-created-accounts'
const loadCreated = (): { main: MainAccount[]; wallets: Wallet[] } => {
  try {
    const raw = JSON.parse(localStorage.getItem(CREATED_KEY) ?? 'null')
    if (raw && Array.isArray(raw.main) && Array.isArray(raw.wallets)) return raw
  } catch {
    /* unreadable or unavailable storage — start empty */
  }
  return { main: [], wallets: [] }
}
export const createdStore: { main: MainAccount[]; wallets: Wallet[] } = loadCreated()
export const saveCreated = () => {
  try {
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdStore))
  } catch {
    /* storage full or blocked — the accounts still show for this session */
  }
}

/** A new Kredete Customer Reference in the brief's format, e.g. KRD-7X92LM. */
export const newCustomerRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return `KRD-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
}

/**
 * Sokin collection accounts show the collection account's last 4 digits and "Collection account". Accounts saved before
 * that (or while the config was loading) are completed here from the funding config, then persisted.
 */
export async function backfillSokinAccounts(): Promise<boolean> {
  const pending = createdStore.main.filter((a) => a.provider === 'sokin' && (!/^\d{4}$/.test(a.last4) || a.kind !== 'Collection' || !a.customerRef))
  if (!pending.length) return false
  const { fetchProviderFundingDetails } = await import('./currencies')
  for (const a of pending) {
    try {
      const d = await fetchProviderFundingDetails('sokin', a.currency)
      const number = d.details.fields.find((f) => /account number/i.test(f.label))?.value.replace(/\D/g, '') ?? ''
      if (number.length >= 4) a.last4 = number.slice(-4)
    } catch {
      /* keep what we have */
    }
    a.kind = 'Collection'
    a.customerRef ??= newCustomerRef()
  }
  saveCreated()
  return true
}
