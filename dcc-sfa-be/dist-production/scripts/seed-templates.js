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
async function main() {
    const model = 'sfa_d_templates';
    const filePath = path.join(__dirname, '../utils/seeders/data/sfa_d_templates.json');
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (data.length === 0) {
        console.log('No templates to seed.');
        return;
    }
    console.log(`Seeding ${model}... (${data.length} records)`);
    const formattedData = data.map((item) => {
        const formatted = { ...item };
        for (const [key, value] of Object.entries(formatted)) {
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                formatted[key] = new Date(value);
            }
        }
        return formatted;
    });
    try {
        const hasIdentity = await prisma_client_1.default.$queryRawUnsafe(`SELECT 1 as has_ident FROM sys.identity_columns WHERE OBJECT_NAME(object_id) = '${model}'`);
        const isIdentity = hasIdentity.length > 0;
        let sqlBatch = '';
        if (isIdentity) {
            sqlBatch += `SET IDENTITY_INSERT ${model} ON;\n`;
        }
        const columns = Object.keys(formattedData[0]);
        const escapedColumns = columns.map(col => `[${col}]`);
        for (const row of formattedData) {
            const values = columns.map(col => {
                const val = row[col];
                if (val === null || val === undefined)
                    return 'NULL';
                if (val instanceof Date)
                    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                if (typeof val === 'string')
                    return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === 'boolean')
                    return val ? 1 : 0;
                return val;
            });
            sqlBatch += `INSERT INTO [${model}] (${escapedColumns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        if (isIdentity) {
            sqlBatch += `SET IDENTITY_INSERT ${model} OFF;\n`;
        }
        try {
            await prisma_client_1.default.$executeRawUnsafe(sqlBatch);
            console.log(`Successfully seeded ${model}`);
        }
        catch (insertErr) {
            if (!insertErr.message.includes('Violation of PRIMARY KEY constraint')) {
                throw insertErr;
            }
            else {
                console.log(`Skipped ${model} (Already exists / PK Violation)`);
            }
        }
    }
    catch (e) {
        console.error(`Error seeding ${model}:`, e.message);
    }
}
main().finally(() => prisma_client_1.default.$disconnect());
//# sourceMappingURL=seed-templates.js.map