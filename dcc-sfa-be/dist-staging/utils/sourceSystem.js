"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceSystemLabel = exports.SOURCE_SYSTEM_LABELS = void 0;
exports.SOURCE_SYSTEM_LABELS = {
    sap_arinvoice: 'AR Invoice',
    sap_inventorytrf: 'Inventory Transfer',
};
const getSourceSystemLabel = (sourceSystem) => {
    if (!sourceSystem)
        return null;
    const key = sourceSystem.toLowerCase();
    return exports.SOURCE_SYSTEM_LABELS[key] || sourceSystem;
};
exports.getSourceSystemLabel = getSourceSystemLabel;
//# sourceMappingURL=sourceSystem.js.map