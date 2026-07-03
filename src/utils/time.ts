// Small helpers for working with "HH:mm" alarm times.

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Returns true if `value` is a valid 24-hour "HH:mm" string. */
export function isValidTime(value: string): boolean {
  return HH_MM.test(value.trim());
}

/** Parses "HH:mm" into { hours, minutes }. Throws if invalid. */
export function parseTime(value: string): { hours: number; minutes: number } {
  const match = HH_MM.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time "${value}". Expected HH:mm (e.g. 07:30).`);
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export type Period = 'AM' | 'PM';

/** Splits an "HH:mm" 24h string into 12-hour parts for a friendly picker. */
export function to12Hour(value: string): { hour12: number; minute: number; period: Period } {
  const { hours, minutes } = parseTime(value);
  const period: Period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return { hour12, minute: minutes, period };
}

/** Builds an "HH:mm" 24h string from 12-hour picker parts. */
export function to24Hour(hour12: number, minute: number, period: Period): string {
  let hours = hour12 % 12; // 12 -> 0
  if (period === 'PM') hours += 12;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Returns the next Date at the given "HH:mm".
 * If the time already passed today, returns that time tomorrow.
 */
export function nextOccurrence(value: string, from: Date = new Date()): Date {
  const { hours, minutes } = parseTime(value);
  const next = new Date(from);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= from.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}
