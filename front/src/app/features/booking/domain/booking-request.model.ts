import { BookingSelection } from './booking-selection.model';
import { ContactDetails } from './contact-details.model';
import { Traveller } from './traveller.model';

// What the traveller details form submits to BookingProvider.createBooking.
// leadTraveller is always the first ADULT and is never duplicated inside
// additionalTravellers.
export interface BookingRequest {
  readonly selection: BookingSelection;
  readonly leadTraveller: Traveller;
  readonly contact: ContactDetails;
  readonly additionalTravellers: readonly Traveller[];
  readonly specialRequests: string | null;
}
