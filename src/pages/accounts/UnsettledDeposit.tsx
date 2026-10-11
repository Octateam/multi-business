import { useEffect, useState } from 'react'
import { HdsButton, HdsInput, HdsUploadBox } from '../../components/ui/hds'
import { Drawer } from './ui'

// "Expecting a payment?" — opened from the top right of a Sokin account's details page. The customer uploads the
// proof of payment for a deposit that hasn't reached their balance (the transaction reference is optional) so it can
// be investigated and reconciled.

const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export default function UnsettledDepositDrawer({ open, currency, accountName, onClose }: { open: boolean; currency: string; accountName: string; onClose: () => void }) {
  const [file, setFile] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const [sent, setSent] = useState(false)

  // Every time the drawer opens it starts on an empty form.
  useEffect(() => {
    if (!open) return
    setFile(null)
    setReference('')
    setSent(false)
  }, [open])

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex min-h-full flex-col gap-6 px-6 pb-8 pt-[34px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {!sent && <h2 className="font-heading text-[25.6px] font-medium leading-[26px] text-[#222121]">Unsettled deposit</h2>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[#6b7280] transition-colors hover:text-[#111927]">
            <CloseGlyph />
          </button>
        </div>

        {!sent ? (
          <>
            <p className="-mt-4 text-sm leading-5 text-[#555354]">Upload proof of payment for a {currency} deposit that hasn’t arrived.</p>
            <HdsUploadBox label="Proof of payment" file={file} onFile={setFile} hint="Bank confirmation or receipt · PDF, JPG or PNG up to 10MB" />
            <HdsInput
              label="Transaction reference"
              optional
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. KRD-7X92LM or your bank’s transaction ID"
            />
            <div className="mt-auto flex flex-col pt-2">
              <HdsButton variant="primary" fullWidth disabled={!file} onClick={() => setSent(true)}>
                Submit
              </HdsButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 pt-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#e6f7f1] text-[#077155]">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h2 className="font-heading text-[25.6px] font-medium leading-[30px] text-[#222121]">Proof of payment received</h2>
              <p className="text-sm leading-5 text-[#555354]">
                We’ll investigate this deposit and credit your {accountName} {currency} balance once it’s matched. We’ll email you if we need anything else.
              </p>
            </div>
            <dl className="flex flex-col gap-2 rounded-[14px] border border-[#e1e4ea] bg-white p-4 text-[13px]">
              {[
                ['Document', file ?? ''],
                ['Transaction reference', reference.trim() || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">{k}</dt>
                  <dd className="truncate text-right font-medium text-[#111927]">{v}</dd>
                </div>
              ))}
            </dl>
            <HdsButton variant="primary" fullWidth onClick={onClose} className="mt-auto">
              Done
            </HdsButton>
          </>
        )}
      </div>
    </Drawer>
  )
}
