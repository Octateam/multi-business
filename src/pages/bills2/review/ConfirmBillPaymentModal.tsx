import { useState } from 'react'
import cancelSquareIcon from '../../../assets/icons/review3-cancel-square.svg'
import { HdsButton, HdsInput } from '../../../components/ui/hds'
import { AmountRadioGroup } from './paymentFlowShared'
import { PayFromSelect, PaymentMethodSelect } from './shared'

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[35px] items-start justify-between border-b border-[#eff2f4] pb-2.5 pt-2">
      <p className="text-[13px] text-[#9aa1ac]">{label}</p>
      <p className="text-right text-[13px] font-medium text-[#0c2129]">{value}</p>
    </div>
  )
}

export type PayAmountOption = 'none' | 'full' | 'part'

export default function ConfirmBillPaymentModal({
  payAmountOption,
  onSelectOption,
  partAmountValue,
  onPartAmountChange,
  onClose,
  onApprove,
  onReject,
}: {
  payAmountOption: PayAmountOption
  onSelectOption?: (option: PayAmountOption) => void
  partAmountValue?: string
  onPartAmountChange?: (value: string) => void
  onClose?: () => void
  onApprove?: () => void
  onReject?: () => void
}) {
  const [account, setAccount] = useState<string | null>('operations')
  const partAmount = Number((partAmountValue ?? '').replace(/[^0-9.]/g, '')) || 0
  const approveEnabled = payAmountOption === 'full' || (payAmountOption === 'part' && partAmount > 0)

  return (
    <div className="flex w-[513px] max-w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-heading text-[22px] font-semibold text-[#222121]">Confirm bill payment</p>
          <p className="text-sm font-medium text-[#555354]">Review the transaction details before funds are sent to the vendor.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close">
          <img src={cancelSquareIcon} alt="" className="size-6" />
        </button>
      </div>

      <div className="flex w-full flex-col gap-4">
        <DefinitionRow label="Vendor" value="Northwind Design Ltd" />
        <DefinitionRow label="Pay to" value="GBP account · United Kingdom · ••••4471" />
        <DefinitionRow label="Invoice total" value="£9,200.00" />
        <DefinitionRow label="Withholding tax (5%)" value="−£460.00" />
        <DefinitionRow label="Vendor receives" value="£8,740.00" />
        <div className="flex h-[34px] items-start justify-between py-2">
          <p className="text-[13px] text-[#9aa1ac]">Reference</p>
          <p className="text-right text-[13px] font-medium text-[#0c2129]">NWD-0043</p>
        </div>

        <PayFromSelect value={account} onChange={setAccount} />
        <PaymentMethodSelect />

        <div className="flex w-full flex-col">
          <div className="flex h-[35px] items-start justify-between border-b border-[#eff2f4] pb-2.5 pt-2">
            <p className="text-[13px] text-[#9aa1ac]">You pay from</p>
          </div>
          <DefinitionRow label="Vendor receives" value="£8,740.00" />
          <DefinitionRow label="Estimated arrival" value="Same day" />
          <DefinitionRow label="Transfer fee" value="£0.40" />
          <DefinitionRow label="Total debit" value="£8,740.40" />
          <div className="flex h-[34px] items-start justify-between py-2">
            <p className="text-[13px] text-[#9aa1ac]">Balance after</p>
            <p className="text-right text-[13px] font-medium text-[#0c2129]">£177,559.60</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <AmountRadioGroup
            fullAmountValue="£8,740.00"
            value={payAmountOption === 'full' ? 'full' : payAmountOption === 'part' ? 'partial' : null}
            onChange={(v) => onSelectOption?.(v === 'full' ? 'full' : 'part')}
          />
          {payAmountOption === 'part' && (
            <HdsInput
              label="Amount to pay"
              value={partAmountValue ?? ''}
              onChange={(e) => onPartAmountChange?.(e.target.value.replace(/[^0-9.,£]/g, ''))}
              placeholder="£0.00"
              inputMode="decimal"
              helper="Up to £8,740.00. The rest stays outstanding on this bill."
            />
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4">
        <HdsButton variant="primary" fullWidth disabled={!approveEnabled || !account} onClick={() => approveEnabled && onApprove?.()}>
          Approve
        </HdsButton>
        <HdsButton variant="destructive-secondary" fullWidth onClick={onReject}>
          Reject
        </HdsButton>
      </div>
    </div>
  )
}
