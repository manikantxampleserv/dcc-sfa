/**
 * @fileoverview Email Templates Seeder
 * @description Creates email templates for request actions, approvals, and alerts
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockTemplate {
    name: string;
    key: string;
    channel?: string | null;
    type?: string | null;
    subject: string;
    body: string;
    createdate?: string | Date;
    createdby?: number;
    updatedate?: string | Date | null;
    updatedby?: number | null;
}
declare const mockTemplates: MockTemplate[];
/**
 * Seed Email Templates with mock data
 */
export declare function seedEmailTemplates(): Promise<void>;
/**
 * Clear Email Templates data
 */
export declare function clearEmailTemplates(): Promise<void>;
export { mockTemplates };
//# sourceMappingURL=emailTemplates.seeder.d.ts.map