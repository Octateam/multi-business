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
  COUNTRY_OPTIONS,
  isFilled,
  ACCOUNT_TYPE_OPTIONS,
  US_STATE_OPTIONS,
} from './paymentMethodShared'

export default function EditPaymentMethodModalNorthwindStudiosLtd() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const { values: v, bind } = useFormFields({
    country: 'United States of America',
    accountName: 'Amazon Web Services, Inc.',
    accountType: 'Checking',
    accountNumber: '4350437854',
    bankName: 'JPMorgan Chase Bank',
    routingNumber: '123243424',
    swift: '123243424',
    address: 'No, 131 Wall Street, NY',
    state: 'New York',
    city: 'New York City',
    zip: '10001',
  })
  const isValid = isFilled(v.country, v.accountName, v.accountType, v.accountNumber, v.bankName, v.routingNumber, v.swift, v.address, v.state, v.city, v.zip)

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <ModalHeader
            title="Edit payment method"
            subtitle="Update the bank account details on file."
            onClose={close}
          />
          <div className="flex w-full flex-1 flex-col gap-4">
            <DisplaySelectField
              label="Country"
              {...bind('country')}
              options={COUNTRY_OPTIONS}
              flag
              helper="Where the vendor's account is held"
            />
            <DisplayInputField label="Account name" {...bind('accountName')} />
            <DisplaySelectField label="Account type" {...bind('accountType')} options={ACCOUNT_TYPE_OPTIONS} />
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="Account number" {...bind('accountNumber')} />
              <DisplayInputField className="flex-1" label="Bank name" {...bind('bankName')} />
            </div>
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="Routing number" {...bind('routingNumber')} />
              <DisplayInputField className="flex-1" label="SWIFT/BIC" {...bind('swift')} />
            </div>
            <DisplayInputField label="Address line 1" {...bind('address')} />
            <DisplaySelectField label="State" {...bind('state')} options={US_STATE_OPTIONS} />
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="City" {...bind('city')} />
              <DisplayInputField className="flex-1" label="Zip code" {...bind('zip')} />
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col gap-4">
            <HdsButton variant="primary" fullWidth disabled={!isValid} onClick={close}>
              Save changes
            </HdsButton>
            <HdsButton variant="destructive-secondary" fullWidth onClick={close}>
              Delete payment method
            </HdsButton>
          </div>
        </PanelShell>
      </div>
    </AppShell>
  )
}
