import { useEffect, useState } from 'react'
import closeIcon from '../../assets/icons/accounts-create-close.svg'
import bankIcon from '../../assets/icons/accounts-create-bank.svg'
import walletIcon from '../../assets/icons/accounts-create-wallet.svg'
import backIcon from '../../assets/icons/accounts-back.svg'
import successIllustration from '../../assets/icons/accounts-success-illustration.svg'
import deleteIcon from '../../assets/icons/accounts-recipient-delete.svg'
import infoIcon from '../../assets/icons/accounts-fund-info.svg'
import { ASSET_LOGO, BUSINESS_NAME, type NetworkName } from './data'
import { fetchAccountCurrencies, recipientInitials, type AccountCurrencyConfig, type ApprovedRecipient, type ApprovedRecipientsConfig } from './currencies'
import { Drawer, PrimaryButton, Select, TextField } from './ui'
import { Chevron, HdsAlert, HdsBadge, HdsButton, HdsCheckbox, HdsIconTile, HdsInput, HdsListItem, HdsSelect, HdsStepper } from '../../components/ui/hds'
import { COUNTRY_OPTIONS } from '../bills2/hdsKit'
import { useStepHistory } from '../../lib/navHistory'

export type CreateKind = 'main' | 'wallet'
export type CreatedAccount =
  | { kind: 'main'; label: string; currency: string; bank: string; flag?: string; symbol?: string; provider?: string; usdType?: 'global' | 'local'; recipients?: ApprovedRecipient[] }
  | { kind: 'wallet'; label: string; asset: 'USDC' | 'USDT'; network: NetworkName }

type Step = 'choose' | 'details' | 'recipients' | 'review' | 'status'

// USD accounts come in two flavours; the choice only appears once USD is the selected currency.
type UsdType = 'global' | 'local'
const USD_TYPES: { value: UsdType; label: string; helper: string }[] = [
  { value: 'global', label: 'Global USD account', helper: 'Receive USD from anywhere in the world, including international SWIFT transfers.' },
  { value: 'local', label: 'Local USD account', helper: 'A US account for domestic ACH and wire transfers within the United States.' },
]

// Currencies that need approved senders (Sokin) get an extra Recipients step between Details and Review.
const Stepper = ({ steps, current }: { steps: string[]; current: number }) => <HdsStepper steps={steps} current={current} />

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-fit items-center gap-1 text-xs font-medium leading-4 text-[#555354] hover:text-[#111927]">
      <img src={backIcon} alt="" className="size-3" />
      Back
    </button>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-[25.6px] font-medium leading-[26px] text-[#222121]">{title}</h2>
      <p className="text-sm leading-5 text-[#555354]">{subtitle}</p>
    </div>
  )
}

// Review rows — HDS List Item (Plain) with the label above the value.
// Review rows: label on the left, value at the right end of the same line.
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-sm leading-5 text-[#6b7280]">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium leading-5 text-[#111927]">{value}</span>
    </div>
  )
}

// Account creation fee — HDS List Item (Card, Trailing=Value).
function FeeCard({ amount, note }: { amount: string; note: string }) {
  return <HdsListItem style="card" title="Account creation fee" subtitle={note} trailing={{ type: 'value', value: amount }} />
}

const isMainKind = (k: CreateKind) => k === 'main'

// Payer banks per country for the Sokin recipient form: the bank country is picked first and decides which banks
// can be chosen. Countries match COUNTRY_OPTIONS.
const BANKS_BY_COUNTRY: Record<string, string[]> = {
  'United States': ['JPMorgan Chase Bank', 'Bank of America', 'Citibank', 'Wells Fargo', 'U.S. Bank', 'PNC Bank'],
  'United Kingdom': ['Barclays', 'HSBC UK', 'Lloyds Bank', 'NatWest', 'Santander UK', 'Standard Chartered'],
  'Canada': ['RBC Royal Bank', 'TD Canada Trust', 'Scotiabank', 'BMO Bank of Montreal', 'CIBC'],
  'Nigeria': ['Access Bank', 'Zenith Bank', 'GTBank', 'First Bank of Nigeria', 'UBA'],
  'Kenya': ['KCB Bank', 'Equity Bank', 'Co-operative Bank of Kenya', 'NCBA Bank', 'Stanbic Bank Kenya'],
  'Ghana': ['GCB Bank', 'Ecobank Ghana', 'Stanbic Bank Ghana', 'Absa Bank Ghana', 'Fidelity Bank Ghana'],
  'South Africa': ['Standard Bank', 'FirstRand Bank (FNB)', 'Absa Bank', 'Nedbank', 'Capitec Bank'],
  'Rwanda': ['Bank of Kigali', 'I&M Bank Rwanda', 'Equity Bank Rwanda', 'Access Bank Rwanda'],
  'Uganda': ['Stanbic Bank Uganda', 'Centenary Bank', 'dfcu Bank', 'Absa Bank Uganda'],
  'Tanzania': ['CRDB Bank', 'NMB Bank', 'NBC Bank', 'Stanbic Bank Tanzania'],
  'Egypt': ['National Bank of Egypt', 'Banque Misr', 'Commercial International Bank (CIB)', 'QNB Alahli'],
  'France': ['BNP Paribas', 'Société Générale', 'Crédit Agricole', 'Crédit Mutuel', 'La Banque Postale'],
  'Germany': ['Deutsche Bank', 'Commerzbank', 'DZ Bank', 'HypoVereinsbank', 'ING Germany'],
  'Netherlands': ['ING Bank', 'Rabobank', 'ABN AMRO', 'de Volksbank'],
  'Ireland': ['AIB', 'Bank of Ireland', 'PTSB'],
  'Sweden': ['SEB', 'Handelsbanken', 'Swedbank', 'Nordea Bank Sweden'],
  'Denmark': ['Danske Bank', 'Nordea Bank Denmark', 'Jyske Bank', 'Sydbank'],
  'Norway': ['DNB Bank', 'Nordea Bank Norway', 'SpareBank 1', 'Handelsbanken Norway'],
  'Poland': ['PKO Bank Polski', 'Bank Pekao', 'Santander Bank Polska', 'mBank', 'ING Bank Śląski'],
  'Switzerland': ['UBS Switzerland AG', 'Zürcher Kantonalbank', 'PostFinance', 'Raiffeisen Switzerland', 'Credit Suisse (Schweiz) AG'],
  'India': ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'],
  'United Arab Emirates': ['Emirates NBD', 'First Abu Dhabi Bank', 'Abu Dhabi Commercial Bank', 'Mashreq Bank'],
  'Singapore': ['DBS Bank', 'OCBC Bank', 'United Overseas Bank', 'Standard Chartered Singapore'],
  'Hong Kong': ['HSBC Hong Kong', 'Bank of China (Hong Kong)', 'Hang Seng Bank', 'Standard Chartered Hong Kong'],
  'China': ['Industrial and Commercial Bank of China', 'China Construction Bank', 'Bank of China', 'Agricultural Bank of China'],
  'Japan': ['MUFG Bank', 'Mizuho Bank', 'Sumitomo Mitsui Banking Corporation', 'Resona Bank'],
  'Australia': ['Commonwealth Bank', 'Westpac', 'ANZ', 'National Australia Bank'],
  'New Zealand': ['ANZ Bank New Zealand', 'ASB Bank', 'BNZ', 'Westpac New Zealand', 'Kiwibank'],
  'Mexico': ['BBVA México', 'Banorte', 'Santander México', 'Citibanamex', 'HSBC México'],
  'Brazil': ['Itaú Unibanco', 'Banco do Brasil', 'Bradesco', 'Caixa Econômica Federal', 'Santander Brasil'],
}

const emptyRecipient = (): ApprovedRecipient => ({ name: '', bankName: '', bankCountry: '', identifier: '' })
const recipientComplete = (r: ApprovedRecipient) => Boolean(r.name.trim() && r.bankName.trim() && r.bankCountry && r.identifier.trim())

// One approved sender — four HDS fields inside a card. Once a recipient is done it collapses to a summary row
// (name, bank · country) that expands again on click, so only the recipient being edited is open.
function RecipientCard({
  index,
  value,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  index: number
  value: ApprovedRecipient
  expanded: boolean
  onToggle: () => void
  onChange: (next: ApprovedRecipient) => void
  onRemove?: () => void
}) {
  const set = (k: keyof ApprovedRecipient) => (v: string) => onChange({ ...value, [k]: v })
  const complete = recipientComplete(value)
  return (
    <div className="flex animate-[fadeIn_200ms_ease-out] flex-col rounded-xl border border-[#e1e4ea]">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {!expanded && complete && <HdsIconTile size={32}>{recipientInitials(value.name)}</HdsIconTile>}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-5 text-[#111927]">{!expanded && complete ? value.name.trim() : `Recipient ${index + 1}`}</span>
            {!expanded && (
              <span className="truncate text-xs leading-4 text-[#6b7280]">
                {complete ? `${value.bankName.trim()} · ${value.bankCountry} · ${value.identifier.trim()}` : 'Details incomplete'}
              </span>
            )}
          </span>
        </button>
        {!expanded && !complete && (
          <HdsBadge color="amber" size="sm">
            Incomplete
          </HdsBadge>
        )}
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${value.name.trim() || `recipient ${index + 1}`}`} title="Remove recipient" className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-[#fde8ea]">
            <img src={deleteIcon} alt="" className="h-[17.9px] w-[16.25px]" />
          </button>
        )}
        <button type="button" onClick={onToggle} aria-label={expanded ? 'Collapse recipient' : 'Expand recipient'} className="text-[#6b7280] hover:text-[#111927]">
          <Chevron open={expanded} />
        </button>
      </div>
      {expanded && (
        <div className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-4 border-t border-[#f2f4f7] px-4 pb-4 pt-4">
          <HdsInput label="Business or payer name" value={value.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Alpine Trading AG" />
          <HdsSelect
            label="Bank country"
            placeholder="Select country"
            searchable
            searchPlaceholder="Search countries"
            options={COUNTRY_OPTIONS}
            value={value.bankCountry || null}
            onChange={(country) =>
              // A new country resets the bank unless that bank also exists there.
              onChange({ ...value, bankCountry: country, bankName: (BANKS_BY_COUNTRY[country] ?? []).includes(value.bankName) ? value.bankName : '' })
            }
          />
          <HdsSelect
            label="Bank name"
            placeholder={value.bankCountry ? 'Select bank' : 'Select a country first'}
            disabled={!value.bankCountry}
            searchable
            searchPlaceholder="Search banks"
            options={(BANKS_BY_COUNTRY[value.bankCountry] ?? []).map((b) => ({ value: b, label: b }))}
            value={value.bankName || null}
            onChange={set('bankName')}
            helper={value.bankCountry ? undefined : 'Choose the bank country to see its banks.'}
          />
          <HdsInput
            label="Account number / IBAN"
            value={value.identifier}
            onChange={(e) => set('identifier')(e.target.value)}
            placeholder="e.g. CH93 0076 2011 6238 5295 7"
            helper="Use the account number, IBAN or another identifier their bank uses."
          />
          <HdsButton variant="secondary" fullWidth disabled={!complete} onClick={onToggle}>
            Save recipient
          </HdsButton>
        </div>
      )}
    </div>
  )
}

export default function CreateAccountDrawer({
  open,
  initialKind,
  onClose,
  onCreated,
}: {
  open: boolean
  initialKind: CreateKind | null
  onClose: () => void
  /** Called from the success step; the parent is responsible for closing the drawer. */
  onCreated: (account: CreatedAccount) => void
}) {
  // Step history: Back returns to the step the user actually came from. When the drawer was opened
  // straight onto Details ("Create Main Account" / "Create wallet"), there is no earlier step, so Back closes it.
  const { step, go, replace, reset, back } = useStepHistory<Step>('choose')
  const goBack = () => {
    if (!back()) onClose()
  }
  const [kind, setKind] = useState<CreateKind>('main')
  const [currency, setCurrency] = useState<string | null>(null)
  const [usdType, setUsdType] = useState<UsdType | null>(null)
  const [asset, setAsset] = useState<'USDC' | 'USDT' | null>(null)
  const [label, setLabel] = useState('')
  const [chosenBank, setChosenBank] = useState<string | null>(null)
  const [purpose, setPurpose] = useState('')
  // Wallets are created on Stellar; the network is no longer a choice in this flow.
  const network: NetworkName = 'Stellar'
  const [recipients, setRecipients] = useState<ApprovedRecipient[]>([emptyRecipient()])
  const [acknowledged, setAcknowledged] = useState(false)
  // Index of the recipient being edited; the rest are collapsed (-1 = all collapsed).
  const [openRecipient, setOpenRecipient] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  // Currencies, their bank and rails, and the creation fee come from configuration, fetched fresh on open.
  const [config, setConfig] = useState<AccountCurrencyConfig | null>(null)
  const [configError, setConfigError] = useState(false)

  // Each time the drawer opens, start clean on the step the trigger asked for.
  useEffect(() => {
    if (!open) return
    reset(initialKind ? 'details' : 'choose')
    setKind(initialKind ?? 'main')
    setCurrency(null)
    setUsdType(null)
    setAsset(null)
    setLabel('')
    setChosenBank(null)
    setPurpose('')
    setRecipients([emptyRecipient()])
    setAcknowledged(false)
    setOpenRecipient(0)
    setSubmitting(false)
  }, [open, initialKind, reset])

  useEffect(() => {
    if (!open) return
    let live = true
    setConfigError(false)
    fetchAccountCurrencies()
      .then((c) => live && setConfig(c))
      .catch(() => live && setConfigError(true))
    return () => {
      live = false
    }
  }, [open])

  const currencyOption = config?.currencies.find((c) => c.code === currency)
  const allBanks = [...new Set((config?.currencies ?? []).flatMap((c) => c.bankOptions ?? (c.bank ? [c.bank] : [])))]
  // Sokin-held currencies get their bank assigned (shown as BMO Bank); the original currencies keep the bank picker.
  const bankOptions = currencyOption?.bankOptions ?? null
  const bank = bankOptions ? chosenBank : (currencyOption?.bank ?? null)
  // The creation fee and approved recipients only apply to providers that require them (Sokin).
  const fee = isMainKind(kind) ? (currencyOption?.fee ?? null) : null
  const recipientRules: ApprovedRecipientsConfig | null = isMainKind(kind) ? (currencyOption?.recipients ?? null) : null
  const steps = recipientRules ? ['Details', 'Recipients', 'Review', 'Status'] : ['Details', 'Review', 'Status']
  const stepIndex = (s: Step) => steps.indexOf(s === 'details' ? 'Details' : s === 'recipients' ? 'Recipients' : 'Review')
  const recipientsComplete = recipients.length > 0 && recipients.every(recipientComplete) && acknowledged
  const fill = (text: string) => text.replace(/\{currency\}/g, currency ?? '')
  // Progressive: Continue stays disabled until every required field is provided.
  const usdTypeOption = USD_TYPES.find((t) => t.value === usdType)
  const needsUsdType = currency === 'USD'
  const detailsComplete =
    kind === 'main'
      ? Boolean(currency && (!needsUsdType || usdType) && label.trim() && bank)
      : Boolean(asset && label.trim())

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      replace('status')
    }, 900)
  }

  const finish = () => {
    if (kind === 'main' && currency && bank) onCreated({ kind: 'main', label: label.trim(), currency, bank, flag: currencyOption?.flag, symbol: currencyOption?.symbol, provider: currencyOption?.provider, usdType: usdType ?? undefined, recipients: recipientRules ? recipients : undefined })
    else if (kind === 'wallet' && asset) onCreated({ kind: 'wallet', label: label.trim(), asset, network })
    else onClose()
  }

  const isMain = kind === 'main'

  return (
    <Drawer open={open} onClose={step === 'status' ? finish : onClose}>
      {step === 'choose' && (
        <div key="choose" className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-6 px-6 py-16">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[25.6px] font-medium leading-[26px] text-[#222121]">Create account</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-md transition-opacity hover:opacity-80">
                <img src={closeIcon} alt="" className="size-6" />
              </button>
            </div>
            <p className="text-sm leading-5 text-[#555354]">Choose the type of account you want to create</p>
          </div>
          <div className="flex flex-col gap-4">
            {(
              [
                { k: 'main', title: 'Main account', body: 'Local bank account with account number & routing details', icon: bankIcon, iconClass: 'size-[18px]' },
                { k: 'wallet', title: 'Wallet', body: 'On-chain wallet for stablecoins.', icon: walletIcon, iconClass: 'size-5' },
              ] as const
            ).map((option) => (
              <HdsListItem
                key={option.k}
                style="card"
                title={option.title}
                subtitle={option.body}
                leading={
                  <HdsIconTile size={44}>
                    <img src={option.icon} alt="" className={option.iconClass} />
                  </HdsIconTile>
                }
                trailing={{ type: 'chevron' }}
                onClick={() => {
                  setKind(option.k)
                  go('details')
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step === 'details' && (
        <div key={`details-${kind}`} className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-6 px-6 pb-10 pt-[34px]">
          <BackLink onClick={goBack} />
          <Header
            title={isMain ? 'Create main account' : 'Create wallet'}
            subtitle={isMain ? 'Your account for sending, receiving, and managing money.' : 'An on-chain wallet for holding and moving stablecoins.'}
          />
          <Stepper steps={steps} current={0} />
          <div className="flex flex-col gap-4">
            {isMain ? (
              <Select
                label="Currency"
                placeholder={config ? 'Select a currency' : configError ? 'Currencies are unavailable — try again' : 'Loading currencies…'}
                value={currency}
                searchable
                searchPlaceholder="Search currencies"
                options={(config?.currencies ?? []).map((c) => ({
                  value: c.code,
                  label: c.label,
                  icon: c.flag,
                }))}
                onChange={(v) => {
                  setCurrency(v)
                  // A bank picked before the currency is kept when the new currency offers it.
                  const next = config?.currencies.find((c) => c.code === v)
                  setChosenBank((b) => (b && next?.bankOptions?.includes(b) ? b : null))
                  setRecipients([emptyRecipient()])
                  setAcknowledged(false)
                  setOpenRecipient(0)
                  if (v !== 'USD') setUsdType(null)
                }}
                helper="Create only the currencies you need. You can add more at any time."
              />
            ) : (
              <Select
                label="Asset"
                placeholder="Select an asset"
                value={asset}
                options={(['USDC', 'USDT'] as const).map((a) => ({ value: a, label: a, icon: ASSET_LOGO[a] }))}
                onChange={(v) => setAsset(v as 'USDC' | 'USDT')}
              />
            )}
            {isMain && needsUsdType && (
              <div className="flex animate-[fadeIn_200ms_ease-out] flex-col">
                <Select
                  label="Account type"
                  placeholder="Select account type"
                  value={usdType}
                  options={USD_TYPES.map((t) => ({ value: t.value, label: t.label, description: t.helper }))}
                  onChange={(v) => setUsdType(v as UsdType)}
                  helper={usdTypeOption?.helper}
                />
              </div>
            )}
            <TextField
              label={isMain ? 'Account label' : 'Wallet label'}
              value={label}
              onChange={setLabel}
              placeholder={isMain ? `e.g. ${currency ?? 'USD'} operating account` : 'e.g. Treasury wallet'}
              helper={`A label to help you identify this ${isMain ? 'account' : 'wallet'}. Your legal account name stays.`}
            />
            {isMain && (
              <div className="flex flex-col gap-2">
                {!currencyOption ? (
                  // No currency yet: the bank field stays open (enabled with its chevron) until the currency decides it.
                  <Select label="Bank" placeholder="Select bank" value={chosenBank} options={allBanks.map((b) => ({ value: b, label: b }))} onChange={setChosenBank} />
                ) : bankOptions ? (
                  <Select
                    label="Bank"
                    placeholder="Select bank"
                    value={chosenBank}
                    options={bankOptions.map((b) => ({ value: b, label: b }))}
                    onChange={setChosenBank}
                  />
                ) : (
                  <HdsSelect
                    label="Bank"
                    disabled
                    placeholder="Assigned when you pick a currency"
                    options={bank ? [{ value: bank, label: bank }] : []}
                    value={bank}
                    onChange={() => {}}
                    leadingIcon={<img src={bankIcon} alt="" className="size-4 opacity-70" />}
                    helper={bank && currency ? `We hold ${currency} accounts with ${bank}.` : undefined}
                  />
                )}
              </div>
            )}
            {!isMain && (
              <HdsAlert tone="blue" className="animate-[fadeIn_200ms_ease-out]">
                Only send the selected asset to this wallet.
              </HdsAlert>
            )}
            <TextField
              label={`${isMain ? 'Account' : 'Wallet'} purpose`}
              optional
              value={purpose}
              onChange={setPurpose}
              placeholder="e.g. Client payouts (helps with audit and compliance)."
            />
          </div>
          {fee && (
            <div className="animate-[fadeIn_200ms_ease-out]">
              <FeeCard amount={fee.display} note={fee.note} />
            </div>
          )}
          <PrimaryButton disabled={!detailsComplete} onClick={() => go(recipientRules ? 'recipients' : 'review')}>
            Continue
          </PrimaryButton>
        </div>
      )}

      {step === 'recipients' && recipientRules && (
        <div key="recipients" className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-6 px-6 pb-10 pt-[34px]">
          <BackLink onClick={goBack} />
          <Header title={recipientRules.title} subtitle={fill(recipientRules.subtitle)} />
          <Stepper steps={steps} current={stepIndex('recipients')} />
          <div className="flex flex-col gap-4">
            {recipients.map((r, i) => (
              <RecipientCard
                key={i}
                index={i}
                value={r}
                expanded={openRecipient === i}
                onToggle={() => setOpenRecipient((o) => (o === i ? -1 : i))}
                onChange={(next) => setRecipients((list) => list.map((x, j) => (j === i ? next : x)))}
                onRemove={
                  recipients.length > 1
                    ? () => {
                        setRecipients((list) => list.filter((_, j) => j !== i))
                        setOpenRecipient((o) => (o === i ? -1 : o > i ? o - 1 : o))
                      }
                    : undefined
                }
              />
            ))}
            <div className="flex items-center justify-between">
              <HdsButton
                variant="secondary"
                size="sm"
                disabled={recipients.length >= recipientRules.max}
                onClick={() => {
                  // Adding a recipient collapses the others and opens the new one.
                  setOpenRecipient(recipients.length)
                  setRecipients((list) => [...list, emptyRecipient()])
                }}
                leadingIcon={<span className="text-base leading-none">+</span>}
              >
                Add recipient
              </HdsButton>
              {recipients.length >= recipientRules.max && <span className="text-xs leading-4 text-[#6b7280]">You can add up to {recipientRules.max} recipients</span>}
            </div>
          </div>
          <HdsAlert tone="blue" title="Recipients are locked once the account is created">
            {recipientRules.lockNotice}
          </HdsAlert>
          <HdsCheckbox
            checked={acknowledged}
            onChange={setAcknowledged}
            label="I confirm these are the only businesses that will send funds to this account"
          />
          <PrimaryButton disabled={!recipientsComplete} onClick={() => go('review')}>
            Continue
          </PrimaryButton>
        </div>
      )}

      {step === 'review' && (
        <div key="review" className="flex animate-[fadeIn_200ms_ease-out] flex-col gap-6 px-6 pb-10 pt-[34px]">
          <BackLink onClick={goBack} />
          <Header
            title={isMain ? 'Review account summary' : 'Review wallet summary'}
            subtitle={`Confirm the details below before creating your ${isMain ? 'account' : 'wallet'}.`}
          />
          <Stepper steps={steps} current={stepIndex('review')} />
          <div className="flex flex-col gap-1 rounded-2xl border border-[#edeff2] bg-white px-4 py-2">
            {isMain ? (
              <>
                <SummaryRow label="Currency" value={currencyOption?.label ?? ''} />
                {usdTypeOption && <SummaryRow label="Account type" value={usdTypeOption.label} />}
                <SummaryRow label="Account label" value={label.trim()} />
                <SummaryRow label="Bank" value={bank ?? ''} />
                <SummaryRow label="Account purpose (optional)" value={purpose.trim() || '—'} />
              </>
            ) : (
              <>
                <SummaryRow label="Asset" value={asset ?? ''} />
                <SummaryRow label="Wallet label" value={label.trim()} />
                <SummaryRow label="Wallet purpose (optional)" value={purpose.trim() || '—'} />
              </>
            )}
          </div>
          {/* Account creation fee — a line of text under the summary, not a card. */}
          {fee && (
            <p className="-mt-3 flex items-start gap-2 text-xs leading-5 text-[#6b7280]">
              <img src={infoIcon} alt="" className="mt-0.5 size-4 shrink-0" />
              <span>
                A one time creation fee of <span className="font-semibold text-[#111927]">{fee.display}</span> applies to this currency account when funded
              </span>
            </p>
          )}
          {recipientRules && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold leading-5 text-[#111927]">Approved recipients</p>
              </div>
              <div className="flex flex-col divide-y divide-[#f2f4f7] rounded-2xl border border-[#edeff2] bg-white px-4">
                {recipients.map((r, i) => (
                  <HdsListItem
                    key={i}
                    className="!py-3"
                    leading={<HdsIconTile size={32}>{recipientInitials(r.name)}</HdsIconTile>}
                    title={r.name.trim()}
                    subtitle={`${r.bankName.trim()} · ${r.bankCountry} · ${r.identifier.trim()}`}
                  />
                ))}
              </div>
            </div>
          )}
          <PrimaryButton loading={submitting} onClick={submit}>
            {submitting ? 'Creating…' : isMain ? 'Create account' : 'Create wallet'}
          </PrimaryButton>
        </div>
      )}

      {step === 'status' && (
        <div key="status" className="relative flex min-h-full animate-[fadeIn_250ms_ease-out] items-center justify-center px-14 py-16">
          <button type="button" onClick={finish} aria-label="Close" className="absolute right-7 top-7 rounded-md transition-opacity hover:opacity-80">
            <img src={closeIcon} alt="" className="size-6" />
          </button>
          <div className="flex w-[400px] flex-col items-center gap-10">
            <div className="flex w-full flex-col gap-6">
              <div className="flex flex-col items-center gap-6">
                <img src={successIllustration} alt="" className="h-40 w-[193.27px] animate-[popIn_400ms_ease-out]" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-[22px] font-semibold text-[#222121]">{isMain ? 'Account creation requested' : 'Wallet creation requested'}</p>
                  <p className="text-base leading-6 text-[#555354]">
                    Your {isMain ? 'account' : 'wallet'} creation request has been submitted. We’ll notify you once your {isMain ? 'account' : 'wallet'} is ready.
                  </p>
                </div>
              </div>
              <div className="flex flex-col rounded-xl border border-[#e1e4ea] px-4 py-1.5">
                {(isMain
                  ? [
                      ['Account name', BUSINESS_NAME],
                      ['Currency', currency ?? ''],
                      ...(usdTypeOption ? [['Account type', usdTypeOption.label]] : []),
                      ['Account label', label.trim()],
                      ['Bank', bank ?? ''],
                      ...(recipientRules ? [['Approved recipients', `${recipients.length} ${recipients.length === 1 ? 'business' : 'businesses'}`]] : []),
                      ...(fee ? [['Creation fee', `${fee.display} charged`]] : []),
                    ]
                  : [
                      ['Account name', BUSINESS_NAME],
                      ['Asset', asset ?? ''],
                      ['Wallet label', label.trim()],
                    ]
                ).map(([k, v]) => (
                  <HdsListItem
                    key={k}
                    className="!py-2.5"
                    title={<span className="font-normal text-[#555354]">{k}</span>}
                    trailing={{
                      type: 'node',
                      node: (
                        <span className="flex items-center gap-1 text-[13px] font-medium text-[#222121]">
                          {k === 'Currency' && currencyOption && <img src={currencyOption.flag} alt="" className="size-3 rounded-full" />}
                          {k === 'Asset' && asset && <img src={ASSET_LOGO[asset]} alt="" className="size-3 rounded-full" />}
                          {v}
                        </span>
                      ),
                    }}
                  />
                ))}
              </div>
              <HdsAlert tone="blue" title={`${isMain ? 'Account' : 'Wallet'} setup in progress`}>
                {isMain
                  ? recipientRules
                    ? 'Your account details will be available once setup is complete.'
                    : 'Your account details and linked wallet will be available once setup is complete'
                  : 'Your wallet address will be available once setup is complete'}
              </HdsAlert>
            </div>
            <PrimaryButton onClick={finish}>Done</PrimaryButton>
          </div>
        </div>
      )}
    </Drawer>
  )
}
