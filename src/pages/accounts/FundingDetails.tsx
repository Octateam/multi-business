import { useEffect, useState } from 'react'
import { Drawer } from './ui'
import { HdsAlert, HdsButton, HdsIconTile, HdsListItem, HdsNote } from '../../components/ui/hds'
import ContactSupportModal from './ContactSupport'
import { downloadBlob, textPdf } from '../../lib/simplePdf'
import { fetchProviderFundingDetails, type ApprovedRecipient, type ApprovedRecipientsConfig, type FundingDetailsConfig, recipientInitials } from './currencies'

// "Funding details" for accounts held with a provider (e.g. Sokin, shown as BMO Bank). Every element is an
// HDS component: List Item (hero, copyable detail rows, fee card), Alert, Button and Note.
// The details are configuration, fetched fresh every time the drawer opens — nothing is bundled in the app.

export type FundingDetailsAccount = {
  name: string
  currency: string
  provider: string
  last4?: string
  recipients?: ApprovedRecipient[]
  /** Bank picked at creation (BMO Bank or a local partner bank) — overrides the config's bank name. */
  bank?: string
  /** This account's Kredete Customer Reference — overrides the config's sample value. */
  customerRef?: string
}

type Loaded = { details: FundingDetailsConfig; bank: string; flag: string; currencyName: string; recipientRules: ApprovedRecipientsConfig | null }

// Plain line icons — no filled frame behind the close or copy glyphs.
const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
const CopyGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
  </svg>
)

const Check = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export default function FundingDetailsDrawer({ account, open, onClose }: { account: FundingDetailsAccount | null; open: boolean; onClose: () => void }) {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; data?: Loaded; error?: string }>({ status: 'loading' })
  const [nonce, setNonce] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)

  useEffect(() => {
    if (!open || !account) return
    let live = true
    setState({ status: 'loading' })
    fetchProviderFundingDetails(account.provider, account.currency)
      .then((data) => live && setState({ status: 'ready', data }))
      .catch((e: Error) => live && setState({ status: 'error', error: e.message }))
    return () => {
      live = false
    }
  }, [open, account, nonce])

  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(key)
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400)
  }

  const fill = (text: string) => text.replace(/\{currency\}/g, account?.currency ?? '').replace(/\{accountName\}/g, account?.name ?? '')
  const data = state.data
  // The bank picked at creation and this account's own Kredete Customer Reference replace the config's sample values.
  const fields = (data?.details.fields ?? []).map((f) =>
    /^bank name$/i.test(f.label) && account?.bank
      ? { ...f, value: account.bank }
      : /kredete customer reference/i.test(f.label) && account?.customerRef
        ? { ...f, value: account.customerRef }
        : f,
  )
  const bankName = account?.bank ?? data?.bank
  const all = fields.map((f) => `${f.label}: ${f.value}`).join('\n')
  // A PDF of the funding details the account holder can share with whoever is sending the money.
  const download = () => {
    if (!account || !data) return
    const blob = textPdf({
      title: `${account.currency} funding details`,
      subtitle: `Use these details to receive ${account.currency} into your ${account.name} account (${data.bank}). Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      rows: [{ label: 'Account', value: account.name }, ...fields.map((f) => ({ label: f.label, value: f.value }))],
      footer: 'Only approved senders can fund this account. Payments from other senders may be returned.',
    })
    downloadBlob(blob, `${account.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${account.currency.toLowerCase()}-funding-details.pdf`)
    setCopied('__pdf')
    window.setTimeout(() => setCopied((c) => (c === '__pdf' ? null : c)), 1400)
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-[34px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-[25.6px] font-medium leading-[26px] text-[#222121]">Funding details</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="text-[#6b7280] transition-colors hover:text-[#111927]">
              <CloseGlyph />
            </button>
          </div>
          <p className="text-sm leading-5 text-[#555354]">Use these details to fund your {account?.currency} balance</p>
        </div>

        {state.status === 'loading' && (
          <div className="flex flex-col gap-3" role="status" aria-label="Loading the latest funding details">
            <p className="flex items-center gap-2 text-xs text-[#70707d]">
              <span className="size-3 animate-spin rounded-full border-2 border-[#004b87]/20 border-t-[#004b87]" />
              Getting the latest details…
            </p>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-[52px] animate-pulse rounded-lg bg-[#f5f6f8]" style={{ animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <HdsAlert tone="red" title="We couldn’t load the funding details">
            <span className="flex flex-col items-start gap-2">
              {state.error ?? 'Please try again.'}
              <HdsButton variant="primary" size="sm" onClick={() => setNonce((n) => n + 1)}>
                Try again
              </HdsButton>
            </span>
          </HdsAlert>
        )}

        {state.status === 'ready' && data && (
          <div className="flex animate-[fadeIn_220ms_ease-out] flex-col gap-6">
            <HdsListItem
              className="!py-0"
              leading={<img src={data.flag} alt="" className="size-14 shrink-0 rounded-full shadow-[0_3.5px_6px_rgba(16,24,40,0.18)]" />}
              title={<span className="font-heading text-base">Receive {data.currencyName}</span>}
              subtitle={`${account?.currency} account · ${bankName}`}
            />

            <div className="flex flex-col divide-y divide-[#f2f4f7] rounded-[14px] border border-[#e1e4ea] bg-white px-4">
              {fields.map((f) => (
                <HdsListItem
                  key={f.label}
                  reverse
                  title={f.value}
                  subtitle={f.label}
                  trailing={{
                    type: 'node',
                    node: (
                      <button
                        type="button"
                        aria-label={`Copy ${f.label.toLowerCase()}`}
                        title={copied === f.label ? 'Copied' : `Copy ${f.label.toLowerCase()}`}
                        onClick={() => copy(f.label, f.value)}
                        className="flex size-6 items-center justify-center text-[#9aa1ac] transition-colors hover:text-[#111927]"
                      >
                        {copied === f.label ? <Check className="size-4 text-[#077155]" /> : <CopyGlyph />}
                      </button>
                    ),
                  }}
                />
              ))}
            </div>

            {/* Copy details (secondary) and Download details (primary) sit right under the account details. */}
            <div className="flex gap-3">
              <HdsButton variant="secondary" className="flex-1" onClick={() => copy('__all', all)}>
                {copied === '__all' ? 'Details copied' : 'Copy details'}
              </HdsButton>
              <HdsButton variant="primary" className="flex-1" onClick={download}>
                {copied === '__pdf' ? 'Downloaded' : 'Download details'}
              </HdsButton>
            </div>

            {data.details.fundingFee && <HdsListItem style="card" title={data.details.fundingFee.label} trailing={{ type: 'value', value: data.details.fundingFee.value }} />}

            {account?.recipients && account.recipients.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold leading-5 text-[#222121]">Approved Recipients</h3>
                </div>
                <div className="flex flex-col divide-y divide-[#f2f4f7] rounded-[14px] border border-[#e1e4ea] bg-white px-4">
                  {account.recipients.map((r, i) => (
                    <HdsListItem
                      key={i}
                      className="!py-3"
                      leading={<HdsIconTile size={32}>{recipientInitials(r.name)}</HdsIconTile>}
                      title={r.name}
                      subtitle={`${r.bankName} · ${r.bankCountry} · ${r.identifier}`}
                    />
                  ))}
                </div>
                <HdsAlert tone="blue">
                  Only the approved recipients above should send funds to this account. Payments from other senders may require additional review
                  before they can be credited. If you need to update this list,{' '}
                  <button type="button" onClick={() => setSupportOpen(true)} className="font-semibold text-[#004b87] underline-offset-2 hover:underline">
                    Contact Support
                  </button>
                  .
                </HdsAlert>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {data.details.notes.map((n, i) => (
                <HdsNote key={n.title} title={n.title} lines={n.items.map(fill)} collapsible defaultOpen={i === 0} />
              ))}
            </div>

          </div>
        )}
      </div>
      {/* Payment not reflected? stays pinned at the bottom of the drawer and opens Contact Support. */}
      {state.status === 'ready' && data && (
        <div className="sticky bottom-0 flex flex-col gap-4 border-t border-[#edeff2] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#004b87] text-[13px] font-bold text-white" aria-hidden="true">
              ?
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[13px] font-semibold leading-5 text-[#111927]">Payment not reflected?</p>
              <p className="text-xs leading-4 text-[#6b7280]">Contact Support if you have already sent funds and your balance has not updated.</p>
            </div>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#004b87] hover:underline"
            >
              Contact Support
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>
      <ContactSupportModal
        open={supportOpen}
        account={account && data ? { name: account.name, currency: account.currency, flag: data.flag, last4: account.last4 } : null}
        onClose={() => setSupportOpen(false)}
      />
    </Drawer>
  )
}
