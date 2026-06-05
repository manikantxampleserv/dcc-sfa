/**
 * @fileoverview Date utility functions for consistent date formatting across the application
 * @author DCC-SFA Team
 * @version 1.0.0
 */

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format (ISO string, timestamp, etc.)
 * @param options - Intl.DateTimeFormat options for customization
 * @returns Formatted date string or null if invalid
 */
export const formatDate = (
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string | null => {
  if (!dateString) {
    return null;
  }
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const formatOptions = { ...defaultOptions, ...options };
  try {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(
      new Date(dateString)
    );
  } catch (error) {
    console.warn('Invalid date string provided to formatDate:', dateString);
    return null;
  }
};

/**
 * Formats a date string to include time
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string | null | undefined
): string | null => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a date string to show only the date in short format
 * @param dateString - The date string to format
 * @returns Formatted short date string
 */
export const formatShortDate = (
  dateString: string | null | undefined
): string => {
  return (
    formatDate(dateString, {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    }) || 'No Date'
  );
};

/**
 * Formats a date string to show relative time (e.g., "2 days ago")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export const formatRelativeTime = (
  dateString: string | null | undefined
): string => {
  if (!dateString) {
    return 'No Date';
  }
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.warn(
      'Invalid date string provided to formatRelativeTime:',
      dateString
    );
    return 'Invalid Date';
  }
};

/**
 * Checks if a date string represents today
 * @param dateString - The date string to check
 * @returns True if the date is today, false otherwise
 */
export const isToday = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Formats a date for API requests (ISO string)
 * @param date - Date object or date string
 * @returns ISO string format for API
 */
export const formatForAPI = (
  date: Date | string | null | undefined
): string | null => {
  if (!date) return null;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.warn('Invalid date provided to formatForAPI:', date);
    return null;
  }
};

/**
 * Formats a date for HTML date inputs (yyyy-MM-dd format)
 * @param date - Date object, date string, or null/undefined
 * @returns Date string in yyyy-MM-dd format or today's date if null
 */
export const formatForDateInput = (
  date: Date | string | null | undefined
): string => {
  try {
    if (!date) {
      return new Date().toISOString().split('T')[0];
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date provided to formatForDateInput:', date);
    return new Date().toISOString().split('T')[0];
  }
};

export const formatCalendarTime = (
  date: Date | string | null | undefined
): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const now = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const timeString = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSameDay(dateObj, now)) {
    return `Today at ${timeString}`;
  }
  if (isSameDay(dateObj, yesterday)) {
    return `Yesterday at ${timeString}`;
  }

  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0 && diffDays < 7) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return `${days[dateObj.getDay()]} at ${timeString}`;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};
