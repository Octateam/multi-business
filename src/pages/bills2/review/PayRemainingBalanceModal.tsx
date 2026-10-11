import { useState } from 'react'
import cancelSquareIcon from '../../../assets/icons/review3-cancel-square.svg'
import { HdsButton, HdsInput } from '../../../components/ui/hds'
import { PayFromSelect, PaymentMethodSelect } from './shared'

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[35px] items-start justify-between border-b border-[#eff2f4] pb-2.5 pt-2">
      <p className="text-[13px] text-[#9aa1ac]">{label}</p>
      <p className="text-right text-[13px] font-medium text-[#0c2129]">{value}</p>
    </div>
  )
}

export default function PayRemainingBalanceModal({ onClose, onPay }: { onClose?: () => void; onPay?: () => void }) {
  const [account, setAccount] = useState<string | null>('operations')
  return (
    <div className="flex w-[513px] max-w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-heading text-[22px] font-semibold text-[#222121]">Pay remaining balance</p>
          <p className="text-sm font-medium text-[#555354]">
            Review the outstanding amount and payment details before completing this bill
          </p>
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

        <HdsInput label="Amount" value="£4,240.00" readOnly helper="Remaining balance on this bill" className="font-medium" />
      </div>

      <div className="flex w-full flex-col gap-4">
        <HdsButton variant="primary" fullWidth disabled={!account} onClick={onPay}>
          Pay
        </HdsButton>
        <HdsButton variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </HdsButton>
      </div>
    </div>
  )
}
