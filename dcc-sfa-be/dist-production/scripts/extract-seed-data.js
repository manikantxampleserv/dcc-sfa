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
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const models = [
    'asset_master', 'asset_types', 'batch_lots', 'brands', 'companies',
    'cooler_inspections', 'coolers', 'cooler_sub_types', 'cooler_types',
    'currencies', 'customer_category', 'customer_channel', 'customers',
    'customer_type', 'depots', 'email_templates', 'kpi_targets', 'orders',
    'outlet_groups', 'permissions', 'pricelists', 'product_categories',
    'product_flavours', 'products', 'product_shelf_life', 'product_sub_categories',
    'product_target_groups', 'product_types', 'product_volumes', 'product_web_orders',
    'roles', 'routes', 'route_type', 'sales_bonus_rules', 'sales_target_groups',
    'sales_targets', 'survey_templates', 'tax_master', 'unit_of_measurement',
    'users', 'vehicles', 'visits', 'warehouses', 'zones'
];
const largeTables = ['customers', 'coolers', 'asset_master', 'batch_lots', 'visits', 'stock_movements', 'invoices'];
async function main() {
    const dataDir = path.join(__dirname, '../utils/seeders/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    for (const model of models) {
        try {
            if (prisma_client_1.default[model]) {
                console.log(`Extracting ${model}...`);
                // Take 10 for massive tables, otherwise take 1000 (which gets all master data)
                const takeCount = largeTables.includes(model) ? 10 : 1000;
                const data = await prisma_client_1.default[model].findMany({
                    take: takeCount
                });
                fs.writeFileSync(path.join(dataDir, `${model}.json`), JSON.stringify(data, null, 2));
                console.log(`Successfully extracted ${data.length} records for ${model}`);
            }
            else {
                console.warn(`Model ${model} not found on Prisma Client.`);
            }
        }
        catch (e) {
            console.error(`Error extracting ${model}:`, e);
        }
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
//# sourceMappingURL=extract-seed-data.js.map