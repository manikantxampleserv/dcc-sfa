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
exports.seedCustomers = seedCustomers;
exports.clearCustomers = clearCustomers;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../../configs/logger"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
function loadOutletMasterData() {
    const jsonPath = path.join(__dirname, '../outlet-master-data.json');
    if (!fs.existsSync(jsonPath)) {
        logger_1.default.warn(`Outlet master data file not found at ${jsonPath}. Using empty array.`);
        return [];
    }
    try {
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const rawData = JSON.parse(fileContent);
        return rawData.filter(item => item.code &&
            item.name &&
            item.code.trim() !== '' &&
            item.name.trim() !== '');
    }
    catch (error) {
        logger_1.default.error('Error loading outlet master data:', error);
        return [];
    }
}
async function seedCustomers() {
    const outletData = loadOutletMasterData();
    if (outletData.length === 0) {
        logger_1.default.warn('No outlet data found. Skipping customer seeding.');
        return;
    }
    logger_1.default.info(`Loading ${outletData.length} outlets from master data...`);
    const customerTypes = await prisma_client_1.default.customer_type.findMany({
        select: { id: true, type_name: true },
    });
    const typeMap = new Map(customerTypes.map(type => [type.type_name, type.id]));
    const customerChannels = await prisma_client_1.default.customer_channel.findMany({
        select: { id: true, channel_name: true },
    });
    const channelMap = new Map(customerChannels.map(channel => [channel.channel_name, channel.id]));
    const customerCategories = await prisma_client_1.default.customer_category.findMany({
        select: { id: true },
        where: { is_active: 'Y' },
    });
    const categoryIds = customerCategories.map(category => category.id);
    const availableZones = await prisma_client_1.default.zones.findMany({
        select: { id: true },
        where: { is_active: 'Y' },
    });
    if (availableZones.length === 0) {
        logger_1.default.warn('No active zones found. Skipping customer seeding.');
        return;
    }
    const zoneIds = availableZones.map(zone => zone.id);
    const BATCH_SIZE = 1000;
    const totalBatches = Math.ceil(outletData.length / BATCH_SIZE);
    let successCount = 0;
    let skipCount = 0;
    for (let batch = 0; batch < totalBatches; batch++) {
        const startIndex = batch * BATCH_SIZE;
        const endIndex = Math.min(startIndex + BATCH_SIZE, outletData.length);
        const batchData = outletData.slice(startIndex, endIndex);
        const customersToCreate = batchData
            .map(outlet => {
            const customerTypeId = outlet.outlet_type
                ? typeMap.get(outlet.outlet_type)
                : undefined;
            const customerChannelId = outlet.outlet_channel
                ? channelMap.get(outlet.outlet_channel)
                : undefined;
            const isActive = outlet.status?.toLowerCase() === 'active' ? 'Y' : 'N';
            const gpsStatus = outlet.gps_status || 'Not Available';
            const randomZoneId = zoneIds.length > 0
                ? zoneIds[Math.floor(Math.random() * zoneIds.length)]
                : undefined;
            const randomCategoryId = categoryIds.length > 0
                ? categoryIds[Math.floor(Math.random() * categoryIds.length)]
                : undefined;
            const customerData = {
                code: outlet.code,
                name: outlet.name,
                is_active: isActive,
                createdate: new Date(),
                createdby: 1,
                log_inst: 1,
            };
            if (outlet.short_name) {
                customerData.short_name = outlet.short_name;
            }
            if (outlet.internal_code_one) {
                customerData.internal_code_one = outlet.internal_code_one;
            }
            if (outlet.internal_code_two) {
                customerData.internal_code_two = outlet.internal_code_two;
            }
            if (outlet.contact_person) {
                customerData.contact_person = outlet.contact_person;
            }
            if (customerTypeId) {
                customerData.customer_type_id = customerTypeId;
            }
            if (customerChannelId) {
                customerData.customer_channel_id = customerChannelId;
            }
            if (gpsStatus) {
                customerData.gps_status = gpsStatus;
            }
            if (randomZoneId) {
                customerData.zones_id = randomZoneId;
            }
            if (randomCategoryId) {
                customerData.customer_category_id = randomCategoryId;
            }
            return customerData;
        })
            .filter(customer => customer.code && customer.name);
        try {
            for (const customer of customersToCreate) {
                try {
                    const existing = await prisma_client_1.default.customers.findUnique({
                        where: { code: customer.code },
                    });
                    if (!existing) {
                        await prisma_client_1.default.customers.create({
                            data: customer,
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
                        logger_1.default.warn(`Failed to create customer ${customer.code}: ${error.message}`);
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
            skipCount += customersToCreate.length;
        }
    }
    logger_1.default.success(`Customer seeding completed: ${successCount} created, ${skipCount} skipped`);
}
async function clearCustomers() {
    try {
        await prisma_client_1.default.customers.deleteMany({});
        logger_1.default.info('All customers cleared successfully');
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            logger_1.default.warn('⚠️  Could not clear all customers due to foreign key constraints. Some records may be in use.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=customers.seeder.js.map