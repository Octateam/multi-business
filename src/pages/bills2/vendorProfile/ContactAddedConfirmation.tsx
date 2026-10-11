import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Contact added (Figma 48069:435603). Renders the unified, interactive vendor details page in this initial state. */
export default function ContactAddedConfirmation() {
  return <VendorDetailsScreen initial={{ tab: 'contact', drawer: { kind: 'addContact', step: 'success' } }} />
}
