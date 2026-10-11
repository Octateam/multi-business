import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import closeX from '../../../assets/icons/list3-close-x.svg'
import deleteIcon from '../../../assets/icons/list3-delete-circle-icon.svg'

export default function DeletePaymentMethodConfirmationModal() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="relative flex h-full w-full">
        {/* Dimmed Bills list background */}
        <div className="flex-1 overflow-hidden py-7">
          <p className="font-heading text-2xl font-semibold text-text-primary">Bills</p>
          <p className="mt-1 text-sm text-text-quaternary">Review, approve, and pay what you owe vendors.</p>
        </div>
        <button
          aria-label="Close delete payment method confirmation"
          className="fixed inset-0 cursor-default bg-black/40"
          onClick={() => navigate('/bills')}
        />

        {/* Status modal */}
        <div className="absolute left-1/2 top-1/2 flex w-[483px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[31px] shadow-2xl">
          <div
            className="relative h-[220px] w-full shrink-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(180,35,46) 30%, rgb(255,255,255) 100%)',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => navigate('/bills')}
            >
              <img src={closeX} alt="" className="h-8 w-8" />
            </button>
            <div className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
              <img src={deleteIcon} alt="" className="h-[29px] w-[29px]" />
            </div>
          </div>
          <div className="flex w-full flex-col gap-8 bg-white p-8">
            <div className="flex w-full flex-col gap-3">
              <p className="font-heading text-[32px] font-semibold leading-[40px] tracking-[-0.64px] text-text-primary">
                Delete payment method?
              </p>
              <p className="text-base text-[#4b5563]">This can no longer be used for future payments to this vendor.</p>
            </div>
            <div className="flex w-full gap-2">
              <HdsButton variant="secondary" className="flex-1" onClick={() => navigate('/bills')}>
                Cancel
              </HdsButton>
              <HdsButton variant="destructive" className="flex-1" onClick={() => navigate('/bills')}>
                Delete
              </HdsButton>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
