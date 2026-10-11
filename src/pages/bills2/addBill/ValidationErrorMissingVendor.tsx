import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:202085 — missing vendor highlighted; picking a vendor clears the error.
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ValidationErrorMissingVendor() {
  return (
    <AddBillShell>
      <AddBillForm
        vendorError
        filled
        referenceValue="NW-2481"
        dueDateValue="21/06/2025"
        descriptionValue="Hosted the last company workshop with personal funds"
        alert="missing-vendor"
      />
    </AddBillShell>
  )
}
