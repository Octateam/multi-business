import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import {
  BillsPageBackdrop,
  ModalBackdrop,
  PanelShell,
  ModalHeader,
  DisplaySelectField,
  COUNTRY_OPTIONS,
} from './paymentMethodShared'

export default function AddPaymentMethodModalCountrySelector() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const next = () => navigate('/bills/list/add-payment-method-modal-empty-form')
  const [country, setCountry] = useState('')

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
              placeholder="Select country"
              value={country}
              options={COUNTRY_OPTIONS}
              onChange={setCountry}
              flag
              defaultOpen
            />
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" onClick={next} disabled={!country}>
            Review details
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
