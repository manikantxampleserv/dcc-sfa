"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    const r = await prisma_client_1.default.reconciliation.findMany({});
    console.log(JSON.stringify(r, null, 2));
    await prisma_client_1.default.$disconnect();
}
main().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=check_reconciliations.js.map