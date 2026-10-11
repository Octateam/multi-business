import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import {
  BillsPageBackdrop,
  ModalBackdrop,
  PanelShell,
  ModalHeader,
  DisplaySelectField,
  DisplayInputField,
  useFormFields,
  isFilled,
  VENDOR_ADDRESS_OPTIONS,
} from './paymentMethodShared'
import { KitPhoneInput } from '../hdsKit'

export default function EditContactDetailsModalAmazonWebServices() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const { values: v, bind } = useFormFields({
    email: 'aws-billing@amazon.com',
    phone: '(206) 266-4064',
    address: '410 Terry Ave N, Seattle, WA 98109',
  })
  const phone = bind('phone')
  const isValid = isFilled(v.email, v.phone, v.address)

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <ModalHeader title="Edit contact details" onClose={close} />
          <div className="flex w-full flex-1 flex-col gap-4">
            <DisplayInputField label="Email" type="email" inputMode="email" placeholder="Enter email" {...bind('email')} />
            <KitPhoneInput label="Phone" number={phone.value} onChange={phone.onChange} placeholder="(000) 000-0000" />
            <DisplaySelectField label="Address" placeholder="Select address" {...bind('address')} options={VENDOR_ADDRESS_OPTIONS} />
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" disabled={!isValid} onClick={close}>
            Save changes
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
