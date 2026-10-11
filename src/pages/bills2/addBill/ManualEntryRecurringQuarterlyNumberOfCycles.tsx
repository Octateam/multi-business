import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:204131 — recurring quarterly with number of cycles.
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ManualEntryRecurringQuarterlyNumberOfCycles() {
  return (
    <AddBillShell>
      <AddBillForm
        subtitle="Set up the details below and add items. You'll review and confirm on the next step."
        vendorValue="Northwind Design Ltd"
        paymentDetailsValue="Chase Bank •••• 7890"
        filled
        referenceValue="NW-2481"
        dueDateValue="21/06/2025"
        descriptionValue="Hosted the last company workshop with personal funds"
        recurring
        recurringSectionProps={{ frequency: 'Quarterly', showCycles: true, paymentModeChecked: 0 }}
      />
    </AddBillShell>
  )
}
