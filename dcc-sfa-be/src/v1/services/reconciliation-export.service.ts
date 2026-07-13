import ExcelJS from 'exceljs';

/**
 * Generates an Excel workbook buffer for the reconciliation settlement sheet.
 * @param {any} reconciliationData - The reconciliation payload containing meta and data items.
 * @returns {Promise<Buffer>} The generated Excel file buffer.
 */
export const exportReconciliationExcelService = async (
  reconciliationData: any
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('SettlementSheet');

  const { meta, data: rawItems } = reconciliationData;

  const items = (rawItems || []).reduce((acc: any[], item: any) => {
    const key = `${item.categoryName}_${item.skuCode}`;
    const existing = acc.find(i => `${i.categoryName}_${i.skuCode}` === key);
    if (existing) {
      existing.loadQuantity =
        (Number(existing.loadQuantity) || 0) + (Number(item.loadQuantity) || 0);
      existing.loadBaseQty =
        (Number(existing.loadBaseQty) || 0) + (Number(item.loadBaseQty) || 0);

      existing.saleQuantity =
        (Number(existing.saleQuantity) || 0) + (Number(item.saleQuantity) || 0);
      existing.saleBaseQty =
        (Number(existing.saleBaseQty) || 0) + (Number(item.saleBaseQty) || 0);

      existing.expectedRop =
        (Number(existing.expectedRop) || 0) + (Number(item.expectedRop) || 0);
      existing.expectedBaseQty =
        (Number(existing.expectedBaseQty) || 0) +
        (Number(item.expectedBaseQty) || 0);

      const actualExisting =
        existing.actualRop !== '' && existing.actualRop !== null
          ? Number(existing.actualRop)
          : 0;
      const actualExistingBase =
        existing.actualBaseQty !== '' && existing.actualBaseQty !== null
          ? Number(existing.actualBaseQty)
          : 0;

      const actualItem =
        item.actualRop !== '' && item.actualRop !== null
          ? Number(item.actualRop)
          : 0;
      const actualItemBase =
        item.actualBaseQty !== '' && item.actualBaseQty !== null
          ? Number(item.actualBaseQty)
          : 0;

      existing.actualRop = String(actualExisting + actualItem);
      existing.actualBaseQty = String(actualExistingBase + actualItemBase);

      existing.variance = String(
        (Number(existing.variance) || 0) + (Number(item.variance) || 0)
      );
      existing.varianceBaseQty = String(
        (Number(existing.varianceBaseQty) || 0) +
          (Number(item.varianceBaseQty) || 0)
      );

      if (
        !existing.resolutionAction ||
        existing.resolutionAction === 'CLEAN' ||
        existing.resolutionAction === '-'
      ) {
        existing.resolutionAction =
          item.resolutionAction || existing.resolutionAction;
      }
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  sheet.columns = [
    { width: 6 },
    { width: 12 },
    { width: 35 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
    { width: 25 },
  ];

  const applyFont = (
    cell: ExcelJS.Cell,
    overrides: Partial<ExcelJS.Font> = {}
  ) => {
    cell.font = { name: 'Calibri', size: 11, ...overrides };
  };

  const applyFill = (cell: ExcelJS.Cell, argb: string) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
  };

  const applyBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
      left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
      bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
      right: { style: 'thin', color: { argb: 'FFA6A6A6' } },
    };
  };

  sheet.mergeCells('A1:J2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'SettlementSheet — Daily Salesman Settlement';
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  applyFont(titleCell, { size: 16, bold: true, color: { argb: 'FF1F4E78' } });

  sheet.mergeCells('A3:J3');
  const subTitleCell = sheet.getCell('A3');
  subTitleCell.value =
    'Dynamic template: select a salesman from the dropdown to populate all figures. Printable per day, per salesman.';
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  applyFont(subTitleCell, { italic: true, color: { argb: 'FF7F7F7F' } });

  const curDate = meta.reconciliation_date
    ? new Date(meta.reconciliation_date).toLocaleDateString('en-GB')
    : '-';
  const genDate = new Date().toLocaleDateString('en-GB');

  sheet.getCell('A5').value = 'Salesman Name:';
  sheet.getCell('B5').value = meta.salesman?.name || '-';
  applyFont(sheet.getCell('B5'), { bold: true, color: { argb: 'FF1F4E78' } });

  sheet.getCell('F5').value = 'Depot:';
  sheet.getCell('G5').value = meta.depot?.name || '-';
  applyFont(sheet.getCell('G5'), { bold: true });

  sheet.getCell('A6').value = 'SAP Code:';
  sheet.getCell('B6').value = meta.salesman?.sap_code || '-';
  applyFont(sheet.getCell('B6'), { bold: true, color: { argb: 'FF1F4E78' } });

  sheet.getCell('F6').value = 'Reporting Officer:';
  sheet.getCell('G6').value = '-';

  sheet.getCell('A7').value = 'Settlement Date:';
  sheet.getCell('B7').value = curDate;
  applyFont(sheet.getCell('B7'), { bold: true });

  sheet.getCell('F7').value = 'Generated On:';
  sheet.getCell('G7').value = genDate;

  let currentRow = 9;

  sheet.mergeCells(`A${currentRow}:J${currentRow}`);
  const pageHeaderCell = sheet.getCell(`A${currentRow}`);
  pageHeaderCell.value = 'SETTLEMENT BY SKU';
  pageHeaderCell.alignment = { vertical: 'middle' };
  applyFont(pageHeaderCell, { bold: true, color: { argb: 'FFFFFFFF' } });
  applyFill(pageHeaderCell, 'FF203764');
  currentRow++;

  const currencyCode = meta.currency || 'TZS';

  const headers = [
    'S.No',
    'SKU Code',
    'SKU Name',
    'Load Qty',
    'Sales Qty',
    'Expected ROP',
    'Actual ROP',
    'Variance',
    `Unit Price (${currencyCode})`,
    `Sale Value (${currencyCode})`,
    'Action',
  ];
  const headerRow = sheet.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    applyFont(cell, { bold: true, color: { argb: 'FFFFFFFF' } });
    applyFill(cell, 'FF4472C4');
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(cell);
  });
  currentRow++;

  const groupedItems = items.reduce((acc: any, item: any) => {
    const cat = item.categoryName || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryTotals: any = {};
  let grandTotalLoad = 0;
  let grandTotalSales = 0;
  let grandTotalExpected = 0;
  let grandTotalActual = 0;
  let grandTotalVariance = 0;
  let grandTotalSaleValue = 0;

  let grandTotalDefaultOutletValue = 0;

  Object.entries(groupedItems).forEach(
    ([category, catItems]: [string, any]) => {
      sheet.mergeCells(`A${currentRow}:K${currentRow}`);
      const catCell = sheet.getCell(`A${currentRow}`);
      catCell.value = category;
      applyFont(catCell, { bold: true, color: { argb: 'FFFFFFFF' } });
      applyFill(catCell, 'FF7030A0');
      currentRow++;

      let catLoad = 0;
      let catSales = 0;
      let catExpected = 0;
      let catActual = 0;
      let catVariance = 0;
      let catSaleValue = 0;

      catItems.forEach((item: any, idx: number) => {
        const row = sheet.getRow(currentRow);
        row.getCell(1).value = idx + 1;
        row.getCell(2).value = item.skuCode;
        row.getCell(3).value = item.skuName;
        const conv = Number(item.conversionRate) || 1;
        const price = Number(item.basePrice) || 0;
        const basePricePerPc = price / conv;

        row.getCell(4).value =
          `${Number(item.loadQuantity) || 0} Cases ${Number(item.loadBaseQty) || 0} PCs`;
        row.getCell(5).value =
          `${Number(item.saleQuantity) || 0} Cases ${Number(item.saleBaseQty) || 0} PCs`;
        row.getCell(6).value =
          `${Number(item.expectedRop) || 0} Cases ${Number(item.expectedBaseQty) || 0} PCs`;

        const hasActualCases =
          item.actualRop !== '' &&
          item.actualRop !== null &&
          item.actualRop !== undefined;
        const hasActualPCs =
          item.actualBaseQty !== '' &&
          item.actualBaseQty !== null &&
          item.actualBaseQty !== undefined;
        const actualVal = hasActualCases ? Number(item.actualRop) : 0;
        const actualBaseVal = hasActualPCs ? Number(item.actualBaseQty) : 0;
        row.getCell(7).value =
          hasActualCases || hasActualPCs
            ? `${actualVal} Cases ${actualBaseVal} PCs`
            : '-';

        const varianceVal = Number(item.variance) || 0;
        const varianceBaseVal = Number(item.varianceBaseQty) || 0;

        const sign =
          varianceVal < 0 || varianceBaseVal < 0
            ? '-'
            : varianceVal > 0 || varianceBaseVal > 0
              ? '+'
              : '';
        const absCases = Math.abs(varianceVal);
        const absPcs = Math.abs(varianceBaseVal);
        row.getCell(8).value =
          varianceVal === 0 && varianceBaseVal === 0
            ? '0 Cases 0 PCs'
            : `${sign}${absCases} Cases ${absPcs} PCs`;

        row.getCell(9).value = price;

        const saleVal =
          (Number(item.saleQuantity) || 0) * price +
          (Number(item.saleBaseQty) || 0) * basePricePerPc;
        row.getCell(10).value = saleVal;

        const action = item.resolutionAction || '-';
        row.getCell(11).value = action;

        catLoad += Number(item.loadQuantity) || 0;
        catSales += Number(item.saleQuantity) || 0;
        catExpected += Number(item.expectedRop) || 0;
        catActual += actualVal;
        catVariance += varianceVal;
        catSaleValue += saleVal;

        if (
          action.includes('Default Outlet') &&
          (varianceVal < 0 || varianceBaseVal < 0)
        ) {
          grandTotalDefaultOutletValue +=
            Math.abs(varianceVal) * price +
            Math.abs(varianceBaseVal) * basePricePerPc;
        }

        for (let i = 1; i <= 11; i++) {
          const cell = row.getCell(i);
          applyBorder(cell);
          if (i >= 4 && i <= 10) {
            cell.alignment = { horizontal: 'right' };
            cell.numFmt = '#,##0.00';
            if (i === 9 || i === 10) {
              cell.numFmt = '#,##0';
            }
          }
          if (i === 11) {
            cell.alignment = { horizontal: 'center' };
            if (action.includes('Unload Adjustment')) {
              applyFill(cell, 'FFFFD966');
            } else if (action.includes('Default Outlet')) {
              applyFill(cell, 'FFF4B084');
            } else if (action === 'CLEAN') {
              applyFill(cell, 'FFC6E0B4');
              applyFont(cell, { color: { argb: 'FF006100' }, bold: true });
            } else {
              applyFill(cell, 'FFEAEAEA');
            }
          } else {
            if (i === 1 || i === 2 || i === 3) applyFill(cell, 'FFEEEEEE');
          }

          if (i === 7) {
            if (varianceVal < 0)
              applyFont(cell, { color: { argb: 'FFFF0000' } });
            else if (varianceVal > 0)
              applyFont(cell, { color: { argb: 'FF0000FF' } });
          }
        }
        currentRow++;
      });

      categoryTotals[category] = {
        skusLoaded: catItems.length,
        load: catLoad,
        sales: catSales,
        expected: catExpected,
        actual: catActual,
        variance: catVariance,
        saleValue: catSaleValue,
      };

      grandTotalLoad += catLoad;
      grandTotalSales += catSales;
      grandTotalExpected += catExpected;
      grandTotalActual += catActual;
      grandTotalVariance += catVariance;
      grandTotalSaleValue += catSaleValue;
    }
  );

  currentRow++;
  sheet.mergeCells(`A${currentRow}:J${currentRow}`);
  const subtotalsHeader = sheet.getCell(`A${currentRow}`);
  subtotalsHeader.value = 'SUBTOTALS BY CATEGORY';
  applyFont(subtotalsHeader, { bold: true, color: { argb: 'FFFFFFFF' } });
  applyFill(subtotalsHeader, 'FF203764');
  currentRow++;

  const subColHeaders = [
    'Category',
    'SKUs Loaded',
    'Total Load Qty',
    'Total Sales Qty',
    'Expected ROP',
    'Actual ROP',
    'Variance',
    'Sale Value',
  ];
  const subHeaderRow = sheet.getRow(currentRow);

  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  const subCatCell = sheet.getCell(`A${currentRow}`);
  subCatCell.value = 'Category';

  const subSkuCell = sheet.getCell(`C${currentRow}`);
  subSkuCell.value = 'SKUs Loaded';

  const subLoadCell = sheet.getCell(`D${currentRow}`);
  subLoadCell.value = 'Total Load Qty';

  const subSalesCell = sheet.getCell(`E${currentRow}`);
  subSalesCell.value = 'Total Sales Qty';

  const subExpCell = sheet.getCell(`F${currentRow}`);
  subExpCell.value = 'Expected ROP';

  const subActCell = sheet.getCell(`G${currentRow}`);
  subActCell.value = 'Actual ROP';

  const subVarCell = sheet.getCell(`H${currentRow}`);
  subVarCell.value = 'Variance';

  sheet.mergeCells(`I${currentRow}:J${currentRow}`);
  const subValCell = sheet.getCell(`I${currentRow}`);
  subValCell.value = 'Sale Value';

  [
    subCatCell,
    subSkuCell,
    subLoadCell,
    subSalesCell,
    subExpCell,
    subActCell,
    subVarCell,
    subValCell,
  ].forEach(cell => {
    applyFont(cell, { bold: true, color: { argb: 'FFFFFFFF' } });
    applyFill(cell, 'FF7030A0');
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(cell);
  });
  currentRow++;

  Object.entries(categoryTotals).forEach(([cat, totals]: [string, any]) => {
    const row = sheet.getRow(currentRow);
    sheet.mergeCells(`A${currentRow}:B${currentRow}`);
    row.getCell(1).value = cat;

    row.getCell(3).value = totals.skusLoaded;
    row.getCell(4).value = totals.load;
    row.getCell(5).value = totals.sales;
    row.getCell(6).value = totals.expected;
    row.getCell(7).value = totals.actual;
    row.getCell(8).value = totals.variance;

    sheet.mergeCells(`I${currentRow}:J${currentRow}`);
    row.getCell(9).value = totals.saleValue;

    for (let i = 1; i <= 10; i++) {
      const cell = row.getCell(i);
      applyBorder(cell);
      applyFill(cell, 'FFEAEAEA');
      if (i >= 4 && i <= 8) cell.numFmt = '#,##0.00';
      if (i >= 9) cell.numFmt = '#,##0';
      if (i === 8 && totals.variance < 0)
        applyFont(cell, { color: { argb: 'FFFF0000' }, bold: true });
    }
    currentRow++;
  });

  const gtRow = sheet.getRow(currentRow);
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  gtRow.getCell(1).value = 'GRAND TOTAL';
  gtRow.getCell(3).value = items.length;
  gtRow.getCell(4).value = grandTotalLoad;
  gtRow.getCell(5).value = grandTotalSales;
  gtRow.getCell(6).value = grandTotalExpected;
  gtRow.getCell(7).value = grandTotalActual;
  gtRow.getCell(8).value = grandTotalVariance;
  sheet.mergeCells(`I${currentRow}:J${currentRow}`);
  gtRow.getCell(9).value = grandTotalSaleValue;

  for (let i = 1; i <= 10; i++) {
    const cell = gtRow.getCell(i);
    applyBorder(cell);
    applyFill(cell, 'FFFFC000');
    applyFont(cell, { bold: true });
    if (i >= 4 && i <= 8) cell.numFmt = '#,##0.00';
    if (i >= 9) cell.numFmt = '#,##0';
    if (i === 8 && grandTotalVariance < 0)
      applyFont(cell, { color: { argb: 'FFFF0000' }, bold: true });
  }
  currentRow += 2;

  sheet.mergeCells(`A${currentRow}:J${currentRow}`);
  const cashHeader = sheet.getCell(`A${currentRow}`);
  cashHeader.value = 'CASH SETTLEMENT';
  applyFont(cashHeader, { bold: true, color: { argb: 'FFFFFFFF' } });
  applyFill(cashHeader, 'FF548235');
  currentRow++;

  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  sheet.getCell(`A${currentRow}`).value =
    'Total Sales Value (Mobile-recorded sales to outlets):';
  sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
  sheet.mergeCells(`H${currentRow}:J${currentRow}`);
  const tsvCell = sheet.getCell(`H${currentRow}`);
  tsvCell.value = grandTotalSaleValue;
  tsvCell.numFmt = '#,##0';
  applyFont(tsvCell, { bold: true });
  applyFill(tsvCell, 'FFEAEAEA');
  applyBorder(tsvCell);
  currentRow++;

  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const shortageText = sheet.getCell(`A${currentRow}`);
  shortageText.value =
    'Default Outlet Posting Value (Shortage — Salesman accountable):';
  shortageText.alignment = { horizontal: 'right' };
  applyFont(shortageText, { color: { argb: 'FFFF0000' } });
  sheet.mergeCells(`H${currentRow}:J${currentRow}`);
  const shortageCell = sheet.getCell(`H${currentRow}`);
  shortageCell.value = grandTotalDefaultOutletValue;
  shortageCell.numFmt = '#,##0';
  applyFont(shortageCell, { bold: true, color: { argb: 'FFFF0000' } });
  applyFill(shortageCell, 'FFEAEAEA');
  applyBorder(shortageCell);
  currentRow++;

  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const totalText = sheet.getCell(`A${currentRow}`);
  totalText.value = `TOTAL CASH SALESMAN MUST DEPOSIT AT DEPOT (${currencyCode}):`;
  totalText.alignment = { horizontal: 'right' };
  applyFont(totalText, { bold: true, color: { argb: 'FFFF0000' } });
  sheet.mergeCells(`H${currentRow}:J${currentRow}`);
  const depositCell = sheet.getCell(`H${currentRow}`);
  depositCell.value = grandTotalSaleValue + grandTotalDefaultOutletValue;
  depositCell.numFmt = '#,##0';
  applyFont(depositCell, { bold: true, color: { argb: 'FFFF0000' } });
  applyFill(depositCell, 'FFFFC000');
  applyBorder(depositCell);
  currentRow += 3;

  // --- STATIC SUMMARY TABLE ---

  // Row 1 (Header)
  const hRow = sheet.getRow(currentRow);
  hRow.getCell(1).value = 'S.No';
  hRow.getCell(2).value = 'Cash';
  hRow.getCell(3).value = 'Amount';
  hRow.getCell(4).value = 'S.No';
  sheet.mergeCells(`E${currentRow}:F${currentRow}`);
  hRow.getCell(5).value = 'Bank Name';
  hRow.getCell(7).value = 'Amount';
  hRow.getCell(9).value = 'Invoice Total:';

  const boldCells = [1, 2, 3, 4, 5, 7];
  boldCells.forEach(col => applyFont(hRow.getCell(col), { bold: true }));
  [1, 2, 3, 4, 5, 6, 7, 9, 10].forEach(col => applyBorder(hRow.getCell(col)));
  currentRow++;

  // Rows 1 to 7 for Cash, 1 to 10 for Bank
  const rightLabels = [
    'Less: ROP Total:',
    'Less: RRE (Empties) Total',
    'Total Sales :',
    'Less: Bank Slips total :',
    'Less: Cash Deposit :',
    '',
    'Overage / (Shortage):',
    '',
    'Total Sales Value',
    'EFD Value',
    'Difference',
  ];

  for (let i = 1; i <= 11; i++) {
    const row = sheet.getRow(currentRow);

    // Left Block (Cash)
    if (i <= 7) {
      row.getCell(1).value = i;
      [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
    } else if (i === 8) {
      sheet.mergeCells(`A${currentRow}:B${currentRow}`);
      row.getCell(1).value = 'Total';
      applyFont(row.getCell(1), { bold: true });
      [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
    } else if (i === 9) {
      sheet.mergeCells(`A${currentRow}:B${currentRow}`);
      row.getCell(1).value = 'Empties Loan Quantity';
      applyFont(row.getCell(1), { bold: true });
      [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
    } else if (i === 10) {
      sheet.mergeCells(`A${currentRow}:B${currentRow}`);
      row.getCell(1).value = 'Empties Loan Returned Quantity';
      applyFont(row.getCell(1), { bold: true });
      [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
    } else if (i === 11) {
      sheet.mergeCells(`A${currentRow}:B${currentRow}`);
      row.getCell(1).value = 'Balance';
      applyFont(row.getCell(1), { bold: true });
      [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
    }

    // Middle Block (Bank)
    if (i <= 10) {
      row.getCell(4).value = i;
      sheet.mergeCells(`E${currentRow}:F${currentRow}`);
      [4, 5, 6, 7].forEach(col => applyBorder(row.getCell(col)));
    } else if (i === 11) {
      sheet.mergeCells(`D${currentRow}:F${currentRow}`);
      row.getCell(4).value = 'Total';
      applyFont(row.getCell(4), { bold: true });
      [4, 5, 6, 7].forEach(col => applyBorder(row.getCell(col)));
    }

    // Right Block (Summary)
    const label = rightLabels[i - 1];
    if (label !== undefined && label !== '') {
      row.getCell(9).value = label;
      applyFont(row.getCell(9), {
        bold: label.includes('Total Sales') || label.includes('Overage'),
      });
      [9, 10].forEach(col => applyBorder(row.getCell(col)));
    }

    currentRow++;
  }

  currentRow += 2;

  sheet.mergeCells(`A${currentRow}:J${currentRow}`);
  const sigHeader = sheet.getCell(`A${currentRow}`);
  sigHeader.value = 'SIGNATURES';
  applyFont(sigHeader, { bold: true, color: { argb: 'FFFFFFFF' } });
  applyFill(sigHeader, 'FF203764');
  currentRow += 2;

  sheet.getCell(`B${currentRow}`).value = 'Salesman:';
  sheet.getCell(`C${currentRow}`).border = { bottom: { style: 'thin' } };
  sheet.getCell(`D${currentRow}`).border = { bottom: { style: 'thin' } };

  sheet.getCell(`F${currentRow}`).value = 'Depot In-Charge:';
  sheet.getCell(`G${currentRow}`).border = { bottom: { style: 'thin' } };
  sheet.getCell(`H${currentRow}`).border = { bottom: { style: 'thin' } };
  currentRow += 3;

  sheet.getCell(`B${currentRow}`).value = 'Date:';
  sheet.getCell(`C${currentRow}`).border = { bottom: { style: 'thin' } };
  sheet.getCell(`D${currentRow}`).border = { bottom: { style: 'thin' } };

  sheet.getCell(`F${currentRow}`).value = 'Cash Received:';
  sheet.getCell(`G${currentRow}`).border = { bottom: { style: 'thin' } };
  sheet.getCell(`H${currentRow}`).border = { bottom: { style: 'thin' } };
  sheet.getCell(`I${currentRow}`).value = currencyCode;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
