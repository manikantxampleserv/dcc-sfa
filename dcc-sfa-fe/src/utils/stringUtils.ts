/**
 * Formats a string by replacing underscores with spaces and capitalizing each word.
 * @param str - The string to format
 * @returns The formatted string, or empty string if input is falsy
 */
export const formatLabel = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
