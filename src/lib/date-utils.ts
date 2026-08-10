
/**
 * Date and Time utilities for the Health OS application,
 * specifically focused on Asia/Kolkata (IST) time for the Indian market.
 */

/**
 * Gets the current date in Asia/Kolkata (IST) as a Date object.
 * Note: The time part will be adjusted to the current IST time.
 */
export function getISTDate(): Date {
  const now = new Date();
  // Using Intl to get the current time in IST
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const partValues: Record<string, string> = {};
  parts.forEach(p => partValues[p.type] = p.value);
  
  // Construct a date object representing that time locally
  return new Date(
    parseInt(partValues.year),
    parseInt(partValues.month) - 1,
    parseInt(partValues.day),
    parseInt(partValues.hour),
    parseInt(partValues.minute),
    parseInt(partValues.second)
  );
}

/**
 * Returns the current date in IST formatted as YYYY-MM-DD.
 */
export function getISTDateString(): string {
  const istDate = getISTDate();
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
