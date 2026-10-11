import { AddBillShell, AddBillForm } from '../addBill/shared'
import { OCR_EXTRACTED, VendorMatchedNotice } from './shared'

// Figma 45033:202314 — invoice read with a 2% discount and 5% tax; both are entered as percentages
// so the breakdown computes them from the subtotal (£9,200 − £184 + £460 = £9,476).
export default function OcrUploadPercentageDiscountTax() {
  return (
    <AddBillShell>
      <AddBillForm
        initialDraft={{ ...OCR_EXTRACTED, discount: '2', discountUnit: 'percent', tax: '5', taxUnit: 'percent' }}
        notice={
          <VendorMatchedNotice
            title="Details extracted"
            description="We read a 2% discount and 5% tax off this invoice. Amounts below are calculated automatically."
          />
        }
      />
    </AddBillShell>
  )
}
