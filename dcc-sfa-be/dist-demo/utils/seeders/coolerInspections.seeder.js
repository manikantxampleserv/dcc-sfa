"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCoolerInspections = seedCoolerInspections;
exports.clearCoolerInspections = clearCoolerInspections;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
function loadCoolerMasterData() {
    const jsonPath = path.join(__dirname, '../cooler-master-data.json');
    if (!fs.existsSync(jsonPath)) {
        logger_1.default.warn(`Cooler master data file not found at ${jsonPath}. Using empty array.`);
        return [];
    }
    try {
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const rawData = JSON.parse(fileContent);
        return rawData.filter(item => item.code &&
            item.code.toString().trim() !== '' &&
            item.customer_code &&
            item.customer_code.toString().trim() !== '');
    }
    catch (error) {
        logger_1.default.error('Error loading cooler master data:', error);
        return [];
    }
}
function excelDateToJSDate(excelDate) {
    if (!excelDate)
        return undefined;
    if (typeof excelDate === 'string') {
        const parsed = new Date(excelDate);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    if (typeof excelDate === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
        return isNaN(jsDate.getTime()) ? undefined : jsDate;
    }
    return undefined;
}
async function seedCoolerInspections() {
    const coolerData = loadCoolerMasterData();
    if (coolerData.length === 0) {
        logger_1.default.warn('No cooler data found. Skipping cooler inspection seeding.');
        return;
    }
    logger_1.default.info(`Loading ${coolerData.length} cooler inspections from master data...`);
    const coolers = await prisma_client_1.default.coolers.findMany({
        select: { id: true, code: true },
    });
    const coolerMap = new Map(coolers.map(cooler => [cooler.code, cooler.id]));
    const users = await prisma_client_1.default.users.findMany({
        select: { id: true },
        where: { is_active: 'Y' },
    });
    const userIds = users.map(user => user.id);
    const visits = await prisma_client_1.default.visits.findMany({
        select: { id: true },
        where: { is_active: 'Y' },
    });
    const visitIds = visits.map(visit => visit.id);
    if (coolers.length === 0) {
        logger_1.default.warn('No coolers found. Skipping cooler inspection seeding.');
        return;
    }
    if (userIds.length === 0) {
        logger_1.default.warn('No active users found. Skipping cooler inspection seeding.');
        return;
    }
    const BATCH_SIZE = 1000;
    const totalBatches = Math.ceil(coolerData.length / BATCH_SIZE);
    let successCount = 0;
    let skipCount = 0;
    for (let batch = 0; batch < totalBatches; batch++) {
        const startIndex = batch * BATCH_SIZE;
        const endIndex = Math.min(startIndex + BATCH_SIZE, coolerData.length);
        const batchData = coolerData.slice(startIndex, endIndex);
        const inspectionsToCreate = batchData
            .map(cooler => {
            const coolerId = cooler.code
                ? coolerMap.get(cooler.code.toString())
                : undefined;
            if (!coolerId) {
                return null;
            }
            const lastReadDate = cooler.last_scanned_date
                ? excelDateToJSDate(typeof cooler.last_scanned_date === 'string'
                    ? parseFloat(cooler.last_scanned_date)
                    : cooler.last_scanned_date)
                : undefined;
            if (!lastReadDate) {
                return null;
            }
            const isWorking = cooler.status?.toLowerCase() === 'active' &&
                cooler.is_active?.toLowerCase() !== 'yes'
                ? 'Y'
                : 'N';
            const randomInspectorId = userIds.length > 0
                ? userIds[Math.floor(Math.random() * userIds.length)]
                : undefined;
            const randomVisitId = visitIds.length > 0
                ? visitIds[Math.floor(Math.random() * visitIds.length)]
                : undefined;
            if (!randomInspectorId) {
                return null;
            }
            const inspectionData = {
                cooler_id: coolerId,
                inspected_by: randomInspectorId,
                inspection_date: lastReadDate,
                is_working: isWorking,
                action_required: isWorking === 'N' ? 'Y' : 'N',
                is_active: 'Y',
                createdate: new Date(),
                createdby: 1,
                log_inst: 1,
            };
            if (randomVisitId) {
                inspectionData.visit_id = randomVisitId;
            }
            if (cooler.status && cooler.status.toLowerCase() !== 'active') {
                inspectionData.issues = `Status: ${cooler.status}`;
            }
            return inspectionData;
        })
            .filter((inspection) => inspection !== null);
        try {
            for (const inspection of inspectionsToCreate) {
                try {
                    await prisma_client_1.default.cooler_inspections.create({
                        data: inspection,
                    });
                    successCount++;
                }
                catch (error) {
                    if (error?.code === 'P2002') {
                        skipCount++;
                    }
                    else {
                        logger_1.default.warn(`Failed to create cooler inspection for cooler ${inspection.cooler_id}: ${error.message}`);
                        skipCount++;
                    }
                }
            }
            if ((batch + 1) % 10 === 0 || batch === totalBatches - 1) {
                logger_1.default.info(`Batch ${batch + 1}/${totalBatches}: Created ${successCount}, Skipped ${skipCount}`);
            }
        }
        catch (error) {
            logger_1.default.warn(`Batch ${batch + 1}/${totalBatches} failed: ${error.message}`);
            skipCount += inspectionsToCreate.length;
        }
    }
    logger_1.default.success(`Cooler inspection seeding completed: ${successCount} created, ${skipCount} skipped`);
}
async function clearCoolerInspections() {
    try {
        await prisma_client_1.default.cooler_inspections.deleteMany({});
        logger_1.default.info('All cooler inspections cleared successfully');
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            logger_1.default.warn('⚠️  Could not clear all cooler inspections due to foreign key constraints. Some records may be in use.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=coolerInspections.seeder.js.map