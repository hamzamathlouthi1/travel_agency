// Single formatting entry point for dates. Feature code should format via
// these helpers rather than calling Intl.DateTimeFormat/DatePipe ad hoc, so
// date presentation stays consistent across locales.
export function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(isoDate));
}

export function formatDateRange(isoStart: string, isoEnd: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' });
  return formatter.formatRange(new Date(isoStart), new Date(isoEnd));
}
