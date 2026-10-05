import PDFDocument from 'pdfkit';
import prisma from '../configs/prisma.client';
import { uploadFile, deleteFile } from '../utils/blackbaze';

export interface AssetMovementContractData {
  id: number;
  asset_movement_assets: {
    asset_movement_assets_asset: {
      id: number;
      name: string;
      serial_number: string;
      asset_master_asset_types?: {
        id: number;
        name: string;
      } | null;
    };
  }[];
  asset_movements_performed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  asset_movement_from_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_from_customer?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_depot?: {
    id: number;
    name: string;
  } | null;
  asset_movement_to_customer?: {
    id: number;
    name: string;
  } | null;
  movement_type?: string | null;
  movement_date: Date;
  notes?: string | null;
}

export class ContractGenerationService {
  async generateCoolerIssuanceContract(
    assetMovementId: number
  ): Promise<Buffer> {
    const assetMovement = await prisma.asset_movements.findUnique({
      where: { id: assetMovementId },
      include: {
        asset_movement_assets: {
          include: {
            asset_movement_assets_asset: {
              include: {
                asset_master_asset_types: true,
                asset_master_asset_sub_types: true,
              },
            },
          },
        },
        asset_movements_performed_by: true,
        approved_by_user: true,
        asset_movement_from_depot: true,
        asset_movement_from_customer: {
          include: {
            customer_zones: true,
            customer_routes: true,
            customer_depot: true,
            customer_type_customer: true,
          },
        },
        asset_movement_to_depot: true,
        asset_movement_to_customer: {
          include: {
            customer_zones: true,
            customer_routes: true,
            customer_depot: true,
            customer_type_customer: true,
          },
        },
      },
    });

    if (!assetMovement) {
      throw new Error('Asset movement not found');
    }

    let company = null;
    const depotId =
      assetMovement.from_depot_id ||
      assetMovement.to_depot_id ||
      assetMovement.asset_movement_to_customer?.depot_id;

    if (depotId) {
      const depot = await prisma.depots.findUnique({
        where: { id: depotId },
        include: { depot_companies: true },
      });
      if (depot?.depot_companies) {
        company = depot.depot_companies;
      }
    }

    if (!company) {
      company = await prisma.companies.findFirst({
        where: { is_active: 'Y' },
        orderBy: { id: 'asc' },
      });
    }

    if (!company) {
      company = await prisma.companies.findFirst({
        orderBy: { id: 'asc' },
      });
    }

    const companyName = company?.name || 'BONITE BOTTLERS LTD';
    const companyAddress = company?.address
      ? [company.address, company.city, company.country]
          .filter(Boolean)
          .join(', ')
      : 'P.O. Box 1352, Moshi, Tanzania';
    const companyPhone = company?.phone_number
      ? `Tel: ${company.phone_number}`
      : 'Tel: +255 27 54422/7';

    const formatDate = (date: Date | string | null | undefined): string => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const day = d.getDate().toString().padStart(2, '0');
      const month = months[d.getMonth()];
      const year = d.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        autoFirstPage: false,
      });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const startX = 36;
      const startY = 36;
      const pageWidth = 595.28 - 72;
      const pageHeight = 841.89 - 72;

      const customer =
        assetMovement.asset_movement_to_customer ||
        assetMovement.asset_movement_from_customer;
      const customerCode = customer?.code || 'N/A';
      const customerName =
        customer?.name || assetMovement.asset_movement_to_depot?.name || 'N/A';
      const zoneName = customer?.customer_zones?.name || 'N/A';
      const routeName =
        customer?.customer_routes?.code ||
        customer?.customer_routes?.name ||
        'N/A';
      const depotName =
        customer?.customer_depot?.name ||
        assetMovement.asset_movement_to_depot?.name ||
        assetMovement.asset_movement_from_depot?.name ||
        'Moshi';

      const firstAssetItem =
        assetMovement.asset_movement_assets?.[0]?.asset_movement_assets_asset;
      const barcodeNo =
        firstAssetItem?.barcode || assetMovement.id.toString().padStart(5, '0');
      const clNumber = `CL${assetMovement.id.toString().padStart(7, '0')}`;
      const movementDateStr = formatDate(
        assetMovement.movement_date || new Date()
      );

      const businessType =
        customer?.customer_type_customer?.type_name ||
        customer?.type ||
        'Duka (Shop)';
      const customerAddress = customer?.address || customer?.city || '';
      const customerPhone = customer?.phone_number || '';

      const equipmentType =
        firstAssetItem?.asset_master_asset_types?.name || 'Cooler';
      const serialNo = firstAssetItem?.serial_number || 'N/A';
      const assetNo =
        firstAssetItem?.id?.toString() || firstAssetItem?.code || 'N/A';

      doc.addPage();

      doc.lineWidth(1).strokeColor('#000000');
      doc.rect(startX, startY, pageWidth, pageHeight).stroke();

      const headerH = 55;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(companyName.toUpperCase(), startX, startY + 12, {
          align: 'center',
          width: pageWidth,
        });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .text(companyAddress, startX, startY + 26, {
          align: 'center',
          width: pageWidth,
        });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .text(companyPhone, startX, startY + 38, {
          align: 'center',
          width: pageWidth,
        });

      const headerBottomY = startY + headerH;
      doc
        .moveTo(startX, headerBottomY)
        .lineTo(startX + pageWidth, headerBottomY)
        .stroke();

      const titleH = 28;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('COOLER ISSUE NOTE', startX, headerBottomY + 8, {
          align: 'center',
          width: pageWidth,
        });

      const titleBottomY = headerBottomY + titleH;
      doc
        .moveTo(startX, titleBottomY)
        .lineTo(startX + pageWidth, titleBottomY)
        .stroke();

      const infoH = 88;
      const leftCol1W = 95;
      const leftCol1X = startX + leftCol1W;
      const midX = startX + 245;
      const infoBottomY = titleBottomY + infoH;

      const leftY = titleBottomY + 7;
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8);
      doc.text('Issued to:', startX + 6, leftY);
      doc.text('Outlet Zone', startX + 6, titleBottomY + 34);
      doc.text('Outlet Route', startX + 6, titleBottomY + 50);
      doc.text('Depot', startX + 6, titleBottomY + 66);

      const valW = midX - leftCol1X - 10;
      doc.fillColor('#000000').font('Helvetica').fontSize(8);
      doc.text(customerCode, leftCol1X + 6, leftY, { width: valW });
      doc.text(customerName, leftCol1X + 6, leftY + 12, {
        width: valW,
        lineBreak: false,
        ellipsis: true,
      });
      doc.text(zoneName, leftCol1X + 6, titleBottomY + 34, { width: valW });
      doc.text(routeName, leftCol1X + 6, titleBottomY + 50, { width: valW });
      doc.text(depotName, leftCol1X + 6, titleBottomY + 66, { width: valW });

      const rightValX = midX + 188;
      const rightValW = startX + pageWidth - rightValX;

      const rRow1Y = titleBottomY + 8;
      const rRow2Y = titleBottomY + 24;
      const rRow3Y = titleBottomY + 58;

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8);
      doc.text('Barcode No: ', midX, rRow1Y, {
        width: rightValX - midX - 6,
        align: 'right',
      });
      doc.text(barcodeNo, rightValX + 6, rRow1Y);

      doc.text('Issue Note Number: ', midX, rRow2Y, {
        width: rightValX - midX - 6,
        align: 'right',
      });
      doc.text(clNumber, rightValX + 6, rRow2Y);

      doc.text('Date: ', midX, rRow3Y, {
        width: rightValX - midX - 6,
        align: 'right',
      });
      doc.text(movementDateStr, rightValX + 6, rRow3Y, { underline: true });

      doc.lineWidth(1).strokeColor('#000000');
      doc
        .moveTo(leftCol1X, titleBottomY)
        .lineTo(leftCol1X, infoBottomY)
        .stroke();

      doc.moveTo(midX, titleBottomY).lineTo(midX, infoBottomY).stroke();

      doc
        .moveTo(startX, infoBottomY)
        .lineTo(startX + pageWidth, infoBottomY)
        .stroke();

      const instY = infoBottomY + 16;
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(
          'Please receive the following equipment in good order and condition.',
          startX,
          instY,
          { align: 'center', width: pageWidth }
        );

      const tableTopY = instY + 24;
      const colWidths = [35, 125, 315, 48];
      const colX = [
        startX,
        startX + colWidths[0],
        startX + colWidths[0] + colWidths[1],
        startX + colWidths[0] + colWidths[1] + colWidths[2],
      ];

      const tableH = 390;
      const headerRowH = 20;

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8);
      doc.text('S.No', colX[0], tableTopY + 6, {
        width: colWidths[0],
        align: 'center',
      });
      doc.text('Cooler Type', colX[1] + 6, tableTopY + 6, {
        width: colWidths[1] - 12,
      });
      doc.text('Cooler Seriel No.', colX[2] + 6, tableTopY + 6, {
        width: colWidths[2] - 12,
      });
      doc.text('Qty', colX[3], tableTopY + 6, {
        width: colWidths[3],
        align: 'center',
      });

      let rowY = tableTopY + headerRowH + 1;
      const rowCellH = 18;
      if (assetMovement.asset_movement_assets?.length) {
        assetMovement.asset_movement_assets.forEach((am: any, idx: number) => {
          const asset = am.asset_movement_assets_asset;
          const cType =
            asset?.name ||
            asset?.asset_master_asset_sub_types?.name ||
            asset?.code ||
            asset?.asset_master_asset_types?.name ||
            'Cooler';
          const sNo = asset?.serial_number || '-';

          doc.fillColor('#000000').font('Helvetica').fontSize(8);
          doc.text(String(idx + 1), colX[0], rowY + 5, {
            width: colWidths[0],
            align: 'center',
          });
          doc.text(cType, colX[1] + 6, rowY + 5, {
            width: colWidths[1] - 12,
            lineBreak: false,
            ellipsis: true,
          });
          doc.text(sNo, colX[2] + 6, rowY + 5, {
            width: colWidths[2] - 12,
            lineBreak: false,
            ellipsis: true,
          });
          doc.text('1', colX[3], rowY + 5, {
            width: colWidths[3],
            align: 'center',
          });

          rowY += rowCellH;
        });
      } else {
        doc.fillColor('#000000').font('Helvetica').fontSize(8);
        doc.text('1', colX[0], rowY + 5, {
          width: colWidths[0],
          align: 'center',
        });
        doc.text('Cooler', colX[1] + 6, rowY + 5, { width: colWidths[1] - 12 });
        doc.text('-', colX[2] + 6, rowY + 5, { width: colWidths[2] - 12 });
        doc.text('1', colX[3], rowY + 5, {
          width: colWidths[3],
          align: 'center',
        });
      }

      doc.lineWidth(1).strokeColor('#000000');
      doc.rect(startX, tableTopY, pageWidth, tableH).stroke();

      doc
        .moveTo(startX, tableTopY + headerRowH)
        .lineTo(startX + pageWidth, tableTopY + headerRowH)
        .stroke();

      for (let i = 1; i < colX.length; i++) {
        doc
          .moveTo(colX[i], tableTopY)
          .lineTo(colX[i], tableTopY + tableH)
          .stroke();
      }

      const p1SigY = tableTopY + tableH + 35;
      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text(
        'Issued by :_________________________________________',
        startX + 8,
        p1SigY
      );
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .text('Store Keeper', startX + 115, p1SigY + 13);
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(
          'Approved by :______________________________',
          startX + pageWidth - 235,
          p1SigY
        );

      doc.addPage();

      const photoW = 85;
      const photoH = 80;
      const photoX = startX + pageWidth - photoW;
      const photoY = startY + 2;
      doc.rect(photoX, photoY, photoW, photoH).stroke('#4B5563');
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('PHOTO', photoX, photoY + 35, {
          width: photoW,
          align: 'center',
        });

      const headerAreaW = pageWidth - photoW - 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(companyName.toUpperCase(), startX, startY + 6, {
          align: 'center',
          width: headerAreaW,
        });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .text(companyAddress, startX, startY + 20, {
          align: 'center',
          width: headerAreaW,
        });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .text(companyPhone, startX, startY + 32, {
          align: 'center',
          width: headerAreaW,
        });

      const dateBoxX = startX + 120;
      const dateBoxW = 75;
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Issue Date:', startX + 4, startY + 44);
      doc.rect(dateBoxX, startY + 41, dateBoxW, 16).stroke('#9CA3AF');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(movementDateStr, dateBoxX, startY + 44, {
          width: dateBoxW,
          align: 'center',
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('Namba ya Mkataba:', startX + 4, startY + 68);
      doc.rect(dateBoxX, startY + 65, dateBoxW, 16).stroke('#9CA3AF');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(clNumber, dateBoxX, startY + 68, {
          width: dateBoxW,
          align: 'center',
        });

      let p2Y = startY + 98;
      doc
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('MKATABA WA KUAZIMISHA CHOMBO / JOKOFU', startX, p2Y);
      p2Y += 14;
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          `Mkataba huu wa kuazimisha Chombo/Jokofu umefanyika kati ya Kampuni ya ${companyName} (ambayo itaitwa “Kampuni”) na mteja aliyetajwa hapa chini (ambaye ataitwa “Mwazimaji”).`,
          startX,
          p2Y,
          { width: pageWidth, lineGap: 1 }
        );
      p2Y += 20;

      const sec1H = 14;
      doc.rect(startX, p2Y, pageWidth, sec1H).fill('#E2E8F0');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('TAARIFA ZA MWAZIMAJI / OWNER INFORMATION', startX + 4, p2Y + 3);
      p2Y += sec1H + 4;

      const renderFieldRow = (label: string, value: string) => {
        doc
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(label, startX + 4, p2Y + 2);
        const valX = startX + 160;
        const valW = pageWidth - 164;
        doc
          .moveTo(valX, p2Y + 12)
          .lineTo(valX + valW, p2Y + 12)
          .stroke('#6B7280');
        if (value) {
          doc
            .fillColor('#000000')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text(value, valX + 4, p2Y + 1);
        }
        p2Y += 17;
      };

      renderFieldRow('Jina la Biashara / Business Name :', customerName);
      renderFieldRow('Aina ya Biashara / Business Type :', businessType);
      renderFieldRow('Mahali / Mtaa / Address:', customerAddress);
      renderFieldRow('Namba ya Simu / Mobile No:', customerPhone);

      p2Y += 3;

      doc.rect(startX, p2Y, pageWidth, sec1H).fill('#E2E8F0');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('TAARIFA ZA CHOMBO (EQUIPMENT DETAILS)', startX + 4, p2Y + 3);
      p2Y += sec1H + 4;

      renderFieldRow('Aina ya Chombo / Equipment Type', equipmentType);
      renderFieldRow('Namba ya Utambulisho / Seriel No.', serialNo);
      renderFieldRow('Namba ya Mali / Asset No.', assetNo);
      renderFieldRow('Namba ya Barcode / Barcode No.', barcodeNo);
      renderFieldRow('Namba ya GIN / GIN Number', clNumber);

      p2Y += 3;

      doc.rect(startX, p2Y, pageWidth, sec1H).fill('#E2E8F0');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('MASHARTI YA MKATABA', startX, p2Y + 3, {
          align: 'center',
          width: pageWidth,
        });
      p2Y += sec1H + 5;

      const clauses = [
        '1.   Kampuni inamwazimisha Mwazimaji Chombo/Jokofu kilichotajwa hapo juu na kukiweka katika eneo la biashara lililotajwa bila malipo yoyote. Chombo/Jokofu kitabaki kuwa mali ya Kampuni wakati wote.',
        '2.   Chombo/Jokofu kitatumika wakati wote kwa bidhaa za Coca-Cola na jamii yake tu, na si kwa bidhaa nyingine kama maziwa, bia, maji, vyakula n.k.',
        '3.   Chombo/Jokofu kitakaguliwa na mwakilishi wa Kampuni mara kwa mara. Endapo itabainika kuwa kinatumika kinyume na kipengele namba 2, Kampuni itakichukua mara moja.',
        '4.   Kampuni itakuwa na haki ya kuchukua Chombo/Jokofu chake wakati wowote bila kipingamizi wala kizuizi chochote. Ruhusa ya Mwazimaji haitahitajika.',
        '5.   Mwazimaji atatunza Chombo/Jokofu katika eneo la biashara lililotajwa hapo juu. Hairuhusiwi kukihamisha kutoka eneo hilo bila ruhusa ya maandishi kutoka kwa Kampuni.',
        '6.   Mwazimaji anatakiwa kukiweka Chombo/Jokofu katika hali ya usafi. Ni marufuku kubadilisha kwa namna yoyote rangi, nembo au alama za biashara za Kampuni.',
        '7.   Mwazimaji atalipa gharama zote za umeme. Hairuhusiwi kabisa kukiweka Chombo/Jokofu rehani kwa sababu ya kushindwa kulipa kodi ya pango au malipo mengine yoyote yanayohusu biashara yake.',
        '8.   Mwazimaji anatakiwa kuwa na kreti za kutosha na kujaza soda kwenye jokofu wakati wote; vinginevyo jokofu linaweza kuchukuliwa na kupewa mteja mwingine. Kiwango cha chini ni kreti zinazoweza kujaza jokofu mara mbili.',
        '9.   Mwazimaji mwenye jokofu la Kampuni ni lazima auze bidhaa za Kampuni kwa bei iliyopendekezwa.',
        '10. Chombo/Jokofu kitakuwa chini ya uangalizi wa Mwazimaji. Endapo kutatokea upotevu au uharibifu wowote, Mwazimaji atawajibika kikamilifu kufidia hasara au uharibifu huo.',
        '11. Kampuni haitawajibika kwa namna yoyote kwa uharibifu au hasara itakayotokana na matumizi ya Chombo/Jokofu, wala kwa madai yoyote ya mtu mwingine yatakayotokana na matumizi hayo.',
      ];

      doc.font('Helvetica').fontSize(7.2);
      clauses.forEach(c => {
        doc.text(c, startX + 4, p2Y, { width: pageWidth - 8, lineGap: 1 });
        p2Y = doc.y + 4;
      });

      let p2SigY = p2Y + 10;

      const halfW = (pageWidth - 10) / 2;
      doc.rect(startX, p2SigY, halfW, 14).fill('#E2E8F0');
      doc.rect(startX + halfW + 10, p2SigY, halfW, 14).fill('#E2E8F0');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8);
      doc.text('Kwania ya kampuni :', startX + 4, p2SigY + 3);
      doc.text('Kwa niaba ya Mwazimishaji:', startX + halfW + 14, p2SigY + 3);
      p2SigY += 18;

      doc.font('Helvetica-Bold').fontSize(8);
      doc.text(
        'Jina Kamili: ................................................................',
        startX + 4,
        p2SigY
      );
      doc.text(
        'Jina Kamili: ................................................................',
        startX + halfW + 14,
        p2SigY
      );
      p2SigY += 15;

      doc.text(
        'Wadhifa : ...................................................................',
        startX + 4,
        p2SigY
      );
      doc.text(
        'Wadhifa: ...................................................................',
        startX + halfW + 14,
        p2SigY
      );
      p2SigY += 15;

      doc.text(
        'Sahihi : .....................................................................',
        startX + 4,
        p2SigY
      );
      doc.text(
        'Sahihi: .....................................................................',
        startX + halfW + 14,
        p2SigY
      );
      p2SigY += 20;

      doc.font('Helvetica').fontSize(8);
      doc.text(
        'Chombo/Jokofu limewekwa na ......................................... Sahihi.......................................................... Wadhifa..................',
        startX + 4,
        p2SigY
      );

      doc.end();
    });
  }

  async uploadContractToBackblaze(
    assetMovementId: number,
    contractBuffer: Buffer
  ): Promise<string> {
    const fileName = `contracts/cooler-contract-${assetMovementId}-${Date.now()}.pdf`;

    try {
      const fileUrl = await uploadFile(
        contractBuffer,
        fileName,
        'application/pdf'
      );
      console.log(`Contract uploaded to Backblaze: ${fileUrl}`);
      return fileUrl;
    } catch (error: any) {
      console.error('Error uploading contract to Backblaze:', error);
      throw new Error(`Failed to upload contract: ${error.message}`);
    }
  }

  async saveContractUrlToDatabase(
    assetMovementId: number,
    contractUrl: string
  ): Promise<any> {
    const contractRecord = await prisma.asset_movement_contracts.create({
      data: {
        asset_movement_id: assetMovementId,
        contract_number: `COOL-${assetMovementId.toString().padStart(6, '0')}`,
        contract_date: new Date(),
        contract_url: contractUrl,
        createdby: 1,
        createdate: new Date(),
        is_active: 'Y',
      },
    });

    return contractRecord;
  }

  async getContractByAssetMovementId(assetMovementId: number): Promise<any> {
    return await prisma.asset_movement_contracts.findFirst({
      where: {
        asset_movement_id: assetMovementId,
      },
      orderBy: {
        createdate: 'desc',
      },
    });
  }

  async generateContractOnApproval(assetMovementId: number): Promise<any> {
    try {
      console.log(
        `Starting contract generation for asset movement: ${assetMovementId}`
      );

      const allContracts = await prisma.asset_movement_contracts.findMany({
        where: { asset_movement_id: assetMovementId },
      });
      console.log(
        `All contracts in database for asset movement ${assetMovementId}:`,
        allContracts.map(c => ({
          id: c.id,
          contract_url: c.contract_url,
          is_active: c.is_active,
          createdate: c.createdate,
        }))
      );

      const existingContracts = await prisma.asset_movement_contracts.findMany({
        where: { asset_movement_id: assetMovementId },
      });

      console.log(
        `Found ${existingContracts.length} existing contracts for asset movement: ${assetMovementId}`
      );

      for (const contract of existingContracts) {
        if (contract.contract_url) {
          try {
            const urlParts = contract.contract_url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            console.log(`Attempting to delete from Backblaze: ${fileName}`);

            await deleteFile(fileName);
            console.log(`Successfully deleted from Backblaze: ${fileName}`);
          } catch (error) {
            console.error('Error deleting from Backblaze:', error);
          }
        }
      }

      const deleteResult = await prisma.asset_movement_contracts.deleteMany({
        where: { asset_movement_id: assetMovementId },
      });

      console.log(
        `Deleted ${deleteResult.count} contracts from database for asset movement: ${assetMovementId}`
      );

      const contractBuffer =
        await this.generateCoolerIssuanceContract(assetMovementId);

      const contractUrl = await this.uploadContractToBackblaze(
        assetMovementId,
        contractBuffer
      );

      const contractRecord = await this.saveContractUrlToDatabase(
        assetMovementId,
        contractUrl
      );

      console.log(
        `Contract generated and uploaded for asset movement: ${assetMovementId}`
      );
      return contractRecord;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  }
}
