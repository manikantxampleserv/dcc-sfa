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
              },
            },
          },
        },
        asset_movements_performed_by: true,
        asset_movement_from_depot: true,
        asset_movement_from_customer: true,
        asset_movement_to_depot: true,
        asset_movement_to_customer: true,
      },
    });

    if (!assetMovement) {
      throw new Error('Asset movement not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 80;
      const startX = 40;
      const issuedTo =
        assetMovement.asset_movement_to_customer?.name ||
        assetMovement.asset_movement_to_depot?.name ||
        'N/A';
      const fromName =
        assetMovement.asset_movement_from_customer?.name ||
        assetMovement.asset_movement_from_depot?.name ||
        'N/A';
      const locationName =
        assetMovement.asset_movement_to_depot?.name ||
        assetMovement.asset_movement_to_customer?.name ||
        'N/A';
      const clNumber = `CL${assetMovement.id.toString().padStart(7, '0')}`;
      const barcodeNo = assetMovement.id.toString().padStart(5, '0');
      const movementDate = new Date(assetMovement.movement_date);
      const timeText = new Date().toLocaleTimeString();

      let y = 30;
      doc.font('Helvetica-Bold').fontSize(14).text('BONITE BOTTLERS LTD', startX, y, { align: 'center', width: pageWidth });
      y += 24;
      doc.font('Helvetica-Bold').fontSize(11).text('New Issue', startX, y, { align: 'center', width: pageWidth, underline: true });
      y += 18;

      doc.font('Helvetica').fontSize(9);
      doc.text(`Issued To : ${issuedTo}`, startX, y);
      doc.text(`BARCODE NO: ${barcodeNo}`, startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 14;
      doc.text(`Owner : ${fromName}`, startX, y);
      doc.text(`Time : ${timeText}`, startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 14;
      doc.text(locationName, startX, y);
      doc.text(`Date : ${movementDate.toLocaleDateString()}`, startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 14;
      doc.text(clNumber, startX + pageWidth / 2 - 30, y, { align: 'center', width: 120 });
      doc.text('Route : __________', startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 14;
      doc.text('Zone : __________', startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 14;
      doc.text('Vehicle No : __________________', startX + pageWidth / 2, y, { align: 'right', width: pageWidth / 2 });
      y += 18;

      doc.font('Helvetica-Oblique').fontSize(9).text('Please receive the following in good order and', startX, y, { align: 'center', width: pageWidth });
      y += 14;

      const tableTop = y;
      const tableHeight = 360;
      const colWidths = [50, 150, 200, 60];
      const headers = ['S.No', 'Cooler Type', 'Cooler Number', 'Qty'];
      doc.rect(startX, tableTop, pageWidth, tableHeight).stroke();
      let x = startX;
      doc.rect(startX, tableTop, pageWidth, 24).stroke();
      headers.forEach((h, i) => {
        doc.font('Helvetica').fontSize(9).text(h, x + 4, tableTop + 6, { width: colWidths[i] - 8 });
        x += colWidths[i];
        if (i < headers.length - 1) {
          doc.moveTo(x, tableTop).lineTo(x, tableTop + tableHeight).stroke();
        }
      });

      let rowY = tableTop + 24;
      doc.font('Helvetica').fontSize(9);
      assetMovement.asset_movement_assets.forEach((am, idx) => {
        const asset = am.asset_movement_assets_asset;
        x = startX;
        doc.text(String(idx + 1), x + 4, rowY + 4, { width: colWidths[0] - 8 });
        x += colWidths[0];
        doc.text(asset.asset_master_asset_types?.name || '-', x + 4, rowY + 4, { width: colWidths[1] - 8 });
        x += colWidths[1];
        doc.text(asset.serial_number || '-', x + 4, rowY + 4, { width: colWidths[2] - 8 });
        x += colWidths[2];
        doc.text('1', x + 4, rowY + 4, { width: colWidths[3] - 8 });
        rowY += 18;
      });

      y = tableTop + tableHeight + 20;
      doc.font('Helvetica').fontSize(9);
      doc.text('Issued by: ______________________', startX, y);
      doc.text('Store Keeper', startX + 80, y + 12);
      doc.text('______________________', startX + 260, y);
      doc.text('Approved By', startX + 300, y + 12);

      doc.addPage();
      y = 30;
      const write = (text: string, options?: PDFKit.Mixins.TextOptions) => {
        doc.text(text, startX, y, { width: pageWidth, ...options });
        y = doc.y + 6;
      };

      doc.font('Helvetica-Bold').fontSize(14);
      write('BONITE BOTTLERS LTD', { align: 'center' });
      doc.font('Helvetica').fontSize(9);
      write('P.O.BOX 1352,MOSHI-TANZANIA', { align: 'center' });
      write('Tel: +255 27 54422/7', { align: 'center' });

      doc.rect(startX + pageWidth - 80, 45, 60, 60).stroke();
      doc.font('Helvetica-Bold').fontSize(8).text('PHOTO', startX + pageWidth - 68, 70, { width: 40, align: 'center' });

      y = Math.max(y, 80);
      doc.font('Helvetica-Bold').fontSize(9);
      write(`NO. ${clNumber}`);
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('MKATABA WA KUAZIMISHA CHOMBO / JOKOFU', startX, y, { underline: true, width: pageWidth - 160 });
      doc.font('Helvetica').fontSize(9).text(`tarehe : ${movementDate.toLocaleDateString()}`, startX + pageWidth - 150, y);
      y = doc.y + 8;
      doc.font('Helvetica').fontSize(9);
      write('Mkataba wa kuazimisha Chombo/Jokofu umefanyika kati ya Kampuni ya Bonite Bottlers Ltd. na', { lineGap: 2 });
      write(`M/s:  ${issuedTo}`);
      write('Namba ya simu :  _____________________________');
      write('Anayefanya Biashara ya:   SHOP');
      write(`Iliyoopo katika Mtaa wa :  ${locationName}`);
      write('(Ambaye ataitwa “Mwazi maj i”) ambapo kuna makubaliano yafuatayo:-', { lineGap: 2 });

      const firstAsset = assetMovement.asset_movement_assets[0]?.asset_movement_assets_asset;
      write('1. Chombo kinachotakiwa kama: .............................................................');
      write(`   Chenye Sr. No:  ${firstAsset?.serial_number || '________________'}                                Asset No:  ${firstAsset?.id || '________'}`);
      write(`   Barcode No :  ${barcodeNo}`);
      write(`   GIN No :  ${clNumber}`);

      const clauses = [
        '2. Kampuni inaazimisha Chombo/Jokofu na kulikwea katika eneo lililotajwa hapo juu bila malipo yoyote na kitabaki/ litabaki kuwa mali ya kampuni.',
        '3. Chombo/Jokofu litumike wakati wote kwa bidhaa za Coca-Cola na jamii yake tu na sio kwa bidhaa nyingine kama maziwa, bia, maji, vyakula n.k.',
        '4. Chombo/Jokofu litakaguliwa na mwakilishi wa Kampuni mara kwa mara na endapo itabainika kuwepo kwa matumizi tofauti na kipengele namba (3) hapo juu, kampuni itachukua Chombo/Jokofu lake mara moja.',
        '5. Kampuni itakuwa na haki ya kuchukua Chombo/Jokofu lake wakati wowote bila kipingamizi au kizuizi chochote (Ruhusa ya Mwazimaji haitahitajika).',
        '6. Mwazimaji atatunza Chombo/Jokofu hili katika sehemu ya biashara iliyo hapa juu, na hairuhusiwi kabisa kukihamisha kutoka katika eneo la biashara lililotajwa hapo juu; bila ruhusa ya maandishi ya kampuni.',
        '7. Mteja anataka kukuweka Chombo/Jokofu hili katika hali ya usafi na ni marufuku kubadilisha kwa namna yoyote rangi, nembo au alama za biashara za kampuni.',
        '8. Mteja anataka alipe gharama za umeme na hairuhusiwi kabisa kuliweka jokofu rehani kwa kushindwa kulipa kodi ya pango au malipo mengine yoyote yahusuyo biashara yake.',
        '9. Mteja anataka awe na sanduku za kutosha na aje soda kwenye jokofu wakati wote vinginevyo jokofu linaweza kuchukuliwa na kupewa mteja mwingine. (Kiwango cha chini ni sanduku zinazowezwa kujaza jokofu alilo nalo mara mbili).',
        '10. Mteja mwenye jokofu la kampuni ni lazima akuza bidhaa zetu kwa bei iliyopendekezwa.',
        '11. Chombo/Jokofu hili litakuwa chini ya uangalizi wa aliazimisha na endapo kutatokea upotevu au uharibifu wowote, mwazimishaji atawajibika kikamilifu kufidia hasara au uharibifu huo.',
        '12. Kampuni haitawajibika kwa namna yoyote ile kwa uharibifu au hasara inayoweza kutokea kutokana na matumizi ya Chombo/Jokofu hili kwa mwazimishaji au madai yoyote yatakayotokana na mtu mwingine yeyote.',
      ];

      doc.font('Helvetica').fontSize(9);
      clauses.forEach(text => write(text, { lineGap: 2 }));

      y += 4;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Kwania ya kampuni :', startX, y, { width: pageWidth / 2 - 10 });
      doc.text('Kwa niaba ya Mwazimishaji:', startX + pageWidth / 2 + 10, y, { width: pageWidth / 2 - 10 });
      y = doc.y + 8;
      doc.font('Helvetica').fontSize(9);
      doc.text('Jina Kamili: ................................................', startX, y, { width: pageWidth / 2 - 10 });
      doc.text('Jina Kamili: ................................................', startX + pageWidth / 2 + 10, y, { width: pageWidth / 2 - 10 });
      y = doc.y + 10;
      doc.text('Wadhifa: ....................................................', startX, y, { width: pageWidth / 2 - 10 });
      doc.text('Wadhifa: ....................................................', startX + pageWidth / 2 + 10, y, { width: pageWidth / 2 - 10 });
      y = doc.y + 10;
      doc.text('Sahihi: ......................................................', startX, y, { width: pageWidth / 2 - 10 });
      doc.text('Sahihi: ......................................................', startX + pageWidth / 2 + 10, y, { width: pageWidth / 2 - 10 });
      y = doc.y + 12;
      doc.text('Chombo/Jokofu limewekwa na ............................Sahihi............................Wadhifa...........', startX, y, { width: pageWidth });

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
        // Remove is_active filter to find all contracts, not just active ones
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

      // Debug: Check all contracts for this asset movement
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

      // Delete existing contracts from Backblaze before generating new one
      const existingContracts = await prisma.asset_movement_contracts.findMany({
        where: { asset_movement_id: assetMovementId },
      });

      console.log(
        `Found ${existingContracts.length} existing contracts for asset movement: ${assetMovementId}`
      );

      for (const contract of existingContracts) {
        if (contract.contract_url) {
          try {
            // Extract file key from Backblaze URL
            const urlParts = contract.contract_url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            console.log(`Attempting to delete from Backblaze: ${fileName}`);

            // Delete from Backblaze
            await deleteFile(fileName);
            console.log(`Successfully deleted from Backblaze: ${fileName}`);
          } catch (error) {
            console.error('Error deleting from Backblaze:', error);
          }
        }
      }

      // Delete existing contracts from database
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
