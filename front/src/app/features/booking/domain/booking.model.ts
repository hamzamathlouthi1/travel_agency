import { Money } from '../../../shared/types/money.model';
import { BookingStatus } from './booking-status.model';
import { BookingSelection } from './booking-selection.model';
import { ContactDetails } from './contact-details.model';
import { Traveller } from './traveller.model';

// The full reservation record, as returned by BookingProvider. Carries
// enough of a snapshot (selection + travellers + contact) that Booking
// Review, Payment and Confirmation can all render from `getById(id)` alone
// — none of them re-derive this from URL query params the way Traveller
// Details does, since by this point the booking itself is the source of
// truth.
export interface Booking {
  readonly id: string;
  readonly status: BookingStatus;
  readonly totalPrice: Money;
  readonly createdAt: string;
  readonly selection: BookingSelection;
  readonly leadTraveller: Traveller;
  readonly contact: ContactDetails;
  readonly additionalTravellers: readonly Traveller[];
  readonly specialRequests: string | null;
  // Customer-facing booking locator, assigned once at creation — stable
  // across SSR/hydration since it's never recomputed, only ever read back.
  // Distinct from PaymentResult.gatewayReference (the payment transaction
  // reference, set on top of this once payment succeeds).
  readonly reference: string;
  readonly paymentReference: string | null;
}
