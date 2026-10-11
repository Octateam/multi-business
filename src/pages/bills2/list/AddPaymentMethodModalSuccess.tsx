import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import { BillsPageBackdrop, ModalBackdrop, PanelShell } from './paymentMethodShared'
import cancelSquare from '../../../assets/icons/list2-cancel-square.svg'
import successIllustration from '../../../assets/icons/list2-success-illustration.svg'

export default function AddPaymentMethodModalSuccess() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const addAnother = () => navigate('/bills/list/add-payment-method-modal-country-selector')

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <div className="flex w-full justify-end">
            <button type="button" onClick={close} aria-label="Close">
              <img src={cancelSquare} alt="" className="size-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
            <img src={successIllustration} alt="" className="h-[160px] w-[193px]" />
            <div className="flex flex-col items-center gap-2">
              <p className="font-heading text-xl font-semibold text-text-primary">Payment method added</p>
              <p className="max-w-[357px] text-base text-text-quaternary">
                The bank account has been added to this vendor and is ready to use.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <HdsButton variant="primary" fullWidth onClick={addAnother}>
              Add another payment method
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={close}>
              Done
            </HdsButton>
          </div>
        </PanelShell>
      </div>
    </AppShell>
  )
}
