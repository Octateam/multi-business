import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HdsAlert, HdsButton, HdsInput, HdsListItem, HdsSelect, HdsTextarea, HdsUploadBox } from '../../components/ui/hds'

// Contact Support — opened from "Payment not reflected?" in Funding details. The related account is
// prefilled and locked (disabled HDS Select, no chevron); category and subject are prefilled but editable.
// Form → Review details → Request sent. Continue stays disabled until every required field is provided.

export type SupportAccount = { name: string; currency: string; flag: string; last4?: string }

const CATEGORIES = ['Funding & Reconciliation', 'Payments & transfers', 'Accounts & access', 'Cards', 'Something else']
const MAX_CHARS = 500

const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const InfoGlyph = () => (
  <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.25 9a.75.75 0 011.5 0v4.25a.75.75 0 01-1.5 0V9z" clipRule="evenodd" />
  </svg>
)

export default function ContactSupportModal({ open, account, onClose }: { open: boolean; account: SupportAccount | null; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'review' | 'sent'>('form')
  const [category, setCategory] = useState<string | null>(CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ticket, setTicket] = useState('')

  useEffect(() => {
    if (!open) return
    setStep('form')
    setCategory(CATEGORIES[0])
    setSubject(account ? `${account.currency} payment not reflected` : '')
    setDescription('')
    setFile(null)
    setSubmitting(false)
  }, [open, account])

  // Escape closes only this modal, not the Funding details drawer underneath.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open || !account) return null

  const accountLabel = `${account.name} (${account.currency})${account.last4 && /\d/.test(account.last4) ? ` ••••• ${account.last4}` : ''}`
  const complete = Boolean(category && subject.trim() && description.trim() && file)
  const flagIcon = <img src={account.flag} alt="" className="size-5 rounded-full" />

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setTicket(`SUP-${Math.floor(100000 + Math.random() * 900000)}`)
      setSubmitting(false)
      setStep('sent')
    }, 900)
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-[fadeIn_160ms_ease-out] bg-[#111927]/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact Support"
        className="relative flex max-h-full w-[600px] max-w-full animate-[popIn_180ms_ease-out] flex-col overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_24px_64px_rgba(17,25,39,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#111927]">
              {step === 'review' ? 'Review details' : step === 'sent' ? 'Request sent' : 'Contact Support'}
            </h2>
            <p className="text-sm leading-5 text-[#555354]">
              {step === 'review'
                ? 'Check your request before sending it to Support.'
                : step === 'sent'
                  ? 'We’ve received your request and will get back to you by email.'
                  : 'Tell us what you need help with and we’ll get back to you.'}
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[#6b7280] transition-colors hover:text-[#111927]">
            <CloseGlyph />
          </button>
        </div>

        {step === 'form' && (
          <div className="mt-6 flex animate-[fadeIn_200ms_ease-out] flex-col gap-5">
            <HdsSelect label="Support category" required options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={setCategory} />
            <HdsInput label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. CHF payment not reflected" />
            <HdsSelect label="Related account" disabled options={[{ value: 'account', label: accountLabel, icon: flagIcon }]} value="account" onChange={() => {}} />
            <HdsTextarea
              label="Description"
              required
              rows={3}
              maxChars={MAX_CHARS}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about the payment, including who sent the payment, the expected amount, payment date, and any reference used."
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-5 text-[#111927]">
                Upload proof of payment<span className="ml-0.5">*</span>
              </p>
              <HdsUploadBox file={file} onFile={setFile} />
              <p className="flex items-center gap-1.5 text-xs leading-4 text-[#6b7280]">
                <InfoGlyph />
                We’ll use this to help review and reconcile your payment.
              </p>
            </div>
            <div className="mt-1 flex justify-end gap-3">
              <HdsButton variant="secondary" onClick={onClose}>
                Cancel
              </HdsButton>
              <HdsButton variant="primary" disabled={!complete} onClick={() => setStep('review')}>
                Review details
              </HdsButton>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="mt-6 flex animate-[fadeIn_200ms_ease-out] flex-col gap-5">
            <div className="flex flex-col divide-y divide-[#f2f4f7] rounded-[14px] border border-[#e1e4ea] px-4">
              {(
                [
                  ['Support category', category ?? ''],
                  ['Subject', subject.trim()],
                  ['Related account', accountLabel],
                  ['Description', description.trim()],
                  ['Proof of payment', file ?? ''],
                ] as const
              ).map(([label, value]) => (
                <HdsListItem key={label} reverse className="!py-3" subtitle={label} title={<span className="whitespace-pre-wrap break-words">{value}</span>} />
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <HdsButton variant="secondary" onClick={() => setStep('form')} disabled={submitting}>
                Edit details
              </HdsButton>
              <HdsButton variant="primary" loading={submitting} onClick={submit}>
                {submitting ? 'Sending…' : 'Send request'}
              </HdsButton>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="mt-6 flex animate-[fadeIn_200ms_ease-out] flex-col gap-5">
            <HdsAlert tone="green" title={`Reference ${ticket}`}>
              Your request about {accountLabel} is with our Funding & Reconciliation team. We’ll match your payment using the proof you uploaded and update your balance once it’s reconciled.
            </HdsAlert>
            <div className="flex justify-end">
              <HdsButton variant="primary" onClick={onClose}>
                Done
              </HdsButton>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
