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
exports.seedCoolers = seedCoolers;
exports.clearCoolers = clearCoolers;
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
async function seedCoolers() {
    const coolerData = loadCoolerMasterData();
    if (coolerData.length === 0) {
        logger_1.default.warn('No cooler data found. Skipping cooler seeding.');
        return;
    }
    logger_1.default.info(`Loading ${coolerData.length} coolers from master data...`);
    const customers = await prisma_client_1.default.customers.findMany({
        select: { id: true, code: true },
    });
    const customerMap = new Map(customers.map(customer => [customer.code, customer.id]));
    const coolerTypes = await prisma_client_1.default.cooler_types.findMany({
        select: { id: true, name: true },
    });
    const typeMap = new Map(coolerTypes.map(type => [type.name.toUpperCase(), type.id]));
    const coolerSubTypes = await prisma_client_1.default.cooler_sub_types.findMany({
        select: { id: true, name: true },
    });
    const subTypeMap = new Map(coolerSubTypes.map(subType => [subType.name.toUpperCase(), subType.id]));
    const users = await prisma_client_1.default.users.findMany({
        select: { id: true },
        where: { is_active: 'Y' },
    });
    const userIds = users.map(user => user.id);
    if (customers.length === 0) {
        logger_1.default.warn('No customers found. Skipping cooler seeding.');
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
        const coolersToCreate = batchData
            .map(cooler => {
            const customerId = cooler.customer_code
                ? customerMap.get(cooler.customer_code.toString())
                : undefined;
            if (!customerId) {
                return null;
            }
            const coolerTypeId = cooler.cooler_type
                ? typeMap.get(cooler.cooler_type.toUpperCase())
                : undefined;
            const coolerSubTypeId = cooler.cooler_sub_type
                ? subTypeMap.get(cooler.cooler_sub_type.toUpperCase())
                : undefined;
            const isActive = cooler.is_active?.toLowerCase() === 'no' ||
                cooler.status?.toLowerCase() === 'active'
                ? 'Y'
                : 'N';
            const status = cooler.status || 'working';
            const installDate = cooler.install_date
                ? excelDateToJSDate(typeof cooler.install_date === 'string'
                    ? parseFloat(cooler.install_date)
                    : cooler.install_date)
                : undefined;
            const lastScannedDate = cooler.last_scanned_date
                ? excelDateToJSDate(typeof cooler.last_scanned_date === 'string'
                    ? parseFloat(cooler.last_scanned_date)
                    : cooler.last_scanned_date)
                : undefined;
            const randomTechnicianId = userIds.length > 0
                ? userIds[Math.floor(Math.random() * userIds.length)]
                : undefined;
            const coolerDataToCreate = {
                customer_id: customerId,
                code: cooler.code.toString(),
                is_active: isActive,
                createdate: new Date(),
                createdby: 1,
                log_inst: 1,
            };
            if (cooler.brand) {
                coolerDataToCreate.brand = cooler.brand;
            }
            if (cooler.serial_number) {
                coolerDataToCreate.serial_number = cooler.serial_number.toString();
            }
            if (cooler.model) {
                coolerDataToCreate.model = cooler.model;
            }
            if (coolerTypeId) {
                coolerDataToCreate.cooler_type_id = coolerTypeId;
            }
            if (coolerSubTypeId) {
                coolerDataToCreate.cooler_sub_type_id = coolerSubTypeId;
            }
            if (status) {
                coolerDataToCreate.status = status;
            }
            if (installDate) {
                coolerDataToCreate.install_date = installDate;
            }
            if (lastScannedDate) {
                coolerDataToCreate.last_scanned_date = lastScannedDate;
            }
            if (randomTechnicianId) {
                coolerDataToCreate.technician_id = randomTechnicianId;
            }
            return coolerDataToCreate;
        })
            .filter((cooler) => cooler !== null);
        try {
            for (const cooler of coolersToCreate) {
                try {
                    const existing = await prisma_client_1.default.coolers.findUnique({
                        where: { code: cooler.code },
                    });
                    if (!existing) {
                        await prisma_client_1.default.coolers.create({
                            data: cooler,
                        });
                        successCount++;
                    }
                    else {
                        skipCount++;
                    }
                }
                catch (error) {
                    if (error?.code === 'P2002') {
                        skipCount++;
                    }
                    else {
                        logger_1.default.warn(`Failed to create cooler ${cooler.code}: ${error.message}`);
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
            skipCount += coolersToCreate.length;
        }
    }
    logger_1.default.success(`Cooler seeding completed: ${successCount} created, ${skipCount} skipped`);
}
async function clearCoolers() {
    try {
        await prisma_client_1.default.coolers.deleteMany({});
        logger_1.default.info('All coolers cleared successfully');
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            logger_1.default.warn('⚠️  Could not clear all coolers due to foreign key constraints. Some records may be in use.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=coolers.seeder.js.map