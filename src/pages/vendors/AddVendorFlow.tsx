import { useRef, useState, type ReactNode } from 'react'
import { HdsToggleSegment } from '../../components/ui/hds'
import { dialFor } from '../bills2/hdsKit'
import type { VendorType } from './shared'
import { ImportVendorsPanel } from './ImportVendorsFlow'
import {
  BackHeader,
  CategoryField,
  ContactFields,
  CountryField,
  DrawerBody,
  EMPTY_DRAFT,
  FlowDrawer,
  FormSection,
  NameFields,
  PaymentFields,
  SubmitFooter,
  VendorFlowToast,
  contactAddress,
  isEmail,
  maskAccount,
  missingFields,
  missingHint,
  railFor,
  resolvedAccountName,
  routingLabel,
  useClosingDrawer,
  vendorDisplayName,
  type DraftErrors,
  type VendorDraft,
} from './vendorFormKit'

import iconClose from '../../assets/icons/addvendor-close-square.svg'
import iconCaret from '../../assets/icons/addvendor-caret-right.svg'
import iconManual from '../../assets/icons/addvendor-opt-manual.svg'
import iconCsv from '../../assets/icons/addvendor-opt-csv.svg'
import iconEdit from '../../assets/icons/addvendor-edit-pencil.svg'

// Add vendor — manual entry. Figma 48069:424772 (frames 48069:411940 … 48069:418575).
// choose (Add vendor manually / Import from CSV) → form (Individual | Business, category, payment
// details by country rail, contact details) → review (Edit per card) → submit for approval.

export type NewVendor = { name: string; email: string; category: string; type: 'Business' | 'Individual' }

type Step = 'choose' | 'form' | 'review' | 'import'

export function AddVendorDrawer({
  onClose,
  onDone,
  onImported,
  startAt = 'choose',
  failFirstSubmit,
}: {
  onClose: () => void
  onDone: (vendor: NewVendor) => void
  /** Called when the "Import from CSV" path finishes. Defaults to just closing the drawer. */
  onImported?: (count: number) => void
  /** 'choose' (default) opens on the "Add vendor manually / Import from CSV" chooser. */
  startAt?: 'choose' | 'form'
  /** Demo hook: the first "Submit for approval" fails (Figma 48069:418575) and "Try again" succeeds. */
  failFirstSubmit?: boolean
}) {
  const { open, close } = useClosingDrawer(onClose)
  const [step, setStep] = useState<Step>(startAt)
  const [draft, setDraft] = useState<VendorDraft>(EMPTY_DRAFT)
  const [emailTouched, setEmailTouched] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(true)
  const [contactOpen, setContactOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)
  const failNext = useRef(!!failFirstSubmit)
  const sectionRefs = { vendor: useRef<HTMLDivElement>(null), payment: useRef<HTMLDivElement>(null), contact: useRef<HTMLDivElement>(null) }

  const set = (patch: Partial<VendorDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const missing = missingFields(draft)
  const valid = missing.length === 0
  // Errors only for the email once it has been touched and is malformed — empty fields never show errors.
  const errors: DraftErrors = emailTouched && draft.email.trim() && !isEmail(draft.email) ? { email: 'Enter a valid email address' } : {}

  const finish = (fn: () => void) => {
    setTimeout(fn, 0)
  }

  const submit = () => {
    setSubmitting(true)
    setFailed(false)
    window.setTimeout(() => {
      setSubmitting(false)
      if (failNext.current) {
        failNext.current = false
        setFailed(true)
        return
      }
      const vendor: NewVendor = { name: vendorDisplayName(draft), email: draft.email.trim(), category: draft.category, type: draft.type }
      finish(() => onDone(vendor))
    }, 900)
  }

  const editSection = (key: keyof typeof sectionRefs) => {
    setStep('form')
    if (key === 'payment') setPaymentOpen(true)
    if (key === 'contact') setContactOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => sectionRefs[key].current?.scrollIntoView({ block: 'start', behavior: 'smooth' })))
  }

  let body: ReactNode
  if (step === 'choose') {
    body = (
      <DrawerBody scrollKey="choose">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#222121]">Add vendor</h2>
            <button type="button" onClick={close} aria-label="Close" className="flex size-6 items-center justify-center rounded-md transition-opacity hover:opacity-70">
              <img src={iconClose} alt="" width={24} height={24} />
            </button>
          </div>
          <p className="text-sm leading-5 text-[#555354]">Add vendors manually or upload a CSV file</p>
        </div>
        <div className="flex flex-col gap-4">
          <ChooserOption icon={iconManual} iconSize="inset-[7.29%]" title="Add vendor manually" subtitle="Enter each vendor’s details" onClick={() => setStep('form')} />
          <ChooserOption icon={iconCsv} iconSize="inset-[6.77%_7.29%_6.77%_7.28%]" title="Import from CSV" subtitle="Upload a file to upload many vendors at once" onClick={() => setStep('import')} />
        </div>
      </DrawerBody>
    )
  } else if (step === 'import') {
    body = (
      <ImportVendorsPanel
        onBack={() => setStep('choose')}
        onDone={(count) => finish(() => (onImported ? onImported(count) : close()))}
      />
    )
  } else if (step === 'form') {
    const rail = railFor(draft.country)
    body = (
      <DrawerBody
        scrollKey="form"
        footer={<SubmitFooter label="Review" enabled={valid} hint={missingHint(missing.map((m) => m.label))} onClick={() => setStep('review')} />}
      >
        <BackHeader title="Add vendor" onBack={() => (startAt === 'choose' ? setStep('choose') : close())} />
        <div ref={sectionRefs.vendor} className="flex scroll-mt-4 flex-col gap-4">
          <HdsToggleSegment<VendorType>
            className="flex w-full [&>button]:flex-1"
            options={[
              { value: 'Individual', label: 'Individual' },
              { value: 'Business', label: 'Business' },
            ]}
            value={draft.type}
            onChange={(t) => set({ type: t })}
          />
          <NameFields draft={draft} set={set} errors={errors} />
          <CategoryField draft={draft} set={set} errors={errors} />
        </div>
        <div ref={sectionRefs.payment} className="scroll-mt-4">
          <FormSection title="Payment details" open={!rail || paymentOpen} onToggle={rail ? () => setPaymentOpen((o) => !o) : undefined}>
            <CountryField draft={draft} set={set} errors={errors} />
            <PaymentFields draft={draft} set={set} errors={errors} />
          </FormSection>
        </div>
        <div ref={sectionRefs.contact} className="scroll-mt-4">
          <FormSection title="Contact details" open={contactOpen} onToggle={() => setContactOpen((o) => !o)}>
            <ContactFields draft={draft} set={set} errors={errors} onEmailBlur={() => setEmailTouched(true)} />
          </FormSection>
        </div>
      </DrawerBody>
    )
  } else {
    body = (
      <DrawerBody scrollKey="review" footer={<SubmitFooter label="Submit for approval" enabled loading={submitting} onClick={submit} />}>
        <BackHeader title="Review" onBack={() => setStep('form')} />
        <ReviewCards draft={draft} onEdit={editSection} />
      </DrawerBody>
    )
  }

  return (
    <>
      <FlowDrawer open={open} onClose={close}>
        {body}
      </FlowDrawer>
      {failed && (
        <VendorFlowToast
          tone="error"
          title="Vendor submission failed"
          body="We couldn't submit this vendor for approval. Please try again."
          onClose={() => setFailed(false)}
          onRetry={submit}
        />
      )}
    </>
  )
}

/* ---------------------------------------------------------------------- */
/*  Chooser option — Figma "Navigation option" (48069:412282)              */
/* ---------------------------------------------------------------------- */

function ChooserOption({ icon, iconSize, title, subtitle, onClick }: { icon: string; iconSize: string; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[84px] w-full items-center gap-3 rounded-lg border border-[#d6d6d6] p-4 text-left transition-colors hover:border-[#004b87] hover:bg-[#f8fbfe]"
    >
      <span className="flex shrink-0 items-center rounded-full bg-[#f6f6f6] p-3">
        <span className="relative size-[18px]">
          <span className={`absolute ${iconSize}`}>
            <img src={icon} alt="" className="absolute inset-0 block size-full max-w-none" />
          </span>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium leading-5 text-[#222121]">{title}</span>
        <span className="text-xs leading-4 text-[#555354]">{subtitle}</span>
      </span>
      <img src={iconCaret} alt="" width={16} height={16} className="shrink-0" />
    </button>
  )
}

/* ---------------------------------------------------------------------- */
/*  Review — Figma 48069:418155                                            */
/* ---------------------------------------------------------------------- */

function ReviewCard({ title, rows, onEdit }: { title: string; rows: [string, ReactNode][]; onEdit: () => void }) {
  return (
    <div className="flex w-full flex-col rounded-lg border border-[#e3e8eb] p-[15px]">
      <div className="flex h-[30px] items-center justify-between">
        <p className="text-xs font-semibold leading-[19.5px] text-[#0c2129]">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 rounded-full bg-[#eaf2f9] px-3.5 py-1.5 text-[13px] font-semibold leading-5 text-[#004b87] transition-colors hover:bg-[#d1e3f3]"
        >
          Edit
          <span className="relative size-4">
            <span className="absolute inset-[5.21%_5.22%_5.2%_5.21%]">
              <img src={iconEdit} alt="" className="absolute inset-0 block size-full max-w-none" />
            </span>
          </span>
        </button>
      </div>
      <dl className="flex flex-col pt-2.5">
        {rows.map(([term, value], i) => (
          <div key={term} className={`flex items-start justify-between gap-4 py-2 ${i < rows.length - 1 ? 'border-b border-[#eff2f4]' : ''}`}>
            <dt className="shrink-0 text-[13px] leading-5 text-[#6b7280]">{term}</dt>
            <dd className="min-w-0 break-words text-right text-xs font-medium leading-5 text-[#0c2129]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function reviewRows(draft: VendorDraft) {
  const vendor: [string, ReactNode][] =
    draft.type === 'Business'
      ? [['Business name', draft.businessName]]
      : [
          ['First name', draft.firstName],
          ['Last name', draft.lastName],
        ]
  vendor.push(['Category', draft.category])

  const rail = railFor(draft.country)
  const payment: [string, ReactNode][] = [['Country', draft.country]]
  if (rail === 'bank') {
    payment.push(
      ['Account name', draft.accountName],
      ['Bank name', draft.bankName],
      [routingLabel(draft.country), draft.routingNumber],
      ['Account type', draft.accountType],
      ['Account number', maskAccount(draft.accountNumber)],
    )
    if (draft.swift) payment.push(['SWIFT/BIC', draft.swift])
  } else if (rail === 'local') {
    payment.push(['Bank name', draft.bankName], ['Account number', maskAccount(draft.accountNumber)], ['Account name', resolvedAccountName(draft)])
    if (draft.bankCode) payment.push(['Bank code', draft.bankCode])
    if (draft.swift) payment.push(['SWIFT/BIC', draft.swift])
  } else if (rail === 'mobile') {
    payment.push(['Mobile operator', draft.mobileOperator], ['Phone number', draft.mobileNumber], ['Account name', resolvedAccountName(draft)])
  }
  if (draft.hasTaxId && draft.taxId) payment.push(['Tax ID', draft.taxId])

  const contact: [string, ReactNode][] = [['Email', draft.email]]
  if (draft.phone.trim()) contact.push(['Phone number', `${dialFor(draft.phoneIso)}${draft.phone.trim()}`])
  const addr = contactAddress(draft)
  if (addr) contact.push(['Address', addr])
  return { vendor, payment, contact }
}

function ReviewCards({ draft, onEdit }: { draft: VendorDraft; onEdit: (section: 'vendor' | 'payment' | 'contact') => void }) {
  const { vendor, payment, contact } = reviewRows(draft)
  return (
    <div className="flex flex-col gap-4">
      <ReviewCard title="Vendor details" rows={vendor} onEdit={() => onEdit('vendor')} />
      <ReviewCard title="Payment detail" rows={payment} onEdit={() => onEdit('payment')} />
      <ReviewCard title="Contact details" rows={contact} onEdit={() => onEdit('contact')} />
    </div>
  )
}
