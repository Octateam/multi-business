import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:202776 — vendor selected, payment details filled from the vendor.
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ManualEntryVendorSelected() {
  return (
    <AddBillShell>
      <AddBillForm
        vendorValue="Northwind Design Ltd"
        paymentDetailsValue="Chase Bank •••• 7890"
        currencyLabel="USD - US Dollar"
      />
    </AddBillShell>
  )
}
