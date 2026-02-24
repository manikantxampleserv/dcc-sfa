/**
 * Generate unique table ID automatically based on column configuration
 * @param columns - Array of table column configurations
 * @returns Unique table identifier string
 */
export const generateTableId = (columns: { id: string | number }[]): string => {
  const columnNames = columns
    .map(col => String(col.id))
    .sort()
    .join('-');

  let hash = 0;
  for (let i = 0; i < columnNames.length; i++) {
    const char = columnNames.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const positiveHash = Math.abs(hash);
  return `table-${positiveHash.toString(36)}`;
};
