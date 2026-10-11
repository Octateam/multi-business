import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import QuickActionsHeader from '../../../components/home/QuickActionsHeader'
import BalanceChart from '../../../components/home/BalanceChart'
import RecentTransactions from '../../../components/home/RecentTransactions'
import AccountsPanel from '../../../components/home/AccountsPanel'
import flagUsd from '../../../assets/icons/home-flag-usd.svg'
import flagEur from '../../../assets/icons/home-flag-eur.svg'
import flagGbp from '../../../assets/icons/home-flag-gbp.svg'
import cancelSquare from '../../../assets/icons/kyb-cancel-square.svg'
import { FieldInput, FieldSelect } from '../shared'
import { useBusinessContext } from '../../../context/BusinessContext'
import { PhoneField, BUSINESS_CATEGORIES, BUSINESS_TYPES } from './kybShared'
import { initialsOf, startDraft, useNewBusinessDraft } from './newBusinessDraft'

// Step 1 of the "Add a new business" -> KYB flow (Figma node 46940:241060,
// filed under the misleading name "Link 11 — Request rejected" in the
// source file — verified by screenshot to actually be the "Tell us about
// your new business" modal). It's a centered dialog over the Home
// dashboard, so the dimmed background behind it reuses Home's real content
// (QuickActionsHeader/BalanceChart/RecentTransactions/AccountsPanel) rather
// than re-fetching that screen from Figma — only the modal itself came from
// a fresh get_design_context call.
export default function InitialInfo() {
  const navigate = useNavigate()
  const { upsertBusiness } = useBusinessContext()
  // Re-opening this modal mid-flow shows what was entered last time (the draft store survives
  // route remounts); a fresh start is empty.
  const draft = useNewBusinessDraft()
  const [legalName, setLegalName] = useState(draft.businessName)
  const [email, setEmail] = useState(draft.email)
  const [phoneCountry, setPhoneCountry] = useState(draft.phoneCountry)
  const [phone, setPhone] = useState(draft.phone)
  const [category, setCategory] = useState(draft.category)
  const [type, setType] = useState(draft.type)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSubmit = [legalName, email, phone, category, type].every((value) => value.trim() !== '') && emailValid

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    const name = legalName.trim()
    // Re-use the same business entry if the user comes back and edits these details.
    const businessId = draft.businessId ?? `new-${Date.now().toString(36)}`
    // "Enter the business details to create and add it to your profile" — the business exists from
    // here on (KYB pending) and shows up in the switcher / Manage businesses with the entered name.
    upsertBusiness({
      id: businessId,
      name,
      type,
      email: email.trim(),
      owner: 'John Doe (you)',
      teamCount: 1,
      plan: '—',
      status: 'kyb-pending',
      isDefault: false,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      initials: initialsOf(name),
    })
    startDraft({ businessId, businessName: name, email, phoneCountry, phone, category, type })
    navigate('/businesses/add/company')
  }

  return (
    <AppShell>
      <div className="relative h-full w-full overflow-hidden">
        <main
          aria-hidden
          className="pointer-events-none flex w-full flex-col items-start gap-9 pb-10 pt-10 opacity-40 blur-[1px]"
        >
          <QuickActionsHeader />
          <div className="flex w-full flex-col gap-9">
            <BalanceChart flagIcons={{ usd: flagUsd, eur: flagEur, gbp: flagGbp }} />
            <div className="flex w-full items-stretch gap-6">
              <RecentTransactions />
              <AccountsPanel />
            </div>
          </div>
        </main>

        <div className="fixed inset-0 flex items-center justify-center bg-[#111927]/40 p-6">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-[611px] flex-col gap-6 rounded-2xl bg-surface px-6 py-8 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-heading text-[22px] font-semibold text-text-primary">
                  Tell us about your new business
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="shrink-0 rounded-md transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]"
                  aria-label="Close"
                >
                  <img src={cancelSquare} alt="" className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm font-medium text-[#555354]">
                We&rsquo;ll use this information to set up your business on Hinstantt.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-[#edeff2] pb-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternary">Business details</p>
              <FieldInput label="Legal business name" value={legalName} onChange={setLegalName} placeholder="e.g. Novu Bistro" />
              <FieldInput
                label="Business email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="e.g. hello@novubistro.com"
              />
              <PhoneField value={phone} onChange={setPhone} country={phoneCountry} onCountryChange={setPhoneCountry} />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternary">Business information</p>
              <FieldSelect
                label="Business category"
                value={category}
                onChange={setCategory}
                options={BUSINESS_CATEGORIES}
                placeholder="Select a category"
              />
              <FieldSelect label="Business type" value={type} onChange={setType} options={BUSINESS_TYPES} placeholder="Select a type" />
            </div>

            <Button type="submit" disabled={!canSubmit} variant="primary" size="lg" className="w-full">
              Continue
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
