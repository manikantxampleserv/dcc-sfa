"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    console.log(`Searching for assets created between ${tomorrow.toISOString()} and ${dayAfterTomorrow.toISOString()}`);
    const assetsToDelete = await prisma_client_1.default.asset_master.findMany({
        where: {
            createdate: {
                gte: tomorrow,
                lt: dayAfterTomorrow,
            },
        },
        select: {
            id: true,
            name: true,
            serial_number: true,
        },
    });
    console.log(`Found ${assetsToDelete.length} assets to delete.`);
    if (assetsToDelete.length > 0) {
        const deleteResult = await prisma_client_1.default.asset_master.deleteMany({
            where: {
                createdate: {
                    gte: tomorrow,
                    lt: dayAfterTomorrow,
                },
            },
        });
        console.log(`Successfully deleted ${deleteResult.count} assets.`);
    }
    else {
        console.log('No assets found to delete.');
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_client_1.default.$disconnect();
});
//# sourceMappingURL=delete-today-assets.js.map