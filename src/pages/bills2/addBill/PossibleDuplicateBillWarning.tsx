import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:201856 — possible duplicate warning ("View existing bill" opens it, "Continue" dismisses in place).
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function PossibleDuplicateBillWarning() {
  return (
    <AddBillShell>
      <AddBillForm
        vendorValue="Northwind Design Ltd"
        paymentDetailsValue="Chase Bank •••• 7890"
        filled
        referenceValue="NW-2481"
        dueDateValue="21/06/2025"
        descriptionValue="Hosted the last company workshop with personal funds"
        alert="duplicate"
      />
    </AddBillShell>
  )
}
