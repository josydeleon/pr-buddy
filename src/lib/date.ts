import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a date string or Date object to a relative time string (e.g. "3 days ago")
 * @param date The date to format
 * @returns The relative time string
 */
export const formatRelativeDate = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
