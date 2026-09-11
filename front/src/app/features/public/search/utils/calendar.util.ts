// Small date-math helpers for the date-range calendar. No date library —
// this is the only place in the app that needs calendar-grid math, so a
// dependency isn't justified.

export interface CalendarDay {
  readonly iso: string;
  readonly dayOfMonth: number;
  readonly inCurrentMonth: boolean;
  readonly isPast: boolean;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

// Monday-first 6-week grid so every month renders a consistent layout.
export function monthMatrix(year: number, month: number, today: Date): readonly CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const startDate = new Date(year, month, 1 - firstWeekday);
  const todayIso = toIsoDate(today);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      iso: toIsoDate(date),
      dayOfMonth: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isPast: toIsoDate(date) < todayIso,
    };
  });
}

export function nightsBetween(checkInIso: string, checkOutIso: string): number {
  const ms = new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export const WEEKDAY_LABELS: readonly string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const MONTH_LABELS: readonly string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
