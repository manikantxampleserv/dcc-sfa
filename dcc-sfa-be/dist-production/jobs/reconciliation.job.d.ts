/**
 * Reconciliation Cron Job
 *
 * Runs every day at 6:00 PM (18:00).
 *
 * Logic:
 *  1. Find all active users with 'Salesman' role
 *  2. For each salesman, check if they have loaded van inventory
 *     (inventory_stock with current_stock > 0 and is_active = 'Y')
 *  3. If they do, and no reconciliation exists for today:
 *     - Create a `reconciliation` record (header)
 *     - Create `reconciliation_items` for each unique product loaded
 *       with expected_qty = total current_stock for that product
 *  4. If reconciliation already exists for today, skip (idempotent)
 */
export declare function runReconciliationJob(): Promise<void>;
/**
 * Schedule the reconciliation cron at 6:00 PM daily.
 */
export declare const scheduleReconciliationJob: () => void;
//# sourceMappingURL=reconciliation.job.d.ts.map