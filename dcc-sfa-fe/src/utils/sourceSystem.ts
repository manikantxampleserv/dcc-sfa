export const SOURCE_SYSTEM_LABELS: Record<string, string> = {
  sap_arinvoice: 'AR Invoice',
  sap_inventorytrf: 'Inventory Transfer',
};

export const getSourceSystemLabel = (
  sourceSystem: string | null | undefined
): string | null => {
  if (!sourceSystem) return null;
  const key = sourceSystem.toLowerCase();
  return SOURCE_SYSTEM_LABELS[key] || sourceSystem;
};
