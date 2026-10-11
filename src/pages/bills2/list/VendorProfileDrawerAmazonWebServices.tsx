import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import {
  BillsPageHeader,
  BillsStatCards,
  StatusPill,
} from './shared'
import { BillsWorkspace } from './BillsWorkspace'
import { HdsBadge, HdsButton } from '../../../components/ui/hds'
import iconCloseSquare from '../../../assets/icons/list1-close-square.svg'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start gap-4 px-4 py-0">
      <p className="w-[148px] shrink-0 text-sm text-[#525866]">{label}</p>
      <p className="flex-1 text-sm font-medium text-[#111927]">{value}</p>
    </div>
  )
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction?: () => void }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-lg font-semibold text-[#111927]">{title}</p>
      <HdsButton variant="link" className="text-sm" onClick={onAction}>
        {action}
      </HdsButton>
    </div>
  )
}

function DefaultBadge() {
  return <HdsBadge color="grey">Default</HdsBadge>
}

const LINKED_BILLS = [
  { name: 'Cloud infrastructure', amount: '$2,500.00', invoice: 'INV-00456  ·  Aug 15, 2026' },
  { name: 'Data storage', amount: '$2,500.00', invoice: 'INV-00456  ·  Aug 15, 2026' },
  { name: 'Compute services', amount: '$2,500.00', invoice: 'INV-00456  ·  Aug 15, 2026' },
]

const NOTES = [
  { author: 'John Doe (you)', date: 'Aug 16, 2026 · 4:00 PM', text: 'Primary cloud provider for infrastructure and hosting services.', own: true },
  { author: 'Theo Olsen', date: 'Aug 16, 2026 · 4:00 PM', text: 'Primary cloud provider for infrastructure and hosting services.', own: false },
]

// Figma node 45033:224316 — "Bills list — Vendor profile drawer (Amazon Web Services)"
export default function VendorProfileDrawerAmazonWebServices() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <div className="fixed inset-0 z-10 bg-black/30" onClick={() => navigate('/bills')} />

        <BillsPageHeader subtitle="Review, approve, and pay what you owe vendors — one-off or recurring." />
        <BillsStatCards />
        <BillsWorkspace />

        <aside className="fixed bottom-10 right-10 top-10 z-20 flex w-[560px] flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
              Vendor information
            </h2>
            <button type="button" onClick={() => navigate('/bills')} aria-label="Close vendor profile">
              <img src={iconCloseSquare} alt="" className="size-6" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-8">
            {/* Vendor identity */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <p className="font-heading text-[22px] font-semibold text-[#111927]">Amazon Web Services</p>
                <StatusPill label="Active" />
              </div>
              <p className="text-sm text-[#6c737f]">Cloud infrastructure and services</p>
            </div>

            {/* Overview */}
            <div className="flex flex-col gap-3">
              <SectionHeader title="Overview" action="Edit" onAction={() => navigate('/bills/list/edit-overview-modal-amazon-web-services')} />
              <div className="flex flex-col gap-4 rounded-xl bg-[#f9fafb] py-4">
                <DetailRow label="Vendor name" value="Amazon Web Services" />
                <DetailRow label="Vendor type" value="Business" />
                <DetailRow label="Category" value="Technology" />
                <DetailRow label="Tax ID" value="12-3456789" />
                <DetailRow label="Date added" value="Jan 10, 2026" />
                <DetailRow label="Last updated" value="Aug 15, 2026" />
              </div>
            </div>

            {/* Payment details */}
            <div className="flex flex-col gap-3">
              <SectionHeader title="Payment details" action="Add payment method" onAction={() => navigate('/bills/list/add-payment-method-modal-country-selector')} />
              <div className="flex flex-col gap-4 rounded-xl bg-[#f9fafb] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#e1e4e9] text-[10px] font-semibold text-[#111927]">$</span>
                    <p className="text-sm font-semibold text-[#111927]">USD account</p>
                    <DefaultBadge />
                  </div>
                </div>
                <DetailRow label="Account name" value="Amazon Web Services, Inc." />
                <DetailRow label="Account number" value="•••• 1234" />
                <DetailRow label="Bank name" value="JPMorgan Chase Bank" />
                <DetailRow label="Payment method" value="ACH (bank transfer)" />
              </div>
              <div className="flex flex-col gap-4 rounded-xl bg-[#f9fafb] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#e1e4e9] text-[10px] font-semibold text-[#111927]">£</span>
                    <p className="text-sm font-semibold text-[#111927]">GBP account</p>
                  </div>
                  <HdsButton
                    variant="link"
                    size="sm"
                    className="!text-xs"
                    onClick={() => navigate('/bills/list/vendor-profile-drawer-edit-gbp-beneficiary-amazon-web-services')}
                  >
                    Edit GBP beneficiary
                  </HdsButton>
                </div>
                <DetailRow label="Account name" value="Amazon Web Services Ltd" />
                <DetailRow label="Account number" value="•••• 5678" />
                <DetailRow label="Bank name" value="Barclays Bank" />
                <DetailRow label="Payment method" value="SWIFT (bank transfer)" />
              </div>
            </div>

            {/* Contact information */}
            <div className="flex flex-col gap-3">
              <SectionHeader title="Contact information" action="Edit" onAction={() => navigate('/bills/list/edit-contact-details-modal-amazon-web-services')} />
              <div className="flex flex-col gap-4 rounded-xl bg-[#f9fafb] py-4">
                <DetailRow label="Email" value="aws-billing@amazon.com" />
                <DetailRow label="Phone" value="+1 (206) 266-4064" />
                <DetailRow label="Address" value="410 Terry Ave N Seattle, WA 98109 United States" />
              </div>
            </div>

            {/* Linked bills */}
            <div className="flex flex-col gap-3">
              <SectionHeader title="Linked bills" action="View all" onAction={() => navigate('/bills')} />
              <div className="flex flex-col divide-y divide-[#efefef] rounded-xl border border-[#efefef]">
                {LINKED_BILLS.map((b) => (
                  <div key={b.name} className="flex flex-col gap-1 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#111927]">{b.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#111927]">{b.amount}</p>
                        <StatusPill label="Paid" />
                      </div>
                    </div>
                    <p className="text-xs text-[#9aa1ac]">{b.invoice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-3 pb-2">
              <SectionHeader title="Notes" action="Add note" />
              <div className="flex flex-col gap-4">
                {NOTES.map((n, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-xl bg-[#f9fafb] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#111927]">{n.author}</p>
                      {n.own && (
                        <HdsButton variant="destructive-link" size="sm" className="!text-xs">
                          Delete
                        </HdsButton>
                      )}
                    </div>
                    <p className="text-xs text-[#9aa1ac]">{n.date}</p>
                    <p className="text-sm text-[#4b5563]">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </AppShell>
  )
}
