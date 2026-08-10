
/**
 * Date and Time utilities for the Health OS application,
 * specifically focused on Asia/Kolkata (IST) time for the Indian market.
 */

/**
 * Gets the current date in Asia/Kolkata (IST) as a Date object.
 * Note: The time part will be adjusted to the current IST time.
 */
export function getISTDate(): Date {
  // Current UTC time
  const now = new Date();
  
  // Asia/Kolkata is UTC+5:30
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + IST_OFFSET);
}

/**
 * Returns the current date in IST formatted as YYYY-MM-DD.
 */
export function getISTDateString(): string {
  const istDate = getISTDate();
  return istDate.toISOString().split('T')[0];
}

/**
 * Computes the day number of a program based on the enrollment start date.
 * day_number = (today - enrollment.start_date) + 1
 * Uses Asia/Kolkata time for "today".
 * 
 * @param startDate The enrollment start date (YYYY-MM-DD)
 * @returns The current program day number (1-indexed)
 */
export function getProgramDayNumber(startDate: string | Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const istNow = getISTDate();
  istNow.setHours(0, 0, 0, 0);
  
  const diffTime = istNow.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1;
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
