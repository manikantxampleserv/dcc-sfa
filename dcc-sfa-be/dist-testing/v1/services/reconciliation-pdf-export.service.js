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
                layout: 'landscape',
            });
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
                    existing.loadQuantity = (Number(existing.loadQuantity) || 0) + (Number(item.loadQuantity) || 0);
                    existing.saleQuantity = (Number(existing.saleQuantity) || 0) + (Number(item.saleQuantity) || 0);
                    existing.expectedRop = (Number(existing.expectedRop) || 0) + (Number(item.expectedRop) || 0);
                    const actualExisting = existing.actualRop !== '' && existing.actualRop !== null ? Number(existing.actualRop) : 0;
                    const actualItem = item.actualRop !== '' && item.actualRop !== null ? Number(item.actualRop) : 0;
                    existing.actualRop = String(actualExisting + actualItem);
                    existing.variance = String((Number(existing.variance) || 0) + (Number(item.variance) || 0));
                    if (!existing.resolutionAction || existing.resolutionAction === 'CLEAN' || existing.resolutionAction === '-') {
                        existing.resolutionAction = item.resolutionAction || existing.resolutionAction;
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
                .text('R_SettlementSheet — Daily Salesman Settlement', {
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
            doc.moveDown();
            doc.fillColor('black');
            doc
                .font('Helvetica-Bold')
                .text(`Salesman Name: `, 30, doc.y, { continued: true })
                .font('Helvetica')
                .text(meta.salesman?.name || '-');
            doc
                .font('Helvetica-Bold')
                .text(`SAP Code: `, 30, doc.y + 5, { continued: true })
                .font('Helvetica')
                .text(meta.salesman?.sap_code || '-');
            const curDate = meta.reconciliation_date
                ? new Date(meta.reconciliation_date).toLocaleDateString('en-GB')
                : '-';
            doc
                .font('Helvetica-Bold')
                .text(`Settlement Date: `, 30, doc.y + 5, { continued: true })
                .font('Helvetica')
                .text(curDate);
            doc
                .font('Helvetica-Bold')
                .text(`Depot: `, 400, 70, { continued: true })
                .font('Helvetica')
                .text(meta.depot?.name || '-');
            doc
                .font('Helvetica-Bold')
                .text(`Generated On: `, 400, 100, { continued: true })
                .font('Helvetica')
                .text(new Date().toLocaleDateString('en-GB'));
            doc.moveDown(2);
            let y = doc.y;
            const formatNum = (num) => {
                return Number(num || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            };
            const drawRow = (yPos, texts, widths, isHeader = false) => {
                let x = 30;
                doc.lineWidth(0.5).strokeColor('#ccc');
                doc
                    .moveTo(30, yPos)
                    .lineTo(30 + widths.reduce((a, b) => a + b, 0), yPos)
                    .stroke();
                for (let i = 0; i < texts.length; i++) {
                    doc
                        .fontSize(8)
                        .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                        .fillColor(isHeader ? 'white' : 'black');
                    if (isHeader) {
                        doc.rect(x, yPos, widths[i], 20).fill('#4472C4');
                        doc.fillColor('white');
                    }
                    doc.text(texts[i], x + 2, yPos + 6, {
                        width: widths[i] - 4,
                        align: 'center',
                    });
                    doc
                        .moveTo(x, yPos)
                        .lineTo(x, yPos + 20)
                        .stroke();
                    x += widths[i];
                }
                doc
                    .moveTo(x, yPos)
                    .lineTo(x, yPos + 20)
                    .stroke();
                doc
                    .moveTo(30, yPos + 20)
                    .lineTo(x, yPos + 20)
                    .stroke();
                return yPos + 20;
            };
            const columns = [
                'SKU Code',
                'SKU Name',
                'Load Qty',
                'Sales Qty',
                'Expected',
                'Actual',
                'Variance',
                'Unit Price',
                'Sale Value',
                'Action',
            ];
            const colWidths = [60, 160, 45, 45, 45, 45, 45, 70, 80, 150];
            y = drawRow(y, columns, colWidths, true);
            const groupedItems = items.reduce((acc, item) => {
                const cat = item.categoryName || 'Uncategorized';
                if (!acc[cat])
                    acc[cat] = [];
                acc[cat].push(item);
                return acc;
            }, {});
            let grandTotalLoad = 0;
            let grandTotalSales = 0;
            let grandTotalExpected = 0;
            let grandTotalActual = 0;
            let grandTotalVariance = 0;
            let grandTotalSaleValue = 0;
            let grandTotalDefaultOutletValue = 0;
            let currentCategory = '';
            const checkPageBreak = (force = false) => {
                if (y > 480 || force) {
                    doc.addPage();
                    y = 30;
                    y = drawRow(y, columns, colWidths, true);
                    if (currentCategory) {
                        doc
                            .rect(30, y, colWidths.reduce((a, b) => a + b, 0), 20)
                            .fill('#7030A0');
                        doc
                            .fillColor('white')
                            .font('Helvetica-Bold')
                            .text(`${currentCategory} (Continued)`, 35, y + 6);
                        y += 20;
                    }
                }
            };
            for (const [category, catItems] of Object.entries(groupedItems)) {
                currentCategory = category;
                checkPageBreak();
                doc
                    .rect(30, y, colWidths.reduce((a, b) => a + b, 0), 20)
                    .fill('#7030A0');
                doc
                    .fillColor('white')
                    .font('Helvetica-Bold')
                    .text(category, 35, y + 6);
                y += 20;
                let catLoad = 0, catSales = 0, catExpected = 0, catActual = 0, catVariance = 0, catSaleValue = 0;
                catItems.forEach(item => {
                    checkPageBreak();
                    const actualVal = Number(item.actualRop) || 0;
                    const varianceVal = Number(item.variance) || 0;
                    const saleVal = (Number(item.saleQuantity) || 0) * (Number(item.basePrice) || 0);
                    y = drawRow(y, [
                        String(item.skuCode),
                        String(item.skuName),
                        String(item.loadQuantity || 0),
                        String(item.saleQuantity || 0),
                        String(item.expectedRop || 0),
                        String(actualVal),
                        String(varianceVal),
                        formatNum(item.basePrice),
                        formatNum(saleVal),
                        String(item.resolutionAction || '-'),
                    ], colWidths);
                    catLoad += Number(item.loadQuantity) || 0;
                    catSales += Number(item.saleQuantity) || 0;
                    catExpected += Number(item.expectedRop) || 0;
                    catActual += actualVal;
                    catVariance += varianceVal;
                    catSaleValue += saleVal;
                    if (item.resolutionAction && item.resolutionAction.includes('Default Outlet Posting') &&
                        varianceVal < 0) {
                        grandTotalDefaultOutletValue +=
                            Math.abs(varianceVal) * (Number(item.basePrice) || 0);
                    }
                    else if (item.resolutionAction && item.resolutionAction.includes('Post to Default Outlet') &&
                        varianceVal > 0) {
                        grandTotalDefaultOutletValue +=
                            Math.abs(varianceVal) * (Number(item.basePrice) || 0);
                    }
                });
                grandTotalLoad += catLoad;
                grandTotalSales += catSales;
                grandTotalExpected += catExpected;
                grandTotalActual += catActual;
                grandTotalVariance += catVariance;
                grandTotalSaleValue += catSaleValue;
                currentCategory = '';
            }
            if (y > 400) {
                doc.addPage();
                y = 30;
            }
            y += 20;
            doc.rect(30, y, 745, 20).fill('#548235');
            doc
                .fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('CASH SETTLEMENT', 35, y + 5);
            y += 25;
            doc.fillColor('black').font('Helvetica').fontSize(10);
            doc.text('Total Sales Value (Mobile-recorded sales to outlets):', 30, y, {
                width: 400,
                align: 'right',
            });
            doc.text(`${formatNum(grandTotalSaleValue)} ${meta.currency || 'TZS'}`, 440, y);
            y += 20;
            doc
                .fillColor('red')
                .text('Default Outlet Posting Value (Shortage):', 30, y, {
                width: 400,
                align: 'right',
            });
            doc.text(`${formatNum(grandTotalDefaultOutletValue)} ${meta.currency || 'TZS'}`, 440, y);
            y += 20;
            doc
                .fillColor('red')
                .font('Helvetica-Bold')
                .text('TOTAL CASH SALESMAN MUST DEPOSIT:', 30, y, {
                width: 400,
                align: 'right',
            });
            doc.rect(435, y - 5, 150, 20).fill('#FFC000');
            doc
                .fillColor('red')
                .text(`${formatNum(grandTotalSaleValue + grandTotalDefaultOutletValue)} ${meta.currency || 'TZS'}`, 440, y);
            y += 40;
            doc.rect(30, y, 745, 20).fill('#203764');
            doc
                .fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('SIGNATURES', 35, y + 5);
            y += 40;
            doc.fillColor('black').font('Helvetica').fontSize(10);
            doc.text('Salesman:', 30, y);
            doc
                .moveTo(90, y + 10)
                .lineTo(250, y + 10)
                .stroke();
            doc.text('Depot In-Charge:', 400, y);
            doc
                .moveTo(490, y + 10)
                .lineTo(650, y + 10)
                .stroke();
            y += 40;
            doc.text('Date:', 30, y);
            doc
                .moveTo(90, y + 10)
                .lineTo(250, y + 10)
                .stroke();
            doc.text('Cash Received:', 400, y);
            doc
                .moveTo(490, y + 10)
                .lineTo(650, y + 10)
                .stroke();
            doc.text(meta.currency || 'TZS', 660, y);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.exportReconciliationPdfService = exportReconciliationPdfService;
//# sourceMappingURL=reconciliation-pdf-export.service.js.map