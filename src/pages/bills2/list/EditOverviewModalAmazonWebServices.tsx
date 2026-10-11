import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton, HdsToggleSegment } from '../../../components/ui/hds'
import {
  BillsPageBackdrop,
  ModalBackdrop,
  PanelShell,
  ModalHeader,
  DisplaySelectField,
  DisplayInputField,
  useFormFields,
  isFilled,
  CATEGORY_OPTIONS,
} from './paymentMethodShared'

export default function EditOverviewModalAmazonWebServices() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const { values: v, bind } = useFormFields({
    businessName: 'Amazon Web Services',
    category: 'Technology',
    taxId: 'GB123456789',
  })
  const [vendorType, setVendorType] = useState<'Individual' | 'Business'>('Business')
  const isValid = isFilled(v.businessName, v.category, v.taxId)

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <ModalHeader title="Edit overview" onClose={close} />
          <div className="flex w-full flex-1 flex-col gap-4">
            <HdsToggleSegment
              className="flex w-full [&>button]:flex-1"
              options={[
                { value: 'Individual', label: 'Individual' },
                { value: 'Business', label: 'Business' },
              ]}
              value={vendorType}
              onChange={setVendorType}
            />
            <DisplayInputField label={vendorType === 'Business' ? 'Business name' : 'Full name'} {...bind('businessName')} />
            <DisplaySelectField label="Category" {...bind('category')} options={CATEGORY_OPTIONS} helper="Pre-fills on every bill." />
            <DisplayInputField label="Tax identification number" {...bind('taxId')} />
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" disabled={!isValid} onClick={close}>
            Save changes
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
