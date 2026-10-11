import { AddBillShell, AddBillForm } from '../addBill/shared'
import { OCR_EXTRACTED, VendorMatchedNotice } from './shared'

// Figma 45033:201621 — invoice uploaded and read; vendor matched to an existing vendor. The New bill
// form is prefilled from the invoice and stays fully editable. (Upload dropzone on New bill lands here.)
export default function OcrUploadVendorMatchConfirmed() {
  return (
    <AddBillShell>
      <AddBillForm
        initialDraft={OCR_EXTRACTED}
        notice={
          <VendorMatchedNotice
            title="Vendor matched"
            description="We found an existing vendor that matches this invoice. Review and confirm below."
          />
        }
      />
    </AddBillShell>
  )
}
