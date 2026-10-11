import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsTextarea } from '../../../components/ui/hds'
import Button from '../../../components/ui/Button'
import { Card, ConfirmModalOverlay, DefinitionRow, ReviewFooter, ReviewHeader, ReviewStepper, UploadPreviewBox } from './shared'

export default function RejectPaymentConfirmation() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('')

  return (
    <AppShell>
      <div className="relative flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Go through the details and take action"
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
              <DefinitionRow term="Account name" description="Northwind Studios Ltd" />
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
              <DefinitionRow term="Email" description="account@northwind.com" />
              <DefinitionRow term="Phone" description="+1(555) 040-3283" />
              <DefinitionRow term="Address" description="15 Maplewood Drive, Austin, TX 78704" />
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <UploadPreviewBox label="Invoice uploaded" filename="NW-2481.pdf" />
          </div>
        </div>
        <ReviewFooter>
          <Button variant="primary">
            Continue
          </Button>
        </ReviewFooter>

        <ConfirmModalOverlay>
          <div className="flex flex-col gap-2">
            <p className="font-heading text-xl font-semibold text-text-primary">Reject bill payment?</p>
            <p className="text-sm text-text-quaternary">Add a reason so the requester understands why this can&apos;t proceed.</p>
          </div>
          <HdsTextarea
            aria-label="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Reason for rejection"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => navigate('/bills')}
            >
              Reject bill
            </Button>
          </div>
        </ConfirmModalOverlay>
      </div>
    </AppShell>
  )
}
