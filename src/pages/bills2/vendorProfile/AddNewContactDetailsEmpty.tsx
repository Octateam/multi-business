import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Add new contact details, empty (Figma 48069:435814). Renders the unified, interactive vendor details page in this initial state. */
export default function AddNewContactDetailsEmpty() {
  return <VendorDetailsScreen initial={{ tab: 'contact', drawer: { kind: 'addContact', step: 'form' } }} />
}
