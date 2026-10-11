// Account currencies service.
//
// Which currencies a customer can open a main account in, which provider holds each one (and the
// bank name we show for it), the rails it supports and the account creation fee are configuration,
// not code. They're requested fresh every time Create account opens, so enabling a currency or
// switching its provider only needs a config change. In this prototype the "endpoint" is
// /api/account-currencies.json (public/api/account-currencies.json).

const CURRENCIES_ENDPOINT = '/api/account-currencies.json'

const FLAGS = import.meta.glob('../../assets/flags/*.svg', { eager: true, import: 'default' }) as Record<string, string>
export const flagFor = (code: string) => FLAGS[`../../assets/flags/${code}.svg`]

type RawCurrency = { code: string; name: string; label?: string; flag: string; symbol: string; provider: string; bank?: string; localRails: string[]; swift: boolean; enabled: boolean }
type RawConfig = {
  version: number
  updatedAt: string
  fee: { amount: number; currency: string; display: string; note: string; providers?: string[] }
  providers: Record<string, { displayBank: string; banks?: string[]; fundingDetails?: FundingDetailsConfig; approvedRecipients?: ApprovedRecipientsConfig }>
  currencies: RawCurrency[]
}

export type FundingDetailsConfig = {
  summary: string
  fields: { label: string; value: string }[]
  fundingFee?: { label: string; value: string }
  /** Collapsible notes shown under the details (funding instructions, reconciliation rules). */
  notes: { title: string; items: string[] }[]
  /** Proof-of-payment upload shown under the notes; `email` is the alternative channel. */
  supportingDocument?: { title: string; description: string; email: string; accept: string }
}

/** Senders the customer must approve before a provider's account is created (e.g. Sokin collection accounts). */
export type ApprovedRecipientsConfig = {
  max: number
  title: string
  /** May contain {currency}. */
  subtitle: string
  notice: string
  lockNotice: string
  supportEmail: string
}

export type ApprovedRecipient = { name: string; bankName: string; bankCountry: string; identifier: string }

const LEGAL_SUFFIX = /^(ag|gmbh|sa|sas|ltd|limited|inc|llc|plc|bv|nv|ab|as|oy|spa|srl|pty)\.?$/i
/**
 * Two-letter avatar initials for a recipient: first word + last word, skipping a trailing legal form
 * (Alpine Trading AG → AT, Lakeside Imports Ltd → LI, Geneva Retail Co. → GC); a lone name keeps its legal form (Matterhorn GmbH → MG).
 */
export function recipientInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const core = words.length > 2 && LEGAL_SUFFIX.test(words[words.length - 1]) ? words.slice(0, -1) : words
  const last = core.length > 1 ? core[core.length - 1] : ''
  return (core[0].charAt(0) + last.charAt(0)).toUpperCase()
}

export type AccountCurrency = {
  code: string
  /** Who holds the account (e.g. "sokin"). Never shown to the customer. */
  provider: string
  name: string
  /** "GBP - British Pound Sterling" */
  label: string
  flag: string
  /** The bank shown to the customer — the provider itself (e.g. Sokin) isn't exposed. Null when the customer picks one. */
  bank: string | null
  /** Banks the customer can choose from (partner-bank currencies); null when the bank is assigned. */
  bankOptions: string[] | null
  /** How the balance is prefixed on the account, e.g. "¥", "CHF ", "kr ". */
  symbol: string
  /** Every rail the account can receive on, local first, then SWIFT. */
  rails: string[]
  localRails: string[]
  swiftOnly: boolean
  /** The one-off creation fee, only for currencies whose provider charges it. */
  fee: RawConfig['fee'] | null
  /** Present when the customer must confirm who will send funds before the account is created. */
  recipients: ApprovedRecipientsConfig | null
}

export type AccountCurrencyConfig = { currencies: AccountCurrency[]; version: number }

export async function fetchAccountCurrencies(): Promise<AccountCurrencyConfig> {
  const res = await fetch(`${CURRENCIES_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Currencies are unavailable (${res.status})`)
  const config = (await res.json()) as RawConfig
  const currencies = config.currencies
    .filter((c) => c.enabled)
    .map((c) => {
      const provider = config.providers[c.provider]
      // FIXED RULE (product owner, 2026-10-09 — do not change without their say-so): the bank is assigned, not chosen.
      // Sokin currencies are always BMO Bank and USD is always SVB Bank; both show as a disabled field. Other currencies
      // with a currency-level bank use it; the remaining partner-bank currencies keep their picker.
      const fixedBank = c.provider === 'sokin' ? (provider?.displayBank ?? 'BMO Bank') : c.code === 'USD' ? (c.bank ?? 'SVB Bank') : c.bank
      const bankOptions = fixedBank ? null : (provider?.banks ?? null)
      return {
      code: c.code,
      name: c.name,
      provider: c.provider,
      label: c.label ?? `${c.code} - ${c.name}`,
      flag: flagFor(c.flag),
      bank: fixedBank ?? (bankOptions ? null : (provider?.displayBank ?? 'BMO Bank')),
      bankOptions,
      symbol: balanceSymbol(c.symbol),
      rails: [...c.localRails, ...(c.swift ? ['SWIFT'] : [])],
      localRails: c.localRails,
      swiftOnly: c.localRails.length === 0,
      fee: !config.fee.providers || config.fee.providers.includes(c.provider) ? config.fee : null,
      recipients: provider?.approvedRecipients ?? null,
      }
    })
  return { currencies, version: config.version }
}

/** Letter symbols (CHF, kr, zł, lei, Ft, R) get a space before the amount: "CHF 0.00", but "¥0.00", "S$0.00". */
export const balanceSymbol = (symbol: string) => (/\p{L}$/u.test(symbol) && !/[$¥₪฿€£₦]$/.test(symbol) ? `${symbol} ` : symbol)

/** Currency symbol for balances on newly created accounts (falls back to the ISO code). */
export function symbolFor(code: string) {
  try {
    const part = new Intl.NumberFormat('en-US', { style: 'currency', currency: code === 'CNH' ? 'CNY' : code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency')
    return part?.value ?? `${code} `
  } catch {
    return `${code} `
  }
}

/** Funding details for an account held with `provider`, requested fresh every time they're opened. */
export async function fetchProviderFundingDetails(provider: string, currency: string): Promise<{ details: FundingDetailsConfig; bank: string; flag: string; currencyName: string; recipientRules: ApprovedRecipientsConfig | null }> {
  const res = await fetch(`${CURRENCIES_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Funding details are unavailable (${res.status})`)
  const config = (await res.json()) as RawConfig
  const p = config.providers[provider]
  if (!p?.fundingDetails) throw new Error('Funding details aren’t available for this account yet')
  const cur = config.currencies.find((c) => c.code === currency)
  await new Promise((r) => setTimeout(r, 300))
  return { details: p.fundingDetails, bank: p.displayBank, flag: flagFor(cur?.flag ?? 'us'), currencyName: cur?.name ?? currency, recipientRules: p.approvedRecipients ?? null }
}
