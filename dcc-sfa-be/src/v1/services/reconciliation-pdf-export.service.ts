import PDFDocument from 'pdfkit';

/**
 * Generates a PDF buffer for the reconciliation settlement sheet.
 * @param {any} reconciliationData - The reconciliation payload containing meta and data items.
 * @returns {Promise<Buffer>} The generated PDF file buffer.
 */
export const exportReconciliationPdfService = async (
  reconciliationData: any
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        layout: 'landscape',
      });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      const { meta, data: rawItems } = reconciliationData;

      const items = (rawItems || []).reduce((acc: any[], item: any) => {
        const key = `${item.categoryName}_${item.skuCode}`;
        const existing = acc.find(
          i => `${i.categoryName}_${i.skuCode}` === key
        );
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

      doc
        .fontSize(16)
        .fillColor('#1F4E78')
        .text('SettlementSheet — Daily Salesman Settlement', {
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

      const formatNum = (num: number | string) => {
        return Number(num || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const drawRow = (
        yPos: number,
        texts: string[],
        widths: number[],
        isHeader = false
      ) => {
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
      const colWidths = [50, 130, 60, 60, 60, 60, 65, 60, 75, 125];

      y = drawRow(y, columns, colWidths, true);

      const groupedItems = items.reduce((acc: any, item: any) => {
        const cat = item.categoryName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
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
              .rect(
                30,
                y,
                colWidths.reduce((a, b) => a + b, 0),
                20
              )
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
          .rect(
            30,
            y,
            colWidths.reduce((a, b) => a + b, 0),
            20
          )
          .fill('#7030A0');
        doc
          .fillColor('white')
          .font('Helvetica-Bold')
          .text(category, 35, y + 6);
        y += 20;

        let catLoad = 0,
          catSales = 0,
          catExpected = 0,
          catActual = 0,
          catVariance = 0,
          catSaleValue = 0;

        (catItems as any[]).forEach(item => {
          checkPageBreak();
          const conv = Number(item.conversionRate) || 1;
          const price = Number(item.basePrice) || 0;
          const basePricePerPc = price / conv;

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

          const varianceVal = Number(item.variance) || 0;
          const varianceBaseVal = Number(item.varianceBaseQty) || 0;

          const saleVal =
            (Number(item.saleQuantity) || 0) * price +
            (Number(item.saleBaseQty) || 0) * basePricePerPc;

          const sign =
            varianceVal < 0 || varianceBaseVal < 0
              ? '-'
              : varianceVal > 0 || varianceBaseVal > 0
                ? '+'
                : '';
          const absCases = Math.abs(varianceVal);
          const absPcs = Math.abs(varianceBaseVal);
          const varianceStr =
            varianceVal === 0 && varianceBaseVal === 0
              ? '0 Cs 0 PCs'
              : `${sign}${absCases} Cs ${absPcs} PCs`;

          y = drawRow(
            y,
            [
              String(item.skuCode),
              String(item.skuName),
              `${item.loadQuantity || 0} Cs ${item.loadBaseQty || 0} PCs`,
              `${item.saleQuantity || 0} Cs ${item.saleBaseQty || 0} PCs`,
              `${item.expectedRop || 0} Cs ${item.expectedBaseQty || 0} PCs`,
              hasActualCases || hasActualPCs
                ? `${actualVal} Cs ${actualBaseVal} PCs`
                : '-',
              varianceStr,
              formatNum(price),
              formatNum(saleVal),
              String(item.resolutionAction || '-'),
            ],
            colWidths
          );

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

          if (
            item.resolutionAction &&
            item.resolutionAction.includes('Default Outlet') &&
            (varianceVal < 0 || varianceBaseVal < 0)
          ) {
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
      doc.text('Total Sales Value (Mobile-recorded sales to outlets):', 30, y);
      doc.text(
        `${formatNum(grandTotalSaleValue)} ${meta.currency || 'TZS'}`,
        30,
        y,
        { width: 735, align: 'right' }
      );
      y += 20;

      doc
        .fillColor('red')
        .text('Default Outlet Posting Value (Shortage):', 30, y);
      doc.text(
        `${formatNum(grandTotalDefaultOutletValue)} ${meta.currency || 'TZS'}`,
        30,
        y,
        { width: 735, align: 'right' }
      );
      y += 20;

      doc
        .fillColor('red')
        .font('Helvetica-Bold')
        .text('TOTAL CASH SALESMAN MUST DEPOSIT:', 30, y);

      const totalStr = `${formatNum(grandTotalSaleValue + grandTotalDefaultOutletValue)} ${meta.currency || 'TZS'}`;
      const textWidth = doc.widthOfString(totalStr);
      const rectWidth = Math.max(150, textWidth + 20);
      doc.rect(775 - rectWidth, y - 5, rectWidth, 20).fill('#FFC000');

      doc
        .fillColor('red')
        .text(totalStr, 30, y, { width: 735, align: 'right' });

      if (y > 350) {
        doc.addPage();
        y = 30;
      } else {
        y += 40;
      }

      // --- STATIC SUMMARY TABLE ---
      const rowHeight = 16;
      const b1X = 30,
        b1C1 = 30,
        b1C2 = 110,
        b1C3 = 100;
      const b2X = 280,
        b2C1 = 30,
        b2C2 = 110,
        b2C3 = 100;
      const b3X = 530,
        b3C1 = 150,
        b3C2 = 95;

      const drawCell = (
        x: number,
        yPos: number,
        width: number,
        text: string,
        isBold = false,
        align: 'left' | 'center' | 'right' = 'left',
        drawBorder = true,
        fontSize = 8
      ) => {
        if (drawBorder) {
          doc.lineWidth(0.5).strokeColor('#A6A6A6');
          doc.rect(x, yPos, width, rowHeight).stroke();
        }
        doc
          .fillColor('black')
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(fontSize);
        doc.text(text, x + 2, yPos + 4, { width: width - 4, align });
      };

      // Header Row
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
        // Left block
        if (i <= 7) {
          drawCell(b1X, y, b1C1, String(i), false, 'center');
          drawCell(b1X + b1C1, y, b1C2, '', false, 'left');
          drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
        } else if (i === 8) {
          drawCell(b1X, y, b1C1 + b1C2, 'Total', true, 'left');
          drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
        } else if (i === 9) {
          drawCell(
            b1X,
            y,
            b1C1 + b1C2,
            'Empties Loan Quantity',
            true,
            'left',
            true,
            7.5
          );
          drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
        } else if (i === 10) {
          drawCell(
            b1X,
            y,
            b1C1 + b1C2,
            'Empties Loan Returned Quantity',
            true,
            'left',
            true,
            7.5
          );
          drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
        } else if (i === 11) {
          drawCell(b1X, y, b1C1 + b1C2, 'Balance', true, 'left');
          drawCell(b1X + b1C1 + b1C2, y, b1C3, '', false, 'left');
        }

        // Middle block
        if (i <= 10) {
          drawCell(b2X, y, b2C1, String(i), false, 'center');
          drawCell(b2X + b2C1, y, b2C2, '', false, 'left');
          drawCell(b2X + b2C1 + b2C2, y, b2C3, '', false, 'left');
        } else if (i === 11) {
          drawCell(b2X, y, b2C1 + b2C2, 'Total', true, 'left');
          drawCell(b2X + b2C1 + b2C2, y, b2C3, '', false, 'left');
        }

        // Right block
        const label = rightLabels[i - 1];
        if (label !== undefined && label !== '') {
          const isBold =
            label.includes('Total Sales') || label.includes('Overage');
          drawCell(b3X, y, b3C1, label, isBold, 'left');
          drawCell(b3X + b3C1, y, b3C2, '', false, 'left');
        }

        y += rowHeight;
      }

      if (y > 400) {
        doc.addPage();
        y = 30;
      } else {
        y += 40;
      }

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
    } catch (error) {
      reject(error);
    }
  });
};
