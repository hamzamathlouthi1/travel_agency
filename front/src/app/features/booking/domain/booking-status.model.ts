// Canonical booking lifecycle. Every UI that displays or branches on booking
// status (booking flow, checkout, account reservations, B2B reservations,
// back-office) must import this — never re-declare or hardcode these strings.
export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED';

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  PENDING_PAYMENT: 'Pending payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};
