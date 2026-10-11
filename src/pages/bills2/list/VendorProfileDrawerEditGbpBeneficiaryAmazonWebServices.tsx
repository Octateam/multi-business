import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Badge from '../../../components/ui/Badge'
import { HdsBadge, HdsButton } from '../../../components/ui/hds'
import { useDismiss } from '../hdsKit'
import { BillsPageBackdrop, ModalBackdrop, EditChip } from './paymentMethodShared'
import cancelSquare from '../../../assets/icons/list2-cancel-square.svg'
import infoCircle from '../../../assets/icons/list2-info-circle.svg'
import flagUsd from '../../../assets/icons/list2-flag-usd.svg'
import flagGbp from '../../../assets/icons/list2-flag-gbp.svg'

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-base font-semibold text-[#1a1d23]">{title}</p>
      {action}
    </div>
  )
}

function LinkAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <HdsButton variant="link" className="text-sm" onClick={onClick}>
      {label}
    </HdsButton>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-4 text-[13px]">
      <p className="w-[148px] shrink-0 text-[#6b7280]">{label}</p>
      <div className="flex-1 font-medium text-[#1a1d23]">{value}</div>
    </div>
  )
}

function MiniBadge({ label, tone }: { label: string; tone: 'green' | 'navy' }) {
  return <HdsBadge color={tone}>{label}</HdsBadge>
}

export default function VendorProfileDrawerEditGbpBeneficiaryAmazonWebServices() {
  const navigate = useNavigate()
  const [popoverOpen, setPopoverOpen] = useState(true)
  const popoverRef = useDismiss(popoverOpen, () => setPopoverOpen(false))
  const close = () => navigate('/bills')

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />

        <div className="fixed bottom-10 right-10 top-10 z-50 flex w-[560px] flex-col overflow-y-auto rounded-2xl bg-white p-6">
          {/* Sheet title */}
          <div className="mb-6 flex w-full items-center justify-between">
            <p className="font-heading text-2xl font-semibold text-text-primary">Vendor information</p>
            <button type="button" onClick={close} aria-label="Close">
              <img src={cancelSquare} alt="" className="size-6" />
            </button>
          </div>

          <div className="flex w-full flex-1 flex-col gap-6">
            {/* Vendor identity */}
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <p className="text-xl font-semibold text-[#1a1d23]">Amazon Web Services</p>
                <MiniBadge label="Active" tone="green" />
              </div>
              <p className="text-[13px] text-[#6b7280]">Cloud infrastructure and services</p>
            </div>

            {/* Overview */}
            <div className="flex w-full flex-col gap-3">
              <SectionHeader
                title="Overview"
                action={<EditChip onClick={() => navigate('/bills/list/edit-overview-modal-amazon-web-services')} />}
              />
              <div className="flex w-full flex-col gap-4 rounded-xl border border-[#e3e8ef] p-4">
                <InfoRow label="Vendor name" value="Amazon Web Services" />
                <InfoRow label="Vendor type" value="Business" />
                <InfoRow label="Category" value="Technology" />
                <InfoRow label="Tax ID" value="12-3456789" />
                <InfoRow label="Date added" value="Jan 10, 2026" />
                <InfoRow label="Last updated" value="Aug 15, 2026" />
              </div>
            </div>

            {/* Payment details */}
            <div className="flex w-full flex-col gap-3">
              <SectionHeader
                title="Payment details"
                action={
                  <LinkAction
                    label="Add payment method"
                    onClick={() => navigate('/bills/list/add-payment-method-modal-country-selector')}
                  />
                }
              />
              <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                <div className="flex w-full items-center gap-2">
                  <img src={flagUsd} alt="" className="size-5" />
                  <p className="flex-1 text-base font-semibold text-[#1a1d23]">USD account</p>
                  <MiniBadge label="Default" tone="navy" />
                  <img src={infoCircle} alt="" className="size-5" />
                </div>
                <InfoRow label="Account name" value="Amazon Web Services, Inc." />
                <InfoRow label="Account number" value="•••• 1234" />
                <InfoRow label="Bank name" value="JPMorgan Chase Bank" />
                <InfoRow label="Payment method" value="ACH (bank transfer)" />
              </div>

              <div ref={popoverRef} className="relative flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                <div className="flex w-full items-center gap-2">
                  <img src={flagGbp} alt="" className="size-5" />
                  <p className="flex-1 text-base font-semibold text-[#1a1d23]">GBP account</p>
                  <button type="button" onClick={() => setPopoverOpen((open) => !open)} aria-label="Beneficiary details">
                    <img src={infoCircle} alt="" className="size-5" />
                  </button>
                </div>
                <InfoRow label="Account name" value="Amazon Web Services Ltd" />
                <InfoRow label="Account number" value="•••• 5678" />
                <InfoRow label="Bank name" value="Barclays Bank" />
                <InfoRow label="Payment method" value="SWIFT (bank transfer)" />

                {popoverOpen && (
                  <div className="absolute left-full top-0 z-50 ml-3 w-[460px] rounded-xl border border-[#e3e8ef] bg-white p-4 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="mb-2 flex w-full items-start gap-3">
                      <p className="flex-1 text-base font-semibold text-[#1a1d23]">GBP beneficiary details</p>
                      <button type="button" onClick={() => setPopoverOpen(false)} aria-label="Close popover">
                        <img src={cancelSquare} alt="" className="size-6" />
                      </button>
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <InfoRow label="Sort code" value="20-00-00" />
                      <InfoRow label="Account number" value="12345678" />
                      <InfoRow label="SWIFT / BIC" value="BARCGB22" />
                      <InfoRow
                        label="Bank address"
                        value={
                          <>
                            <p>1 Churchill Place</p>
                            <p>London, E14 5HP</p>
                            <p>United Kingdom</p>
                          </>
                        }
                      />
                    </div>
                    <div className="mt-3 flex w-full items-center justify-end gap-3">
                      <EditChip
                        onClick={() => navigate('/bills/list/edit-payment-method-modal-northwind-studios-ltd')}
                      />
                      <HdsButton
                        variant="destructive-link"
                        className="text-sm"
                        onClick={() => navigate('/bills/misc/delete-payment-method-confirmation-modal')}
                      >
                        Delete
                      </HdsButton>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact information */}
            <div className="flex w-full flex-col gap-3">
              <SectionHeader
                title="Contact information"
                action={
                  <EditChip
                    label="Continue"
                    onClick={() => navigate('/bills/list/edit-contact-details-modal-amazon-web-services')}
                  />
                }
              />
              <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                <InfoRow label="Email" value="aws-billing@amazon.com" />
                <InfoRow label="Phone" value="+1 (206) 266-4064" />
                <InfoRow
                  label="Address"
                  value={
                    <>
                      <p>410 Terry Ave N</p>
                      <p>Seattle, WA 98109</p>
                      <p>United States</p>
                    </>
                  }
                />
              </div>
            </div>

            {/* Linked bills */}
            <div className="flex w-full flex-col gap-3">
              <SectionHeader title="Linked bills" action={<LinkAction label="View all" onClick={close} />} />
              {[
                { name: 'Cloud infrastructure', amount: '$2,500.00', ref: 'INV-00456  ·  Aug 15, 2026' },
                { name: 'Data storage', amount: '$1,200.00', ref: 'INV-00321  ·  Jul 15, 2026' },
                { name: 'Compute services', amount: '$3,450.00', ref: 'INV-00187  ·  Jun 15, 2026' },
              ].map((bill) => (
                <div key={bill.name} className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                  <div className="flex w-full items-center gap-4">
                    <p className="flex-1 text-[13px] font-medium text-[#1a1d23]">{bill.name}</p>
                    <p className="text-[13px] font-medium text-[#1a1d23]">{bill.amount}</p>
                    <Badge status="paid" label="Paid" />
                  </div>
                  <p className="text-[13px] text-[#6b7280]">{bill.ref}</p>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="flex w-full flex-col gap-3">
              <SectionHeader title="Notes" action={<LinkAction label="Add note" />} />
              <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                <div className="flex w-full items-center gap-3">
                  <p className="flex-1 text-base font-semibold text-[#1a1d23]">John Doe (you)</p>
                  <HdsButton variant="destructive-link" className="text-sm">
                    Delete
                  </HdsButton>
                </div>
                <p className="text-[13px] text-[#6b7280]">Aug 16, 2026 · 4:00 PM</p>
                <p className="text-[13px] font-medium text-[#1a1d23]">
                  Primary cloud provider for infrastructure and hosting services.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8ef] p-4">
                <p className="text-base font-semibold text-[#1a1d23]">Theo Olsen</p>
                <p className="text-[13px] text-[#6b7280]">Aug 15, 2026 · 2:15 PM</p>
                <p className="text-[13px] font-medium text-[#1a1d23]">
                  Reach out to AWS Billing for invoice discrepancies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
