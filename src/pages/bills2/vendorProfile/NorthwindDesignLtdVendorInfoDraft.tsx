import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import { NorthwindBreadcrumb, NorthwindStepper, NorthwindHeader, InvoicePreviewPanel, NorthwindFooter, NorthwindStatusSwitcher } from './shared'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]">
      <p className="border-b border-transparent pb-2 text-base font-semibold text-text-primary">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className="text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

export default function NorthwindDesignLtdVendorInfoDraft() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6 pb-[90px] pt-7">
        <NorthwindBreadcrumb />
        <NorthwindHeader
          status="draft"
          actions={
            <>
              <Button variant="destructive-secondary" onClick={() => navigate('/bills')}>
                Delete bill
              </Button>
              <Button variant="secondary" onClick={() => navigate('/bills/add/manual-entry-filled-one-time')}>
                Edit bill
              </Button>
            </>
          }
        />
        <NorthwindStepper step={1} />
        <div className="flex w-full items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-8">
            <Card title="Vendor info">
              <div className="flex flex-col">
                <Row label="Vendor type" value="Individual" />
                <Row label="First name" value="Joleen" />
                <Row label="Last name" value="Freeman" />
                <Row label="Category" value="Software" />
              </div>
            </Card>
            <Card title="Payment details">
              <div className="flex flex-col">
                <Row label="Country" value="United States of America" />
                <Row label="Payment method" value="ACH" />
                <Row label="Account name" value="Northwind Design Ltd" />
                <Row label="Bank name" value="Chase bank" />
                <Row label="Routing number" value="021000021" />
                <Row label="Account number" value="1234567890" />
                <Row label="Account type" value="Checking" />
                <Row label="Address line 1" value="No, 131 Wall Street, NY" />
                <Row label="State" value="New York" />
                <Row label="City" value="New York City" />
                <Row label="Postal code" value="10001" />
                <Row label="Tax identification number" value="GB123456789" />
              </div>
            </Card>
            <Card title="Contact details">
              <div className="flex flex-col">
                <Row label="Email" value="account@northwind.com" />
                <Row label="Phone" value="+1(555) 040-3283" />
                <Row label="Address" value="15 Maplewood Drive, Austin, TX 78704" />
              </div>
            </Card>
          </div>
          <InvoicePreviewPanel />
        </div>
      </div>
      <NorthwindFooter>
        <Button variant="secondary" onClick={() => navigate('/bills')}>
          Previous
        </Button>
        <Button variant="primary" onClick={() => navigate('/bills')}>
          Next
        </Button>
        <NorthwindStatusSwitcher active="draft" />
      </NorthwindFooter>
    </AppShell>
  )
}
