import { useState } from 'react'
import { HdsButton, HdsTextarea } from '../../../components/ui/hds'

export default function CancelBillModal({
  onClose,
  onConfirm,
}: {
  onClose?: () => void
  onConfirm?: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const canConfirm = reason.trim().length > 0

  return (
    <div className="flex w-[657px] max-w-full flex-col justify-between rounded-2xl bg-white shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <div className="flex w-full flex-col gap-1.5 px-[22px] pb-3.5 pt-5">
        <p className="font-heading text-[16.5px] font-semibold text-[#0c2129]">Cancel this bill?</p>
        <p className="text-sm text-[#5c6d77]">
          This bill will be canceled and removed from the approval workflow. This action can&rsquo;t be undone.
        </p>
      </div>
      <div className="flex w-full flex-col px-[22px] pb-5">
        <HdsTextarea
          label="Reason for cancellation"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain what needs to change."
          rows={4}
          maxChars={120}
        />
      </div>
      <div className="flex w-full items-start justify-end gap-2.5 border-t border-[#eff2f4] px-[22px] py-3.5">
        <HdsButton variant="secondary" shape="pill" onClick={onClose}>
          Continue
        </HdsButton>
        <HdsButton variant="destructive" shape="pill" disabled={!canConfirm} onClick={() => canConfirm && onConfirm?.(reason)}>
          Cancel bill
        </HdsButton>
      </div>
    </div>
  )
}
