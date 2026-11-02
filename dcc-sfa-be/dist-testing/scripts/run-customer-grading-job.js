"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customerCategoryAssignment_job_1 = require("../jobs/customerCategoryAssignment.job");
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    console.log('--- Triggering Customer Category Assignment Job ---');
    try {
        const results = await (0, customerCategoryAssignment_job_1.runCustomerCategoryAssignment)();
        console.log('Job finished successfully:', results);
    }
    catch (error) {
        console.error('Job execution failed:', error);
        process.exit(1);
    }
    finally {
        await prisma_client_1.default.$disconnect();
        process.exit(0);
    }
}
main();
//# sourceMappingURL=run-customer-grading-job.js.map