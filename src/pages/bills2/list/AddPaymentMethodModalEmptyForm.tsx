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
  isFilled,
  COUNTRY_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  US_STATE_OPTIONS,
} from './paymentMethodShared'

export default function AddPaymentMethodModalEmptyForm() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const next = () => navigate('/bills/list/add-payment-method-modal-filled-amazon-web-services')
  const { values: v, bind } = useFormFields({
    country: 'United States of America',
    accountName: '',
    accountType: 'Checking',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    swift: '',
    address: '',
    state: '',
    city: '',
    zip: '',
    taxId: '',
  })
  const isValid = isFilled(
    v.country, v.accountName, v.accountType, v.accountNumber, v.bankName, v.routingNumber,
    v.swift, v.address, v.state, v.city, v.zip,
  )

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
            <DisplayInputField label="Account name" {...bind('accountName')} placeholder="Enter account name" />
            <DisplaySelectField label="Account type" {...bind('accountType')} options={ACCOUNT_TYPE_OPTIONS} />
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="Account number" {...bind('accountNumber')} inputMode="numeric" placeholder="Enter account number" />
              <DisplayInputField className="flex-1" label="Bank name" {...bind('bankName')} placeholder="Enter bank name" />
            </div>
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="Routing number" {...bind('routingNumber')} inputMode="numeric" placeholder="Enter routing number" />
              <DisplayInputField className="flex-1" label="SWIFT/BIC" {...bind('swift')} placeholder="Enter SWIFT/BIC" />
            </div>
            <DisplayInputField label="Address line 1" {...bind('address')} placeholder="Enter address" />
            <DisplaySelectField label="State" placeholder="Select…" {...bind('state')} options={US_STATE_OPTIONS} />
            <div className="flex w-full gap-4">
              <DisplayInputField className="flex-1" label="City" {...bind('city')} placeholder="Enter city" />
              <DisplayInputField className="flex-1" label="Zip code" {...bind('zip')} placeholder="Enter Zip code" />
            </div>
            <TaxIdCheckbox label="This vendor has a tax ID" />
            <DisplayInputField label="Tax identification number" {...bind('taxId')} placeholder="Enter tax ID" helper="Optional" />
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" onClick={next} disabled={!isValid}>
            Review details
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
