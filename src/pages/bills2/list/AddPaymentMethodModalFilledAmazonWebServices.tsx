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
  TaxIdCheckbox,
  useFormFields,
  COUNTRY_OPTIONS,
  isFilled,
  ACCOUNT_TYPE_OPTIONS,
  US_STATE_OPTIONS,
} from './paymentMethodShared'

export default function AddPaymentMethodModalFilledAmazonWebServices() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const { values: v, bind } = useFormFields({
    country: 'United States of America',
    accountName: 'Amazon Web Services',
    accountType: 'Checking',
    accountNumber: '4350437854',
    bankName: 'Chase bank',
    routingNumber: '123243424',
    swift: '123243424',
    address: 'No, 131 Wall Street, NY',
    state: 'New York',
    city: 'New York City',
    zip: '10001',
    taxId: 'GB123456789',
  })
  const isValid = isFilled(v.country, v.accountName, v.accountType, v.accountNumber, v.bankName, v.routingNumber, v.swift, v.address, v.state, v.city, v.zip)
  const next = () => navigate('/bills/list/add-payment-method-modal-review-northwind-studios-ltd')

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <ModalHeader title="Add payment method" onClose={close} />
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
              <DisplayInputField className="flex-1" label="Postal code" {...bind('zip')} />
            </div>
            <TaxIdCheckbox label="This vendor has a tax ID" />
            <DisplayInputField label="Tax identification number" {...bind('taxId')} helper="Optional" />
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" disabled={!isValid} onClick={next}>
            Review details
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
