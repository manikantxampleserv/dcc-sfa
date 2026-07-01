"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    const items = await prisma_client_1.default.reconciliation_items.deleteMany({});
    console.log('Deleted reconciliation_items:', items.count);
    const recs = await prisma_client_1.default.reconciliation.deleteMany({});
    console.log('Deleted reconciliations:', recs.count);
    console.log('Done!');
    await prisma_client_1.default.$disconnect();
}
main().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=clear_reconciliation.js.map