const fs = require('fs');

const items = require('./mock_data.json');

const payload = {
  salesman_sap_code: "MOS100855",
  depot_sap_code: "MOS",
  document_date: "2026-09-28",
  is_active: "Y",
  reconciliation_items: items.map(item => ({
    source_system: item.source_system,
    sap_docnum: item.sap_docnum,
    sap_docentry: item.sap_docentry,
    sap_lineid: item.sap_lineid,
    product_sap_code: item.sap_item_code,
    batch_number: item.van_inventory_items_batch_lot ? item.van_inventory_items_batch_lot.batch_number : null,
    quantity: item.quantity,
    base_quantity: item.base_quantity
  }))
};

fs.writeFileSync('payload.json', JSON.stringify(payload, null, 2));
