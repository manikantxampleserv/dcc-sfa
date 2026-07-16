"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReconciliationExcelService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
/**
 * Generates an Excel workbook buffer for the reconciliation settlement sheet.
 * @param {any} reconciliationData - The reconciliation payload containing meta and data items.
 * @returns {Promise<Buffer>} The generated Excel file buffer.
 */
const exportReconciliationExcelService = async (reconciliationData) => {
    const workbook = new exceljs_1.default.Workbook();
    const sheet = workbook.addWorksheet('SettlementSheet');
    const { meta, data: rawItems } = reconciliationData;
    const items = (rawItems || []).reduce((acc, item) => {
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
            const actualExisting = existing.actualRop !== '' && existing.actualRop !== null
                ? Number(existing.actualRop)
                : 0;
            const actualExistingBase = existing.actualBaseQty !== '' && existing.actualBaseQty !== null
                ? Number(existing.actualBaseQty)
                : 0;
            const actualItem = item.actualRop !== '' && item.actualRop !== null
                ? Number(item.actualRop)
                : 0;
            const actualItemBase = item.actualBaseQty !== '' && item.actualBaseQty !== null
                ? Number(item.actualBaseQty)
                : 0;
            existing.actualRop = String(actualExisting + actualItem);
            existing.actualBaseQty = String(actualExistingBase + actualItemBase);
            existing.variance = String((Number(existing.variance) || 0) + (Number(item.variance) || 0));
            existing.varianceBaseQty = String((Number(existing.varianceBaseQty) || 0) +
                (Number(item.varianceBaseQty) || 0));
            existing.taxAmount =
                (Number(existing.taxAmount) || 0) + (Number(item.taxAmount) || 0);
            if (!existing.resolutionAction ||
                existing.resolutionAction === 'CLEAN' ||
                existing.resolutionAction === '-') {
                existing.resolutionAction =
                    item.resolutionAction || existing.resolutionAction;
            }
        }
        else {
            acc.push({ ...item });
        }
        return acc;
    }, []);
    items.sort((a, b) => {
        const skuA = String(a.skuCode || '');
        const skuB = String(b.skuCode || '');
        return skuA.localeCompare(skuB, undefined, {
            numeric: true,
            sensitivity: 'base',
        });
    });
    sheet.columns = [
        { width: 6 }, // S.No
        { width: 15 }, // SKU Code
        { width: 35 }, // SKU Name
        { width: 15 }, // Load Qty
        { width: 15 }, // Sales Qty
        { width: 15 }, // Expected ROP
        { width: 15 }, // Actual ROP
        { width: 15 }, // Variance
        { width: 15 }, // Unit Price
        { width: 18 }, // Sale Value
        { width: 18 }, // Tax Amount
        { width: 20 }, // Action
    ];
    const applyFont = (cell, overrides = {}) => {
        cell.font = { name: 'Calibri', size: 11, ...overrides };
    };
    const applyFill = (cell, argb) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    };
    const applyBorder = (cell) => {
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        };
    };
    sheet.mergeCells('A1:L2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SettlementSheet — Daily Salesman Settlement';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyFont(titleCell, { size: 16, bold: true, color: { argb: 'FF1F4E78' } });
    sheet.mergeCells('A3:L3');
    const subTitleCell = sheet.getCell('A3');
    subTitleCell.value =
        'Dynamic template: select a salesman from the dropdown to populate all figures. Printable per day, per salesman.';
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyFont(subTitleCell, { italic: true, color: { argb: 'FF7F7F7F' } });
    const curDate = meta.reconciliation_date
        ? new Date(meta.reconciliation_date).toLocaleDateString('en-GB')
        : '-';
    const genDate = new Date().toLocaleDateString('en-GB');
    sheet.mergeCells('A5:B5');
    sheet.getCell('A5').value = 'Salesman Name:';
    sheet.getCell('A5').font = { bold: true };
    sheet.mergeCells('C5:F5');
    sheet.getCell('C5').value = meta.salesman?.name || '-';
    applyFont(sheet.getCell('C5'), { bold: true, color: { argb: 'FF1F4E78' } });
    sheet.mergeCells('G5:H5');
    sheet.getCell('G5').value = 'Depot:';
    sheet.getCell('G5').font = { bold: true };
    sheet.mergeCells('I5:L5');
    sheet.getCell('I5').value = meta.depot?.name || '-';
    sheet.getCell('I5').font = { bold: true };
    sheet.mergeCells('A6:B6');
    sheet.getCell('A6').value = 'SAP Code:';
    sheet.getCell('A6').font = { bold: true };
    sheet.mergeCells('C6:F6');
    sheet.getCell('C6').value = meta.salesman?.sap_code || '-';
    applyFont(sheet.getCell('C6'), { bold: true, color: { argb: 'FF1F4E78' } });
    sheet.mergeCells('G6:H6');
    sheet.getCell('G6').value = 'Reporting Officer:';
    sheet.getCell('G6').font = { bold: true };
    sheet.mergeCells('I6:L6');
    sheet.getCell('I6').value = meta.salesman?.users?.name || '-';
    sheet.getCell('I6').font = { bold: true };
    sheet.mergeCells('A7:B7');
    sheet.getCell('A7').value = 'Settlement Date:';
    sheet.getCell('A7').font = { bold: true };
    sheet.mergeCells('C7:F7');
    sheet.getCell('C7').value = curDate;
    sheet.getCell('C7').font = { bold: true };
    sheet.mergeCells('G7:H7');
    sheet.getCell('G7').value = 'Generated On:';
    sheet.getCell('G7').font = { bold: true };
    sheet.mergeCells('I7:L7');
    sheet.getCell('I7').value = genDate;
    sheet.getCell('I7').font = { bold: true };
    let currentRow = 9;
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
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
        `Tax Amount (${currencyCode})`,
        'Action',
    ];
    const headerRow = sheet.getRow(currentRow);
    headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        applyFont(cell, { bold: true, color: { argb: 'FFFFFFFF' } });
        applyFill(cell, 'FF4472C4');
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
        };
        applyBorder(cell);
    });
    headerRow.height = 30;
    currentRow++;
    const groupedItems = items.reduce((acc, item) => {
        const cat = item.categoryName || 'Uncategorized';
        if (!acc[cat])
            acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});
    const categoryTotals = {};
    let grandTotalLoad = 0;
    let grandTotalSales = 0;
    let grandTotalExpected = 0;
    let grandTotalActual = 0;
    let grandTotalVariance = 0;
    let grandTotalSaleValue = 0;
    let grandTotalTaxAmount = 0;
    let grandTotalDefaultOutletValue = 0;
    let grandTotalDefaultOutletTax = 0;
    Object.entries(groupedItems).forEach(([category, catItems]) => {
        sheet.mergeCells(`A${currentRow}:L${currentRow}`);
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
        let catTaxAmount = 0;
        catItems.forEach((item, idx) => {
            const row = sheet.getRow(currentRow);
            row.getCell(1).value = idx + 1;
            row.getCell(2).value = item.skuCode;
            row.getCell(3).value = item.skuName;
            const conv = Number(item.conversionRate) || 1;
            const price = Number(item.basePrice) || 0;
            const basePricePerPc = price / conv;
            const normalizeQty = (c, p) => {
                if (conv <= 1)
                    return { c: c || 0, p: p || 0 };
                const total = (c || 0) * conv + (p || 0);
                const sign = total < 0 ? -1 : 1;
                const abs = Math.abs(total);
                return { c: Math.floor(abs / conv) * sign, p: (abs % conv) * sign };
            };
            const isRGB = item.subCategoryName?.toUpperCase().includes('RGB') ||
                item.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
            const load = normalizeQty(Number(item.loadQuantity), Number(item.loadBaseQty));
            row.getCell(4).value =
                `${load.c} Cases ${isRGB ? `${load.p} PCs` : ''}`.trim();
            const sale = normalizeQty(Number(item.saleQuantity), Number(item.saleBaseQty));
            row.getCell(5).value =
                `${sale.c} Cases ${isRGB ? `${sale.p} PCs` : ''}`.trim();
            const expected = normalizeQty(Number(item.expectedRop), Number(item.expectedBaseQty));
            row.getCell(6).value =
                `${expected.c} Cases ${isRGB ? `${expected.p} PCs` : ''}`.trim();
            const hasActualCases = item.actualRop !== '' &&
                item.actualRop !== null &&
                item.actualRop !== undefined;
            const hasActualPCs = item.actualBaseQty !== '' &&
                item.actualBaseQty !== null &&
                item.actualBaseQty !== undefined;
            const actualVal = hasActualCases ? Number(item.actualRop) : 0;
            const actualBaseVal = hasActualPCs ? Number(item.actualBaseQty) : 0;
            const actual = normalizeQty(actualVal, actualBaseVal);
            row.getCell(7).value =
                hasActualCases || hasActualPCs
                    ? `${actual.c} Cases ${isRGB ? `${actual.p} PCs` : ''}`.trim()
                    : '-';
            const varianceVal = Number(item.variance) || 0;
            const varianceBaseVal = Number(item.varianceBaseQty) || 0;
            const variance = normalizeQty(varianceVal, varianceBaseVal);
            const sign = variance.c < 0 || variance.p < 0
                ? '-'
                : variance.c > 0 || variance.p > 0
                    ? '+'
                    : '';
            const absCases = Math.abs(variance.c);
            const absPcs = Math.abs(variance.p);
            row.getCell(8).value =
                variance.c === 0 && variance.p === 0
                    ? `0 Cases ${isRGB ? '0 PCs' : ''}`.trim()
                    : `${sign}${absCases} Cases ${isRGB ? `${absPcs} PCs` : ''}`.trim();
            row.getCell(9).value = price;
            const saleVal = (Number(item.saleQuantity) || 0) * price +
                (Number(item.saleBaseQty) || 0) * basePricePerPc;
            row.getCell(10).value = saleVal;
            const taxAmount = Number(item.taxAmount) || 0;
            row.getCell(11).value = taxAmount;
            const action = item.resolutionAction || '-';
            row.getCell(12).value = action;
            catLoad +=
                (Number(item.loadQuantity) || 0) +
                    (Number(item.loadBaseQty) || 0) / conv;
            catSales +=
                (Number(item.saleQuantity) || 0) +
                    (Number(item.saleBaseQty) || 0) / conv;
            catExpected +=
                (Number(item.expectedRop) || 0) +
                    (Number(item.expectedBaseQty) || 0) / conv;
            catActual += actualVal + actualBaseVal / conv;
            catVariance += varianceVal + varianceBaseVal / conv;
            catSaleValue += saleVal;
            catTaxAmount += taxAmount;
            if (action.includes('Default Outlet') &&
                (varianceVal < 0 || varianceBaseVal < 0)) {
                const shortageValue = Math.abs(varianceVal) * price +
                    Math.abs(varianceBaseVal) * basePricePerPc;
                grandTotalDefaultOutletValue += shortageValue;
                const taxRate = saleVal > 0 ? taxAmount / saleVal : 0.18;
                grandTotalDefaultOutletTax += shortageValue * taxRate;
            }
            for (let i = 1; i <= 12; i++) {
                const cell = row.getCell(i);
                applyBorder(cell);
                if (i >= 4 && i <= 11) {
                    cell.alignment = { horizontal: 'right' };
                    cell.numFmt = '#,##0.00';
                    if (i === 9 || i === 10 || i === 11) {
                        cell.numFmt = '#,##0';
                    }
                }
                if (i === 12) {
                    cell.alignment = { horizontal: 'center' };
                    if (action.includes('Unload Adjustment')) {
                        applyFill(cell, 'FFFFD966');
                    }
                    else if (action.includes('Default Outlet')) {
                        applyFill(cell, 'FFF4B084');
                    }
                    else if (action === 'CLEAN') {
                        applyFill(cell, 'FFC6E0B4');
                        applyFont(cell, { color: { argb: 'FF006100' }, bold: true });
                    }
                    else {
                        applyFill(cell, 'FFEAEAEA');
                    }
                }
                else {
                    if (i === 1 || i === 2 || i === 3)
                        applyFill(cell, 'FFEEEEEE');
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
            taxAmount: catTaxAmount,
        };
        grandTotalLoad += catLoad;
        grandTotalSales += catSales;
        grandTotalExpected += catExpected;
        grandTotalActual += catActual;
        grandTotalVariance += catVariance;
        grandTotalSaleValue += catSaleValue;
        grandTotalTaxAmount += catTaxAmount;
    });
    currentRow++;
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
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
        'Tax Amount',
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
    const subPriceCell = sheet.getCell(`I${currentRow}`);
    subPriceCell.value = '';
    const subValCell = sheet.getCell(`J${currentRow}`);
    subValCell.value = 'Sale Value';
    sheet.mergeCells(`K${currentRow}:L${currentRow}`);
    const subTaxCell = sheet.getCell(`K${currentRow}`);
    subTaxCell.value = 'Tax Amount';
    [
        subCatCell,
        subSkuCell,
        subLoadCell,
        subSalesCell,
        subExpCell,
        subActCell,
        subVarCell,
        subPriceCell,
        subValCell,
        subTaxCell,
    ].forEach(cell => {
        applyFont(cell, { bold: true, color: { argb: 'FFFFFFFF' } });
        applyFill(cell, 'FF7030A0');
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyBorder(cell);
    });
    currentRow++;
    Object.entries(categoryTotals).forEach(([cat, totals]) => {
        const row = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:B${currentRow}`);
        row.getCell(1).value = cat;
        row.getCell(3).value = totals.skusLoaded;
        row.getCell(4).value = totals.load;
        row.getCell(5).value = totals.sales;
        row.getCell(6).value = totals.expected;
        row.getCell(7).value = totals.actual;
        row.getCell(8).value = totals.variance;
        row.getCell(9).value = '';
        row.getCell(10).value = totals.saleValue;
        sheet.mergeCells(`K${currentRow}:L${currentRow}`);
        row.getCell(11).value = totals.taxAmount;
        for (let i = 1; i <= 12; i++) {
            const cell = row.getCell(i);
            applyBorder(cell);
            applyFill(cell, 'FFEAEAEA');
            if (i >= 4 && i <= 8)
                cell.numFmt = '#,##0.00';
            if (i >= 9)
                cell.numFmt = '#,##0';
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
    gtRow.getCell(9).value = '';
    gtRow.getCell(10).value = grandTotalSaleValue;
    sheet.mergeCells(`K${currentRow}:L${currentRow}`);
    gtRow.getCell(11).value = grandTotalTaxAmount;
    for (let i = 1; i <= 12; i++) {
        const cell = gtRow.getCell(i);
        applyBorder(cell);
        applyFill(cell, 'FFFFC000');
        applyFont(cell, { bold: true });
        if (i >= 4 && i <= 8)
            cell.numFmt = '#,##0.00';
        if (i >= 9)
            cell.numFmt = '#,##0';
        if (i === 8 && grandTotalVariance < 0)
            applyFont(cell, { color: { argb: 'FFFF0000' }, bold: true });
    }
    currentRow += 2;
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const cashHeader = sheet.getCell(`A${currentRow}`);
    cashHeader.value = 'CASH SETTLEMENT';
    applyFont(cashHeader, { bold: true, color: { argb: 'FFFFFFFF' } });
    applyFill(cashHeader, 'FF548235');
    currentRow++;
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    sheet.getCell(`A${currentRow}`).value =
        'Total Sales Value (Mobile-recorded sales to outlets):';
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const tsvCell = sheet.getCell(`J${currentRow}`);
    tsvCell.value = grandTotalSaleValue;
    tsvCell.numFmt = '#,##0';
    applyFont(tsvCell, { bold: true });
    applyFill(tsvCell, 'FFEAEAEA');
    applyFill(sheet.getCell(`K${currentRow}`), 'FFEAEAEA');
    applyFill(sheet.getCell(`L${currentRow}`), 'FFEAEAEA');
    applyBorder(tsvCell);
    applyBorder(sheet.getCell(`K${currentRow}`));
    applyBorder(sheet.getCell(`L${currentRow}`));
    currentRow++;
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    sheet.getCell(`A${currentRow}`).value =
        'Total Tax Amount (From recorded sales):';
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const taxCell = sheet.getCell(`J${currentRow}`);
    taxCell.value = grandTotalTaxAmount;
    taxCell.numFmt = '#,##0';
    applyFont(taxCell, { bold: true });
    applyFill(taxCell, 'FFEAEAEA');
    applyFill(sheet.getCell(`K${currentRow}`), 'FFEAEAEA');
    applyFill(sheet.getCell(`L${currentRow}`), 'FFEAEAEA');
    applyBorder(taxCell);
    applyBorder(sheet.getCell(`K${currentRow}`));
    applyBorder(sheet.getCell(`L${currentRow}`));
    currentRow++;
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const shortageText = sheet.getCell(`A${currentRow}`);
    shortageText.value =
        'Default Outlet Posting Value (Shortage — Salesman accountable):';
    shortageText.alignment = { horizontal: 'right' };
    applyFont(shortageText, { color: { argb: 'FFFF0000' } });
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const shortageCell = sheet.getCell(`J${currentRow}`);
    shortageCell.value = grandTotalDefaultOutletValue;
    shortageCell.numFmt = '#,##0';
    applyFont(shortageCell, { bold: true, color: { argb: 'FFFF0000' } });
    applyFill(shortageCell, 'FFEAEAEA');
    applyFill(sheet.getCell(`K${currentRow}`), 'FFEAEAEA');
    applyFill(sheet.getCell(`L${currentRow}`), 'FFEAEAEA');
    applyBorder(shortageCell);
    applyBorder(sheet.getCell(`K${currentRow}`));
    applyBorder(sheet.getCell(`L${currentRow}`));
    currentRow++;
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const shortageTaxText = sheet.getCell(`A${currentRow}`);
    shortageTaxText.value =
        'Default Outlet Posting Tax Amount (Shortage — Salesman accountable):';
    shortageTaxText.alignment = { horizontal: 'right' };
    applyFont(shortageTaxText, { color: { argb: 'FFFF0000' } });
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const shortageTaxCell = sheet.getCell(`J${currentRow}`);
    shortageTaxCell.value = grandTotalDefaultOutletTax;
    shortageTaxCell.numFmt = '#,##0';
    applyFont(shortageTaxCell, { bold: true, color: { argb: 'FFFF0000' } });
    applyFill(shortageTaxCell, 'FFEAEAEA');
    applyFill(sheet.getCell(`K${currentRow}`), 'FFEAEAEA');
    applyFill(sheet.getCell(`L${currentRow}`), 'FFEAEAEA');
    applyBorder(shortageTaxCell);
    applyBorder(sheet.getCell(`K${currentRow}`));
    applyBorder(sheet.getCell(`L${currentRow}`));
    currentRow++;
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const totalText = sheet.getCell(`A${currentRow}`);
    totalText.value = `TOTAL CASH SALESMAN MUST DEPOSIT AT DEPOT (${currencyCode}):`;
    totalText.alignment = { horizontal: 'right' };
    applyFont(totalText, { bold: true, color: { argb: 'FFFF0000' } });
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const depositCell = sheet.getCell(`J${currentRow}`);
    depositCell.value =
        grandTotalSaleValue +
            grandTotalTaxAmount +
            grandTotalDefaultOutletValue +
            grandTotalDefaultOutletTax;
    depositCell.numFmt = '#,##0';
    applyFont(depositCell, { bold: true, color: { argb: 'FFFF0000' } });
    applyFill(depositCell, 'FFFFC000');
    applyFill(sheet.getCell(`K${currentRow}`), 'FFFFC000');
    applyFill(sheet.getCell(`L${currentRow}`), 'FFFFC000');
    applyBorder(depositCell);
    applyBorder(sheet.getCell(`K${currentRow}`));
    applyBorder(sheet.getCell(`L${currentRow}`));
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
    sheet.mergeCells(`J${currentRow}:L${currentRow}`);
    const boldCells = [1, 2, 3, 4, 5, 7];
    boldCells.forEach(col => applyFont(hRow.getCell(col), { bold: true }));
    [1, 2, 3, 4, 5, 6, 7, 9, 10, 11].forEach(col => applyBorder(hRow.getCell(col)));
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
        }
        else if (i === 8) {
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            row.getCell(1).value = 'Total';
            applyFont(row.getCell(1), { bold: true });
            [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
        }
        else if (i === 9) {
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            row.getCell(1).value = 'Empties Loan Quantity';
            applyFont(row.getCell(1), { bold: true });
            [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
        }
        else if (i === 10) {
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            row.getCell(1).value = 'Empties Loan Returned Quantity';
            applyFont(row.getCell(1), { bold: true });
            [1, 2, 3].forEach(col => applyBorder(row.getCell(col)));
        }
        else if (i === 11) {
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
        }
        else if (i === 11) {
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
            sheet.mergeCells(`J${currentRow}:L${currentRow}`);
            [9, 10, 11].forEach(col => applyBorder(row.getCell(col)));
        }
        currentRow++;
    }
    currentRow += 2;
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
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
exports.exportReconciliationExcelService = exportReconciliationExcelService;
//# sourceMappingURL=reconciliation-export.service.js.map