import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import {
  Card,
  DefinitionRow,
  ReviewFooter,
  ReviewHeader,
  ReviewQueuePanel,
  ReviewStepper,
  UploadPreviewBox,
  VendorSummaryCard,
} from './shared'

const QUEUE_ITEMS = [
  { name: 'Acme Print Co', badges: [{ label: 'New vendor', status: 'info' as const }] },
  { name: 'Northwind Design Ltd', badges: [{ label: 'Recurring', status: 'neutral' as const }] },
  { name: 'Amazon Web Services', badges: [{ label: 'Urgent', status: 'rejected' as const }] },
  { name: 'Chase Bank Fees', badges: [{ label: 'One-time', status: 'neutral' as const }] },
]

export default function VendorInfoTabAcmePrintCoNewVendor() {
  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Check the details and take action"
          actions={
            <>
              <Button variant="secondary">
                Request information
              </Button>
              <Button variant="primary">Review &amp; approve</Button>
            </>
          }
        />
        <ReviewStepper active={1} />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <ReviewQueuePanel items={QUEUE_ITEMS} />

          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Card title="Vendor info">
              <DefinitionRow term="Vendor type" description="Individual" />
              <DefinitionRow term="First name" description="Joleen" />
              <DefinitionRow term="Last name" description="Freeman" />
              <DefinitionRow term="Category" description="Software" />
            </Card>

            <Card title="Payment details">
              <DefinitionRow term="Country" description="United States of America" />
              <DefinitionRow term="Payment method" description="ACH" />
              <DefinitionRow term="Account name" description="Acme Print Co" />
              <DefinitionRow term="Bank name" description="Chase bank" />
              <DefinitionRow term="Routing number" description="021000021" />
              <DefinitionRow term="Account number" description="1234567890" />
              <DefinitionRow term="Account type" description="Checking" />
              <DefinitionRow term="Address line 1" description="No. 131 Wall Street, NY" />
              <DefinitionRow term="State" description="New York" />
              <DefinitionRow term="City" description="New York City" />
              <DefinitionRow term="Postal code" description="10001" />
              <DefinitionRow term="Tax identification number" description="GB123456789" />
            </Card>

            <Card title="Contact details">
              <DefinitionRow term="Email" description="joleen.freeman@example.com" />
              <DefinitionRow term="Phone" description="+1(555) 040-3283" />
              <DefinitionRow term="Address" description="15 Maplewood Drive, Austin, TX 78704" />
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <UploadPreviewBox label="Invoice uploaded" filename="ACME-0092.pdf" />
            <VendorSummaryCard />
          </div>
        </div>
        <ReviewFooter>
          <Button variant="primary">
            Continue
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
