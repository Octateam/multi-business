import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Payment details tab (Figma 48069:432274). Renders the unified, interactive vendor details page in this initial state. */
export default function AmazonWebServicesPaymentDetailsTab() {
  return <VendorDetailsScreen initial={{ tab: 'payment' }} />
}
