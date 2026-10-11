import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Add new contact details, filled (Figma 48069:435422). Renders the unified, interactive vendor details page in this initial state. */
export default function AddNewContactDetailsFilled() {
  return <VendorDetailsScreen initial={{ tab: 'contact', drawer: { kind: 'addContact', step: 'form', prefill: true } }} />
}
