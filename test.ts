const SOURCE_SYSTEM_LABELS: Record<string, string> = {
  sap_arinvoice: 'AR Invoice',
  sap_inventorytrf: 'Inventory Transfer',
};

// Valid raw keys accepted from SAP
const VALID_SOURCE_SYSTEMS = Object.keys(SOURCE_SYSTEM_LABELS);

const getSourceSystemLabel = (
  sourceSystem: string | null | undefined
): string | null => {
  if (!sourceSystem) return null;
  const key = sourceSystem.toLowerCase();
  return SOURCE_SYSTEM_LABELS[key] || null;
};

if (!inventoryData.source_system) {
  throw new Error('source_system is required');
}

// Validate source_system is a known SAP key
const sourceSystemLabel = getSourceSystemLabel(inventoryData.source_system);
if (!sourceSystemLabel) {
  throw new Error(
    `Invalid source_system "${inventoryData.source_system}". Valid values are: ${VALID_SOURCE_SYSTEMS.join(', ')}`
  );
}

// Convert raw key → label before storing
// "sap_arinvoice" → "AR Invoice"
inventoryData.source_system = sourceSystemLabel;

const compositeKey = `${inventoryData.source_system}_${inventoryData.sap_docentry}`;

const existingSapDoc = await tx.van_inventory.findFirst({
  where: {
    source_system: inventoryData.source_system, // now "AR Invoice"
    sap_docentry: inventoryData.sap_docentry.toString(),
  },
});

if (existingSapDoc) {
  throw new Error(
    `SAP document already imported: ${compositeKey} (source_system="${inventoryData.source_system}", sap_docentry="${inventoryData.sap_docentry}")`
  );
}
