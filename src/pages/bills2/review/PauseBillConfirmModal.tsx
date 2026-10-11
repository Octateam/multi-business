import statusModalCloseIcon from '../../../assets/icons/review3-status-modal-close.svg'
import infoCircleIcon from '../../../assets/icons/review3-info-circle.svg'
import { HdsButton } from '../../../components/ui/hds'

export default function PauseBillConfirmModal({ onClose, onConfirm }: { onClose?: () => void; onConfirm?: () => void }) {
  return (
    <div className="flex w-[483px] max-w-full flex-col overflow-hidden rounded-[31px] shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <div
        className="relative h-[330px] w-full shrink-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgb(0, 0, 0) 0%, rgb(1, 106, 165) 18.5%, rgb(255, 255, 255) 78.6%)',
        }}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 size-8">
          <img src={statusModalCloseIcon} alt="" className="size-8" />
        </button>
        <div className="absolute left-1/2 top-[150px] flex size-[60px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
          <img src={infoCircleIcon} alt="" className="size-8" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-8 bg-white p-8">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-[32px] font-semibold tracking-[-0.64px] text-text-primary">Pause this recurring bill?</p>
          <p className="text-base text-[#4b5563]">
            Pausing stops future bill cycles until you resume. Any cycle already in progress will be processed
          </p>
        </div>
        <div className="flex w-full gap-2">
          <HdsButton variant="secondary" size="lg" className="flex-1" onClick={onConfirm}>
            Pause bill
          </HdsButton>
          <HdsButton variant="primary" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </HdsButton>
        </div>
      </div>
    </div>
  )
}
