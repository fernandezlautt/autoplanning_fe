import { addWeeks, format, parseISO } from 'date-fns';

/**
 * Calculate the date range for a specific week number
 * Uses the semester start date if provided, otherwise falls back to year start
 */
export function getWeekDateRange(
  weekNumber: number, 
  semesterStartDate?: string | Date
): { start: Date; end: Date; startStr: string; endStr: string } {
  let baseDate: Date;
  
  if (semesterStartDate) {
    // Use the semester start date
    baseDate = typeof semesterStartDate === 'string' 
      ? parseISO(semesterStartDate) 
      : semesterStartDate;
  } else {
    // Fallback to beginning of current year
    const currentYear = new Date().getFullYear();
    baseDate = new Date(currentYear, 0, 1);
  }
  
  // Week 1 starts at the base date (semester start or year start)
  // Each week is 7 days
  const weekStart = addWeeks(baseDate, weekNumber - 1);
  const weekEnd = addWeeks(weekStart, 1);
  
  return {
    start: weekStart,
    end: weekEnd,
    startStr: format(weekStart, 'MMM d'),
    endStr: format(weekEnd, 'MMM d, yyyy'),
  };
}

/**
 * Get a formatted date range string for a week
 */
export function getWeekDateString(weekNumber: number, semesterStartDate?: string | Date): string {
  const { startStr, endStr } = getWeekDateRange(weekNumber, semesterStartDate);
  return `${startStr} - ${endStr}`;
}
