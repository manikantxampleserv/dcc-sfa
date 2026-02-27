import PDFDocument from 'pdfkit';
import prisma from '../configs/prisma.client';
import { uploadFile } from '../utils/blackbaze';

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
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('COOLER ISSUANCE CONTRACT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).font('Helvetica');
      doc.text(
        `Contract Number: COOL-${assetMovement.id.toString().padStart(6, '0')}`
      );
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(
        `Movement Reference: AMV-${assetMovement.id.toString().padStart(5, '0')}`
      );
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('PARTIES INVOLVED:');
      doc.moveDown();

      doc.fontSize(11).font('Helvetica');

      if (assetMovement.asset_movement_from_depot) {
        doc.text(
          `From: ${assetMovement.asset_movement_from_depot.name} (Depot)`
        );
      } else if (assetMovement.asset_movement_from_customer) {
        doc.text(
          `From: ${assetMovement.asset_movement_from_customer.name} (Customer)`
        );
      }

      if (assetMovement.asset_movement_to_depot) {
        doc.text(`To: ${assetMovement.asset_movement_to_depot.name} (Depot)`);
      } else if (assetMovement.asset_movement_to_customer) {
        doc.text(
          `To: ${assetMovement.asset_movement_to_customer.name} (Customer)`
        );
      }

      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('ASSETS DETAILS:');
      doc.moveDown();

      doc.fontSize(11).font('Helvetica');
      assetMovement.asset_movement_assets.forEach((assetAsset, index) => {
        const asset = assetAsset.asset_movement_assets_asset;
        doc.text(`${index + 1}. ${asset.name}`);
        doc.text(`   Serial Number: ${asset.serial_number}`);
        doc.text(`   Type: ${asset.asset_master_asset_types?.name || 'N/A'}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('MOVEMENT DETAILS:');
      doc.moveDown();

      doc.fontSize(11).font('Helvetica');
      doc.text(`Movement Type: ${assetMovement.movement_type}`);
      doc.text(
        `Movement Date: ${new Date(assetMovement.movement_date).toLocaleDateString()}`
      );
      doc.text(
        `Performed By: ${assetMovement.asset_movements_performed_by?.name || 'N/A'}`
      );

      if (assetMovement.notes) {
        doc.text(`Notes: ${assetMovement.notes}`);
      }

      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('TERMS AND CONDITIONS:');
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      const terms = [
        '1. The cooler(s) listed above are issued on the basis of this contract.',
        '2. The recipient is responsible for the proper maintenance and security of the cooler(s).',
        '3. Any damage to the cooler(s) must be reported immediately.',
        '4. The cooler(s) must be returned in the same condition as received.',
        '5. This contract is valid until the cooler(s) are officially returned.',
      ];

      terms.forEach(term => {
        doc.text(term);
        doc.moveDown(0.3);
      });

      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold').text('SIGNATURES:');
      doc.moveDown();

      doc.fontSize(11).font('Helvetica');
      const currentY = doc.y;
      doc.text('Issued By:', 50, currentY);
      doc.text('_________________________', 50, currentY + 15);
      doc.text(
        `${assetMovement.asset_movements_performed_by?.name || 'N/A'}`,
        50,
        currentY + 30
      );
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, currentY + 45);

      const receivedBy =
        assetMovement.asset_movement_to_customer?.name ||
        assetMovement.asset_movement_to_depot?.name ||
        'N/A';
      doc.text('Received By:', 300, currentY);
      doc.text('_________________________', 300, currentY + 15);
      doc.text(receivedBy, 300, currentY + 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 300, currentY + 45);

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
        is_active: 'Y',
      },
      orderBy: {
        createdate: 'desc',
      },
    });
  }

  async generateContractOnApproval(assetMovementId: number): Promise<any> {
    try {
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
