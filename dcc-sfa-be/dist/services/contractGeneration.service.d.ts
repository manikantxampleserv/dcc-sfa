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
export declare class ContractGenerationService {
    generateCoolerIssuanceContract(assetMovementId: number): Promise<Buffer>;
    uploadContractToBackblaze(assetMovementId: number, contractBuffer: Buffer): Promise<string>;
    saveContractUrlToDatabase(assetMovementId: number, contractUrl: string): Promise<any>;
    getContractByAssetMovementId(assetMovementId: number): Promise<any>;
    generateContractOnApproval(assetMovementId: number): Promise<any>;
}
//# sourceMappingURL=contractGeneration.service.d.ts.map