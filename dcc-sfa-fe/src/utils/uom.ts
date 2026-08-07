/**
 * Utility functions for Unit of Measurement (UoM)
 */

export const isDemoEnvironment = () => {
  return import.meta.env.VITE_APP_ENV === 'demo';
};

/**
 * Returns available UoM options.
 */
export const getAvailableUoms = (dynamicUoms?: string[]): string[] => {
  if (dynamicUoms && dynamicUoms.length > 0) {
    return dynamicUoms;
  }
  return ['CASE', 'PCS'];
};

/**
 * Resolves the default UoM for an item.
 */
export const resolveDefaultUom = (
  itemUnit?: string | null, 
  fallback: string = 'CASE',
  dynamicUoms?: string[]
): string => {
  return itemUnit || (dynamicUoms && dynamicUoms.length > 0 ? dynamicUoms[0] : fallback); 
};
