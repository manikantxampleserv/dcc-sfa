"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractGenerationService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const blackbaze_1 = require("../utils/blackbaze");
class ContractGenerationService {
    async generateCoolerIssuanceContract(assetMovementId) {
        const assetMovement = await prisma_client_1.default.asset_movements.findUnique({
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
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
            });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc
                .fontSize(20)
                .font('Helvetica-Bold')
                .text('COOLER ISSUANCE CONTRACT', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica');
            doc.text(`Contract Number: COOL-${assetMovement.id.toString().padStart(6, '0')}`);
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.text(`Movement Reference: AMV-${assetMovement.id.toString().padStart(5, '0')}`);
            doc.moveDown();
            doc.fontSize(14).font('Helvetica-Bold').text('PARTIES INVOLVED:');
            doc.moveDown();
            doc.fontSize(11).font('Helvetica');
            if (assetMovement.asset_movement_from_depot) {
                doc.text(`From: ${assetMovement.asset_movement_from_depot.name} (Depot)`);
            }
            else if (assetMovement.asset_movement_from_customer) {
                doc.text(`From: ${assetMovement.asset_movement_from_customer.name} (Customer)`);
            }
            if (assetMovement.asset_movement_to_depot) {
                doc.text(`To: ${assetMovement.asset_movement_to_depot.name} (Depot)`);
            }
            else if (assetMovement.asset_movement_to_customer) {
                doc.text(`To: ${assetMovement.asset_movement_to_customer.name} (Customer)`);
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
            doc.text(`Movement Date: ${new Date(assetMovement.movement_date).toLocaleDateString()}`);
            doc.text(`Performed By: ${assetMovement.asset_movements_performed_by?.name || 'N/A'}`);
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
            doc.text(`${assetMovement.asset_movements_performed_by?.name || 'N/A'}`, 50, currentY + 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, currentY + 45);
            const receivedBy = assetMovement.asset_movement_to_customer?.name ||
                assetMovement.asset_movement_to_depot?.name ||
                'N/A';
            doc.text('Received By:', 300, currentY);
            doc.text('_________________________', 300, currentY + 15);
            doc.text(receivedBy, 300, currentY + 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 300, currentY + 45);
            doc.end();
        });
    }
    async uploadContractToBackblaze(assetMovementId, contractBuffer) {
        const fileName = `contracts/cooler-contract-${assetMovementId}-${Date.now()}.pdf`;
        try {
            const fileUrl = await (0, blackbaze_1.uploadFile)(contractBuffer, fileName, 'application/pdf');
            console.log(`Contract uploaded to Backblaze: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            console.error('Error uploading contract to Backblaze:', error);
            throw new Error(`Failed to upload contract: ${error.message}`);
        }
    }
    async saveContractUrlToDatabase(assetMovementId, contractUrl) {
        const contractRecord = await prisma_client_1.default.asset_movement_contracts.create({
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
    async getContractByAssetMovementId(assetMovementId) {
        return await prisma_client_1.default.asset_movement_contracts.findFirst({
            where: {
                asset_movement_id: assetMovementId,
                // Remove is_active filter to find all contracts, not just active ones
            },
            orderBy: {
                createdate: 'desc',
            },
        });
    }
    async generateContractOnApproval(assetMovementId) {
        try {
            console.log(`Starting contract generation for asset movement: ${assetMovementId}`);
            // Debug: Check all contracts for this asset movement
            const allContracts = await prisma_client_1.default.asset_movement_contracts.findMany({
                where: { asset_movement_id: assetMovementId },
            });
            console.log(`All contracts in database for asset movement ${assetMovementId}:`, allContracts.map(c => ({
                id: c.id,
                contract_url: c.contract_url,
                is_active: c.is_active,
                createdate: c.createdate,
            })));
            // Delete existing contracts from Backblaze before generating new one
            const existingContracts = await prisma_client_1.default.asset_movement_contracts.findMany({
                where: { asset_movement_id: assetMovementId },
            });
            console.log(`Found ${existingContracts.length} existing contracts for asset movement: ${assetMovementId}`);
            for (const contract of existingContracts) {
                if (contract.contract_url) {
                    try {
                        // Extract file key from Backblaze URL
                        const urlParts = contract.contract_url.split('/');
                        const fileName = urlParts[urlParts.length - 1];
                        console.log(`Attempting to delete from Backblaze: ${fileName}`);
                        // Delete from Backblaze
                        await (0, blackbaze_1.deleteFile)(fileName);
                        console.log(`Successfully deleted from Backblaze: ${fileName}`);
                    }
                    catch (error) {
                        console.error('Error deleting from Backblaze:', error);
                    }
                }
            }
            // Delete existing contracts from database
            const deleteResult = await prisma_client_1.default.asset_movement_contracts.deleteMany({
                where: { asset_movement_id: assetMovementId },
            });
            console.log(`Deleted ${deleteResult.count} contracts from database for asset movement: ${assetMovementId}`);
            const contractBuffer = await this.generateCoolerIssuanceContract(assetMovementId);
            const contractUrl = await this.uploadContractToBackblaze(assetMovementId, contractBuffer);
            const contractRecord = await this.saveContractUrlToDatabase(assetMovementId, contractUrl);
            console.log(`Contract generated and uploaded for asset movement: ${assetMovementId}`);
            return contractRecord;
        }
        catch (error) {
            console.error('Error generating contract:', error);
            throw error;
        }
    }
}
exports.ContractGenerationService = ContractGenerationService;
//# sourceMappingURL=contractGeneration.service.js.map