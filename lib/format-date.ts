import { format, isToday, isTomorrow } from 'date-fns';

export function relativeDayLabel(date: Date) {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

export function formatAppointment(date: Date) {
  return `${relativeDayLabel(date)} · ${format(date, 'h:mm a')}`;
}
