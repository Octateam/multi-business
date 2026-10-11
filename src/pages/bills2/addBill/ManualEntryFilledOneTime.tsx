import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:202990 — form filled, one-time bill.
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ManualEntryFilledOneTime() {
  return (
    <AddBillShell>
      <AddBillForm
        vendorValue="Northwind Design Ltd"
        paymentDetailsValue="Chase Bank •••• 7890"
        filled
        referenceValue="NW-2481"
        dueDateValue="21/06/2025"
        descriptionValue="Hosted the last company workshop with personal funds"
      />
    </AddBillShell>
  )
}
