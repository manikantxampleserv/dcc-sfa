"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    const q1 = await prisma_client_1.default.reconciliation.findMany({
        where: { is_active: 'Y' }
    });
    console.log("No date filter count:", q1.length);
    const d = new Date('2026-06-26');
    console.log("Date object:", d);
    const q2 = await prisma_client_1.default.reconciliation.findMany({
        where: { is_active: 'Y', reconciliation_date: d }
    });
    console.log("With date filter count:", q2.length);
    await prisma_client_1.default.$disconnect();
}
main().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=check_reconciliation_filter.js.map