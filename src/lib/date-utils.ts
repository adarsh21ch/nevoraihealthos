
/**
 * Date and Time utilities for the Health OS application,
 * specifically focused on Asia/Kolkata (IST) time for the Indian market.
 */

/**
 * Gets the current date in Asia/Kolkata (IST) as a Date object.
 */
/**
 * Returns the current date in IST formatted as YYYY-MM-DD.
 */
export function getISTDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })
    .format(new Date()); // YYYY-MM-DD
}

/**
 * Computes the day number of a program based on the enrollment start date.
 * day_number = (today - enrollment.start_date) + 1
 * 
 * @param startDate The enrollment start date (YYYY-MM-DD)
 * @returns The current program day number (1-indexed)
 */
export function getProgramDayNumber(startDate: string): number {
  const tParts = getISTDateString().split('-').map(Number);
  const sParts = startDate.slice(0, 10).split('-').map(Number);
  
  if (tParts.length < 3 || sParts.length < 3) return 1;

  const [ty, tm, td] = tParts as [number, number, number];
  const [sy, sm, sd] = sParts as [number, number, number];
  
  // Use Date.UTC to get absolute timestamp difference without local timezone interference
  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(sy, sm - 1, sd);
  return Math.floor(diff / 86400000) + 1;
}

/**
 * Formats a date string for display (e.g. "Oct 24, 2026")
 */
export function formatDateDisplay(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
