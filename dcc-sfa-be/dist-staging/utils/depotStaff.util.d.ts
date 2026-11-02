/**
 * @interface DepotStaffInfo
 * @description Resolved coordinator and supervisor information for a depot or salesperson
 */
export interface DepotStaffInfo {
    depotId: number | null;
    depotName: string;
    coordinatorName: string;
    supervisorName: string;
    coordinatorId: number | null;
    supervisorId: number | null;
}
/**
 * @interface ResolveStaffParams
 * @description Input parameters to resolve coordinator, supervisor, and depot
 */
export interface ResolveStaffParams {
    depotId?: number | null;
    depotName?: string | null;
    customerDepot?: any;
    salesperson?: any;
    salespersonId?: number | null;
}
/**
 * @interface DepotStaffLookup
 * @description Fast in-memory lookup interface for resolving staff per row
 */
export interface DepotStaffLookup {
    resolveStaff: (params: ResolveStaffParams) => DepotStaffInfo;
}
/**
 * @function getDepotStaffLookup
 * @description Fetches all active depots, users, and assignments into fast memory structures
 * @returns {Promise<DepotStaffLookup>} Fast lookup resolver
 */
export declare const getDepotStaffLookup: () => Promise<DepotStaffLookup>;
//# sourceMappingURL=depotStaff.util.d.ts.map