"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReconciliationPdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Generates a PDF buffer for the reconciliation settlement sheet.
 * @param {any} reconciliationData - The reconciliation payload containing meta and data items.
 * @returns {Promise<Buffer>} The generated PDF file buffer.
 */
const exportReconciliationPdfService = async (reconciliationData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                margin: 30,
                size: 'A4',
            });
            doc.on('pageAdded', () => { });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            const { meta, data: rawItems } = reconciliationData;
            const items = (rawItems || []).reduce((acc, item) => {
                const key = `${item.categoryName}_${item.skuCode}`;
                const existing = acc.find(i => `${i.categoryName}_${i.skuCode}` === key);
                if (existing) {
                    existing.loadQuantity =
                        (Number(existing.loadQuantity) || 0) +
                            (Number(item.loadQuantity) || 0);
                    existing.loadBaseQty =
                        (Number(existing.loadBaseQty) || 0) +
                            (Number(item.loadBaseQty) || 0);
                    existing.saleQuantity =
                        (Number(existing.saleQuantity) || 0) +
                            (Number(item.saleQuantity) || 0);
                    existing.saleBaseQty =
                        (Number(existing.saleBaseQty) || 0) +
                            (Number(item.saleBaseQty) || 0);
                    existing.expectedRop =
                        (Number(existing.expectedRop) || 0) +
                            (Number(item.expectedRop) || 0);
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
            doc
                .fontSize(16)
                .fillColor('#1F4E78')
                .text('SettlementSheet - Daily Salesman Settlement', {
                align: 'center',
                underline: true,
            });
            doc
                .fontSize(10)
                .fillColor('#7F7F7F')
                .text('Dynamic template: printable per day, per salesman.', {
                align: 'center',
                oblique: true,
            });
            doc.moveDown(2.5);
            doc.fillColor('black');
            const startY = doc.y;
            doc
                .font('Helvetica-Bold')
                .text(`Salesman Name: `, 30, startY, { continued: true })
                .font('Helvetica')
                .text(meta.salesman?.name || '-');
            doc
                .font('Helvetica-Bold')
                .text(`SAP Code: `, 30, startY + 15, { continued: true })
                .font('Helvetica')
                .text(meta.salesman?.sap_code || '-');
            const curDate = meta.reconciliation_date
                ? new Date(meta.reconciliation_date).toLocaleDateString('en-GB')
                : '-';
            doc
                .font('Helvetica-Bold')
                .text(`Settlement Date: `, 30, startY + 30, { continued: true })
                .font('Helvetica')
                .text(curDate);
            doc
                .font('Helvetica-Bold')
                .text(`Depot: `, 350, startY, { continued: true })
                .font('Helvetica')
                .text(meta.depot?.name || '-');
            const reportingOfficer = meta.salesman?.users?.name || '-';
            doc
                .font('Helvetica-Bold')
                .text(`Reporting Officer: `, 350, startY + 15, { continued: true })
                .font('Helvetica')
                .text(reportingOfficer);
            doc
                .font('Helvetica-Bold')
                .text(`Generated On: `, 350, startY + 30, { continued: true })
                .font('Helvetica')
                .text(new Date().toLocaleDateString('en-GB'));
            doc.y = startY + 50;
            let y = doc.y;
            const formatNum = (num) => {
                return Number(num || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            };
            const drawRow = (yPos, texts, widths, isHeader = false, alignments, bgColors, textColors) => {
                let x = 30;
                doc.lineWidth(0.5).strokeColor('#ccc');
                doc
                    .moveTo(30, yPos)
                    .lineTo(30 + widths.reduce((a, b) => a + b, 0), yPos)
                    .stroke();
                for (let i = 0; i < texts.length; i++) {
                    doc
                        .fontSize(isHeader ? 6.5 : 6)
                        .font(isHeader || texts[i] === 'CLEAN' ? 'Helvetica-Bold' : 'Helvetica');
                    if (isHeader) {
                        doc.rect(x, yPos, widths[i], 13).fill('#4472C4');
                        doc.fillColor('white');
                    }
                    else if (bgColors && bgColors[i]) {
                        doc.rect(x, yPos, widths[i], 13).fill(bgColors[i]);
                        doc.fillColor(textColors?.[i] || 'black');
                    }
                    else {
                        doc.fillColor(textColors?.[i] || 'black');
                    }
                    doc.text(texts[i], x + 2, yPos + 3, {
                        width: widths[i] - 4,
                        align: alignments && alignments[i] ? alignments[i] : 'center',
                    });
                    doc
                        .moveTo(x, yPos)
                        .lineTo(x, yPos + 13)
                        .stroke();
                    x += widths[i];
                }
                doc
                    .moveTo(x, yPos)
                    .lineTo(x, yPos + 13)
                    .stroke();
                doc
                    .moveTo(30, yPos + 13)
                    .lineTo(x, yPos + 13)
                    .stroke();
                return yPos + 13;
            };
            const columns = [
                'S.N',
                'Code',
                'SKU Name',
                'Load Qty',
                'Sales Qty',
                'Expected',
                'Actual',
                'Variance',
                'Unit Price',
                'Sale Value',
                'Tax Amount',
                'Action',
            ];
            const colWidths = [16, 24, 105, 45, 45, 45, 45, 40, 40, 40, 45, 44];
            const colAlignments = [
                'center',
                'left',
                'left',
                'center',
                'center',
                'center',
                'center',
                'center',
                'right',
                'right',
                'right',
                'center',
            ];
            y = drawRow(y, columns, colWidths, true, colAlignments);
            const groupedItems = items.reduce((acc, item) => {
                const cat = item.categoryName || 'Uncategorized';
                if (!acc[cat])
                    acc[cat] = [];
                acc[cat].push(item);
                return acc;
            }, {});
            const categoryTotalsData = [];
            let grandTotalLoad = 0;
            let grandTotalSales = 0;
            let grandTotalExpected = 0;
            let grandTotalActual = 0;
            let grandTotalVariance = 0;
            let grandTotalSaleValue = 0;
            let grandTotalTaxAmount = 0;
            let grandTotalDefaultOutletValue = 0;
            let currentCategory = '';
            const checkPageBreak = (force = false) => {
                if (y > 750 || force) {
                    doc.addPage();
                    y = 30;
                    y = drawRow(y, columns, colWidths, true, colAlignments);
                    if (currentCategory) {
                        doc
                            .rect(30, y, colWidths.reduce((a, b) => a + b, 0), 14)
                            .fill('#7030A0');
                        doc
                            .fillColor('white')
                            .font('Helvetica-Bold')
                            .text(`${currentCategory} (Continued)`, 35, y + 4);
                        y += 14;
                    }
                }
            };
            for (const [category, catItems] of Object.entries(groupedItems)) {
                currentCategory = category;
                checkPageBreak();
                doc
                    .rect(30, y, colWidths.reduce((a, b) => a + b, 0), 14)
                    .fill('#7030A0');
                doc
                    .fillColor('white')
                    .font('Helvetica-Bold')
                    .text(category, 35, y + 4);
                y += 14;
                let catLoad = 0, catSales = 0, catExpected = 0, catActual = 0, catVariance = 0, catSaleValue = 0, catTaxAmount = 0;
                let catSno = 1;
                catItems.forEach(item => {
                    checkPageBreak();
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
                    const hasActualCases = item.actualRop !== '' &&
                        item.actualRop !== null &&
                        item.actualRop !== undefined;
                    const hasActualPCs = item.actualBaseQty !== '' &&
                        item.actualBaseQty !== null &&
                        item.actualBaseQty !== undefined;
                    const actualVal = hasActualCases ? Number(item.actualRop) : 0;
                    const actualBaseVal = hasActualPCs ? Number(item.actualBaseQty) : 0;
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
                    const isRGB = item.subCategoryName?.toUpperCase().includes('RGB') ||
                        item.subCategoryName?.toUpperCase().includes('RETURNABLE GLASS');
                    const varianceStr = variance.c === 0 && variance.p === 0
                        ? `0 Cs ${isRGB ? '0 Btls' : ''}`.trim()
                        : `${sign}${absCases} Cs ${isRGB ? `${absPcs} Btls` : ''}`.trim();
                    const load = normalizeQty(Number(item.loadQuantity), Number(item.loadBaseQty));
                    const sale = normalizeQty(Number(item.saleQuantity), Number(item.saleBaseQty));
                    const expected = normalizeQty(Number(item.expectedRop), Number(item.expectedBaseQty));
                    const actual = normalizeQty(actualVal, actualBaseVal);
                    const saleVal = (Number(item.saleQuantity) || 0) * price +
                        (Number(item.saleBaseQty) || 0) * basePricePerPc;
                    const rawAction = String(item.resolutionAction || '-');
                    let actionText = rawAction;
                    if (rawAction === 'Posted to Default Outlet')
                        actionText = 'Posted to D/O';
                    const actionBg = actionText === 'CLEAN'
                        ? '#C6E0B4'
                        : actionText === 'Posted to D/O'
                            ? '#F8CBAD'
                            : undefined;
                    const actionColor = actionText === 'CLEAN' ? '#006100' : 'black';
                    const rowBgColors = Array(11).fill(undefined).concat(actionBg);
                    const rowTextColors = Array(11).fill(undefined).concat(actionColor);
                    y = drawRow(y, [
                        String(catSno++),
                        String(item.skuCode),
                        String(item.skuName),
                        `${load.c} Cs ${isRGB ? `${load.p} Btls` : ''}`.trim(),
                        `${sale.c} Cs ${isRGB ? `${sale.p} Btls` : ''}`.trim(),
                        `${expected.c} Cs ${isRGB ? `${expected.p} Btls` : ''}`.trim(),
                        hasActualCases || hasActualPCs
                            ? `${actual.c} Cs ${isRGB ? `${actual.p} Btls` : ''}`.trim()
                            : '-',
                        varianceStr,
                        formatNum(price),
                        formatNum(saleVal),
                        formatNum(Number(item.taxAmount) || 0),
                        actionText,
                    ], colWidths, false, colAlignments, rowBgColors, rowTextColors);
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
                    catTaxAmount += Number(item.taxAmount) || 0;
                    if (item.resolutionAction &&
                        item.resolutionAction.includes('Default Outlet') &&
                        (varianceVal < 0 || varianceBaseVal < 0)) {
                        grandTotalDefaultOutletValue +=
                            Math.abs(varianceVal) * price +
                                Math.abs(varianceBaseVal) * basePricePerPc;
                    }
                });
                grandTotalLoad += catLoad;
                grandTotalSales += catSales;
                grandTotalExpected += catExpected;
                grandTotalActual += catActual;
                grandTotalVariance += catVariance;
                grandTotalSaleValue += catSaleValue;
                grandTotalTaxAmount += catTaxAmount;
                categoryTotalsData.push({
                    category,
                    catLoad,
                    catSales,
                    catExpected,
                    catActual,
                    catVariance,
                    catSaleValue,
                    catTaxAmount,
                });
                currentCategory = '';
            }
            if (y > 750) {
                doc.addPage();
                y = 30;
            }
            y += 20;
            // --- SUBTOTALS BY CATEGORY ---
            doc.rect(30, y, 534, 13).fill('#203764');
            doc
                .fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(8)
                .text('SUBTOTALS BY CATEGORY', 35, y + 3);
            y += 13;
            const subColumns = [
                'Category',
                'Total Load Qty',
                'Total Sales Qty',
                'Expected ROP',
                'Actual ROP',
                'Variance',
                'Sale Value',
                'Tax Amount',
            ];
            const subColWidths = [140, 55, 55, 50, 45, 40, 75, 74];
            const subColAlignments = [
                'left',
                'center',
                'center',
                'center',
                'center',
                'center',
                'right',
                'right',
            ];
            y = drawRow(y, subColumns, subColWidths, true, subColAlignments);
            categoryTotalsData.forEach(catTotal => {
                if (y > 750) {
                    doc.addPage();
                    y = 30;
                    y = drawRow(y, subColumns, subColWidths, true, subColAlignments);
                }
                y = drawRow(y, [
                    String(catTotal.category),
                    formatNum(catTotal.catLoad),
                    formatNum(catTotal.catSales),
                    formatNum(catTotal.catExpected),
                    formatNum(catTotal.catActual),
                    formatNum(catTotal.catVariance),
                    formatNum(catTotal.catSaleValue),
                    formatNum(catTotal.catTaxAmount),
                ], subColWidths, false, subColAlignments);
            });
            // GRAND TOTAL ROW
            doc.rect(30, y, subColWidths[0], 13).fill('#FFC000');
            doc
                .fillColor('black')
                .font('Helvetica-Bold')
                .fontSize(6.5)
                .text('GRAND TOTAL', 35, y + 3);
            let curX = 30 + subColWidths[0];
            const grandTotalsArray = [
                grandTotalLoad,
                grandTotalSales,
                grandTotalExpected,
                grandTotalActual,
                grandTotalVariance,
                grandTotalSaleValue,
                grandTotalTaxAmount,
            ];
            doc.lineWidth(0.5).strokeColor('#ccc');
            for (let i = 0; i < grandTotalsArray.length; i++) {
                doc.rect(curX, y, subColWidths[i + 1], 13).fill('#FFC000');
                doc
                    .fillColor(i === 4 && grandTotalsArray[i] < 0 ? 'red' : 'black')
                    .text(formatNum(grandTotalsArray[i]), curX + 2, y + 3, {
                    width: subColWidths[i + 1] - 4,
                    align: subColAlignments[i + 1],
                });
                doc
                    .moveTo(curX, y)
                    .lineTo(curX, y + 13)
                    .stroke();
                curX += subColWidths[i + 1];
            }
            doc
                .moveTo(curX, y)
                .lineTo(curX, y + 13)
                .stroke();
            doc.moveTo(30, y).lineTo(curX, y).stroke();
            doc
                .moveTo(30, y + 13)
                .lineTo(curX, y + 13)
                .stroke();
            doc
                .moveTo(30, y)
                .lineTo(30, y + 13)
                .stroke();
            y += 13;
            if (y > 750) {
                doc.addPage();
                y = 30;
            }
            y += 20;
            doc.rect(30, y, 534, 20).fill('#548235');
            doc
                .fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('CASH SETTLEMENT', 35, y + 6);
            y += 20;
            doc.lineWidth(0.5).strokeColor('#A6A6A6');
            doc.fillColor('black').font('Helvetica').fontSize(9);
            const salesValueStr = `${formatNum(grandTotalSaleValue)}`;
            doc.rect(386, y, 178, 20).fillAndStroke('#E7E6E6', '#A6A6A6');
            doc
                .fillColor('black')
                .text('Total Sales Value (Mobile-recorded sales to outlets):', 30, y + 6, { width: 352, align: 'right' });
            doc
                .fillColor('black')
                .text(salesValueStr, 386, y + 6, { width: 174, align: 'right' });
            y += 20;
            doc.rect(386, y, 178, 20).fillAndStroke('#E7E6E6', '#A6A6A6');
            doc
                .fillColor('red')
                .text('Default Outlet Posting Value (Shortage — Salesman accountable):', 30, y + 6, { width: 352, align: 'right' });
            doc
                .fillColor('red')
                .text(`${formatNum(grandTotalDefaultOutletValue)}`, 386, y + 6, {
                width: 174,
                align: 'right',
            });
            y += 20;
            doc.rect(386, y, 178, 20).fillAndStroke('#FFC000', '#A6A6A6');
            doc
                .fillColor('red')
                .font('Helvetica-Bold')
                .text('TOTAL CASH SALESMAN MUST DEPOSIT AT DEPOT (TZS):', 30, y + 6, {
                width: 352,
                align: 'right',
            });
            const totalStr = `${formatNum(grandTotalSaleValue + grandTotalDefaultOutletValue)}`;
            doc
                .fillColor('red')
                .text(totalStr, 386, y + 6, { width: 174, align: 'right' });
            y += 20;
            if (y > 750) {
                doc.addPage();
                y = 30;
            }
            else {
                y += 20;
            }
            // --- STATIC SUMMARY TABLE ---
            const rowHeight = 16;
            const b1X = 30, b1C1 = 25, b1C2 = 90, b1C3 = 55;
            const b2X = 208, b2C1 = 25, b2C2 = 90, b2C3 = 55;
            const b3X = 386, b3C1 = 114, b3C2 = 64;
            const drawCell = (x, yPos, width, text, isBold = false, align = 'left', drawBorder = true, fontSize = 8) => {
                if (drawBorder) {
                    doc.lineWidth(0.5).strokeColor('#A6A6A6');
                    doc.rect(x, yPos, width, rowHeight).stroke();
                }
                doc
                    .fillColor('black')
                    .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
                    .fontSize(fontSize);
                doc.text(text, x + 2, yPos + 4, {
                    width: width - 4,
                    align,
                    lineBreak: false,
                });
            };
            drawCell(b1X, y, b1C1, 'S.No', true, 'center');
            drawCell(b1X + b1C1, y, b1C2, 'Cash', true, 'left');
            drawCell(b1X + b1C1 + b1C2, y, b1C3, 'Amount', true, 'left');
            drawCell(b2X, y, b2C1, 'S.No', true, 'center');
            drawCell(b2X + b2C1, y, b2C2, 'Bank Name', true, 'left');
            drawCell(b2X + b2C1 + b2C2, y, b2C3, 'Amount', true, 'left');
            drawCell(b3X, y, b3C1, 'Invoice Total:', false, 'left');
            drawCell(b3X + b3C1, y, b3C2, '', false, 'left');
            y += rowHeight;
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
                if (y > 750) {
                    doc.addPage();
                    y = 30;
                    drawCell(b1X, y, b1C1, 'S.No', true, 'center');
                    drawCell(b1X + b1C1, y, b1C2, 'Cash', true, 'left');
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, 'Amount', true, 'left');
                    drawCell(b2X, y, b2C1, 'S.No', true, 'center');
                    drawCell(b2X + b2C1, y, b2C2, 'Bank Name', true, 'left');
                    drawCell(b2X + b2C1 + b2C2, y, b2C3, 'Amount', true, 'left');
                    drawCell(b3X, y, b3C1, 'Invoice Total:', false, 'left');
                    drawCell(b3X + b3C1, y, b3C2, '', false, 'left');
                    y += rowHeight;
                }
                if (i <= 7) {
                    drawCell(b1X, y, b1C1, String(i), false, 'center');
                    drawCell(b1X + b1C1, y, b1C2, '', false, 'left');
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
                }
                else if (i === 8) {
                    drawCell(b1X, y, b1C1 + b1C2, 'Total', true, 'left');
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
                }
                else if (i === 9) {
                    drawCell(b1X, y, b1C1 + b1C2, 'Empties Loan Quantity', true, 'left', true, 6);
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
                }
                else if (i === 10) {
                    drawCell(b1X, y, b1C1 + b1C2, 'Empties Loan Returned Quantity', true, 'left', true, 6);
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
                }
                else if (i === 11) {
                    drawCell(b1X, y, b1C1 + b1C2, 'Balance', true, 'left');
                    drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
                }
                if (i <= 10) {
                    drawCell(b2X, y, b2C1, String(i), false, 'center');
                    drawCell(b2X + b2C1, y, b2C2, '', false, 'left');
                    drawCell(b2X + b2C1 + b2C2, y, b2C3, '', false, 'left');
                }
                else if (i === 11) {
                    drawCell(b2X, y, b2C1 + b2C2, 'Total', true, 'left');
                    drawCell(b2X + b2C1 + b2C2, y, b2C3, '', false, 'left');
                }
                const label = rightLabels[i - 1];
                if (label !== undefined && label !== '') {
                    const isBold = label.includes('Total Sales') || label.includes('Overage');
                    drawCell(b3X, y, b3C1, label, isBold, 'left');
                    drawCell(b3X + b3C1, y, b3C2, '', false, 'left');
                }
                y += rowHeight;
            }
            if (y > 750) {
                doc.addPage();
                y = 30;
            }
            else {
                y += 40;
            }
            doc.rect(30, y, 534, 20).fill('#203764');
            doc
                .fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('SIGNATURES', 35, y + 5);
            y += 40;
            doc.fillColor('black').font('Helvetica').fontSize(10);
            doc.text('Salesman:', 60, y);
            doc
                .moveTo(120, y + 10)
                .lineTo(300, y + 10)
                .stroke();
            doc.text('Depot In-Charge Signature:', 350, y);
            doc
                .moveTo(490, y + 10)
                .lineTo(564, y + 10)
                .stroke();
            y += 40;
            doc.text('Date:', 60, y);
            doc
                .moveTo(120, y + 10)
                .lineTo(300, y + 10)
                .stroke();
            doc.text('Cash Received in (Tzs):', 350, y);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.exportReconciliationPdfService = exportReconciliationPdfService;
//# sourceMappingURL=reconciliation-pdf-export.service.js.map