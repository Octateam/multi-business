import { AddBillShell, AddBillForm } from '../addBill/shared'
import { Alert } from './shared'

// Figma 45033:201398 — New bill after an invoice upload whose OCR extraction failed: the same New bill
// form, empty, with the uploaded file kept as the bill's attachment. Submit opens "Ready to submit?".
export default function OcrExtractionFailed() {
  return (
    <AddBillShell>
      <AddBillForm
        currencyLabel="GBP - British Pound"
        attachment="receipt-scan.jpg"
        notice={
          <Alert
            tone="error"
            title="OCR extraction failed"
            description="We couldn't automatically read this file. Please enter the bill details manually below."
          />
        }
      />
    </AddBillShell>
  )
}
