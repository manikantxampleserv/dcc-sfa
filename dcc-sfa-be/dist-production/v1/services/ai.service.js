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
exports.aiService = exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function parsePrismaSchema() {
    try {
        const possibleSchemaPaths = [
            path.resolve(process.cwd(), 'prisma/schema.prisma'),
            path.resolve(process.cwd(), 'dcc-sfa-be/prisma/schema.prisma'),
            path.resolve(__dirname, '../../prisma/schema.prisma'),
            path.resolve(__dirname, '../../../prisma/schema.prisma'),
            path.resolve(__dirname, '../../../../prisma/schema.prisma'),
        ];
        let schemaPath = '';
        for (const p of possibleSchemaPaths) {
            if (fs.existsSync(p)) {
                schemaPath = p;
                break;
            }
        }
        if (!schemaPath) {
            console.warn('WARNING: schema.prisma not found. Using fallback hardcoded schema.');
            return '';
        }
        const content = fs.readFileSync(schemaPath, 'utf-8');
        const lines = content.split(/\r?\n/);
        const models = {};
        const relationsList = [];
        let currentModelName = '';
        const PRISMA_TYPES = new Set([
            'String',
            'Int',
            'Decimal',
            'DateTime',
            'Boolean',
            'Float',
            'BigInt',
            'Json',
            'Bytes',
        ]);
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('model ')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 2) {
                    currentModelName = parts[1];
                    models[currentModelName] = [];
                }
            }
            else if (line === '}') {
                currentModelName = '';
            }
            else if (currentModelName &&
                line &&
                !line.startsWith('//') &&
                !line.startsWith('@@')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 2) {
                    const fieldName = parts[0];
                    const fieldType = parts[1];
                    const isOptional = fieldType.endsWith('?');
                    const cleanType = isOptional ? fieldType.slice(0, -1) : fieldType;
                    const lowerField = fieldName.toLowerCase();
                    if (lowerField.includes('password') ||
                        lowerField.includes('hash') ||
                        lowerField.includes('token') ||
                        lowerField.includes('salt')) {
                        continue;
                    }
                    if (PRISMA_TYPES.has(cleanType)) {
                        models[currentModelName].push(`${fieldName} (${cleanType}${isOptional ? '?' : ''})`);
                    }
                    else if (line.includes('@relation')) {
                        const referencedModel = fieldType.replace('[]', '');
                        const relationMatch = line.match(/fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/);
                        if (relationMatch) {
                            const fks = relationMatch[1].split(',').map(s => s.trim());
                            const pks = relationMatch[2].split(',').map(s => s.trim());
                            for (let i = 0; i < fks.length; i++) {
                                relationsList.push(`- ${currentModelName}.${fks[i]} references ${referencedModel}.${pks[i]}`);
                            }
                        }
                    }
                }
            }
        }
        let schemaStr = '### Database Tables:\n';
        for (const [modelName, fields] of Object.entries(models)) {
            if (fields.length > 0) {
                schemaStr += `- ${modelName}: ${fields.join(', ')}.\n`;
            }
        }
        if (relationsList.length > 0) {
            schemaStr += '\n### Table Relationships (Foreign Keys for JOINs):\n';
            schemaStr += relationsList.join('\n') + '\n';
        }
        return schemaStr;
    }
    catch (error) {
        console.error('Error parsing Prisma schema:', error);
        return '';
    }
}
const FALLBACK_SCHEMA = `
### Database Tables:
- users: id (Int), email (String), name (String), role_id (Int), is_active (String 'Y'/'N'), parent_id (Int), zone_id (Int), depot_id (Int).
  *Note: A salesperson/salesman/representative is a user with a role named 'Salesman', 'Sales Person', or 'Sales Representative' (role_key = 'salesman', 'sales_person', or 'sales_representative' in the roles table).*
- roles: id (Int), name (String), role_key (String, e.g., 'salesman', 'sales_person', 'admin', 'manager', 'sales_manager', 'sales_representative').
- customers: id (Int), name (String), code (String), is_active (String 'Y'/'N'), depot_id (Int), zone_id (Int), salesperson_id (Int, references users.id).
- orders: id (Int), order_number (String), salesperson_id (Int, references users.id), customer_id (Int, references customers.id), total_amount (Decimal), status (String, e.g., 'pending', 'approved', 'rejected'), createdate (DateTime).
- products: id (Int), name (String), code (String), is_active (String 'Y'/'N').
- depots: id (Int), name (String), code (String), is_active (String 'Y'/'N').
- visits: id (Int), sales_person_id (Int, references users.id), customer_id (Int, references customers.id), visit_date (DateTime), status (String).
- audit_logs: id (Int), table_name (String, e.g., 'depots', 'users', 'customers'), record_id (Int), action (String, 'CREATE'/'UPDATE'/'DELETE'), changed_data (String, JSON of changes), changed_by (Int, references users.id), changed_at (DateTime), is_active (String 'Y'/'N').
`;
let cachedSystemInstruction = '';
let lastCacheTime = 0;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
function getSystemInstruction() {
    const now = Date.now();
    if (cachedSystemInstruction && now - lastCacheTime < ONE_DAY_MS) {
        return cachedSystemInstruction;
    }
    const parsedSchema = parsePrismaSchema() || FALLBACK_SCHEMA;
    cachedSystemInstruction = `
You are the DCC-SFA AI Assistant, an intelligent system built to help managers and operators query sales force automation (SFA) data from the Microsoft SQL Server database.
You have access to the database via read-only SQL SELECT queries.

Here is the database schema description of all tables:
${parsedSchema}

*Domain Vocabulary & Context:*
- "Outlets" or "Customers" always refer to the 'customers' table.
- "Assets" refer to the 'asset_master' table.
- "Cooler Installations" refer to the 'coolers' table. Note that coolers are a specific type of asset linked to the 'asset_master' table.
- "Depots" refer to the 'depots' table. Ignore the 'warehouses' table.
- "Stock" or "inventory" quantities (current stock) are ALWAYS found in the 'inventory_stock' table, which is the single source of truth and pieces refere base_quantity of product.
- To find a Salesperson's "Van Stock" or "Van Inventory", DO NOT look for quantity columns in the 'van_inventory' table. Instead, find the salesperson's location_id(s) from the 'van_inventory' table (where user_id = salesperson), and then query the 'inventory_stock' table for those location_ids to get their current_stock.

- A "salesperson", "salesman", or "representative" is a user with a role_key of 'salesman', 'sales_person', 'salesperson' or 'sales_representative' in the 'roles' table.
Guidelines for generating SQL queries:
- Return ONLY a JSON object in the following format:
  {
    "type": "sql",
    "query": "SELECT ...",
    "explanation": "Brief description of what this query will fetch"
  }
- Crucial: Only generate SELECT queries. Do not generate INSERT, UPDATE, DELETE, ALTER, DROP, or any other mutating query.
- Use Microsoft SQL Server (T-SQL) dialect. DO NOT artificially limit rows using TOP N (e.g. SELECT TOP 10) unless the user specifically asks for a limit. Always return the full complete list of all matching records.
- Use joins where necessary (e.g., join users with roles to filter by role_key = 'salesman'). CRUCIAL: ALWAYS JOIN related tables to display human-readable names instead of raw database IDs (e.g., join the customers/outlets table to show the actual outlet name instead of just outputting location_id or customer_id).
- Handle active flags (e.g., is_active = 'Y').
- NEVER use COUNT(*), SUM(), or AVG() unless the user explicitly types the exact words 'how many', 'count', 'sum', or 'average'. 
- If the user types 'total' (e.g. 'give me total outlets'), they mean 'give me the full list of all outlets'. You MUST return the actual rows. Do NOT aggregate the data into a single number!
- When selecting rows for a list, select ONLY the absolute most basic columns: id, name, code, and status (if applicable). DO NOT select address, phone_number, email, or any other detailed columns.
- If the user's question does not require database access (e.g., greeting, general questions, or explaining a concept), return:
  {
    "type": "text",
    "text": "Your natural language response here. (IMPORTANT: You are a female assistant. If someone questions you in Hindi language, then reply in Hinglish using female conjugations. For example: 'Haan, main aapki madad kar sakti hoon.' DO NOT say 'sakta hoon'.)"
  }
`;
    lastCacheTime = now;
    return cachedSystemInstruction;
}
class AIService {
    genAI = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        else {
            console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
        }
    }
    async query(question, history) {
        const startTime = Date.now();
        let promptTokens = 0;
        let completionTokens = 0;
        let totalTokens = 0;
        if (!this.genAI && process.env.GEMINI_API_KEY) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        if (!this.genAI) {
            return {
                success: false,
                answer: 'Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in the backend .env file.',
            };
        }
        let historyContext = '';
        if (history && history.length > 0) {
            historyContext =
                'Conversation history so far:\n' +
                    history
                        .map(h => `${h.sender === 'user' ? 'User' : 'AI Assistant'}: ${h.text}${h.sql ? `\n[Executed SQL: ${h.sql}]` : ''}`)
                        .join('\n\n') +
                    '\n\n';
        }
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-flash-lite-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                },
                systemInstruction: getSystemInstruction(),
            });
            const response = await model.generateContent(historyContext + question);
            if (response.response.usageMetadata) {
                promptTokens += response.response.usageMetadata.promptTokenCount || 0;
                completionTokens +=
                    response.response.usageMetadata.candidatesTokenCount || 0;
                totalTokens += response.response.usageMetadata.totalTokenCount || 0;
            }
            const text = response.response.text();
            const parsed = JSON.parse(text);
            const isTextResponse = parsed.type === 'text' ||
                (!parsed.query && (parsed.text || parsed.answer));
            if (isTextResponse) {
                return {
                    success: true,
                    answer: parsed.text || parsed.answer || 'Response generated.',
                    latencyMs: Date.now() - startTime,
                    usage: { promptTokens, completionTokens, totalTokens },
                };
            }
            let queriesToRun = [];
            if (Array.isArray(parsed)) {
                queriesToRun = parsed
                    .filter(p => p.type === 'sql' || p.query)
                    .map(p => p.query);
            }
            else if (parsed.type === 'sql' || parsed.query) {
                queriesToRun = [parsed.query];
            }
            if (queriesToRun.length > 0) {
                const dbResults = [];
                const forbiddenKeywords = [
                    'INSERT',
                    'UPDATE',
                    'DELETE',
                    'DROP',
                    'ALTER',
                    'CREATE',
                    'TRUNCATE',
                    'RENAME',
                    'GRANT',
                    'REVOKE',
                    'EXEC',
                    'EXECUTE',
                    'MERGE',
                    'REPLACE',
                    'INTO',
                    'SHUTDOWN',
                ];
                for (const sqlQuery of queriesToRun) {
                    const upperQuery = sqlQuery.toUpperCase().trim();
                    if (!upperQuery.startsWith('SELECT') &&
                        !upperQuery.startsWith('WITH')) {
                        return {
                            success: false,
                            answer: 'Security Block: Only read-only SELECT queries are allowed.',
                        };
                    }
                    for (const word of forbiddenKeywords) {
                        const regex = new RegExp(`\\b${word}\\b`, 'i');
                        if (regex.test(sqlQuery)) {
                            return {
                                success: false,
                                answer: `Security Block: Prohibited database operation detected (${word}).`,
                            };
                        }
                    }
                    const dbResult = await prisma_client_1.default.$queryRawUnsafe(sqlQuery);
                    const scrubbedResult = dbResult.map(row => {
                        if (!row || typeof row !== 'object')
                            return row;
                        const newRow = { ...row };
                        for (const key of Object.keys(newRow)) {
                            if (/password|hash|salt|secret/i.test(key)) {
                                newRow[key] = '[REDACTED]';
                            }
                        }
                        return newRow;
                    });
                    dbResults.push(scrubbedResult);
                }
                const synthesisModel = this.genAI.getGenerativeModel({
                    model: 'gemini-flash-lite-latest',
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                    systemInstruction: "You are the DCC-SFA AI Assistant. You are a female assistant. You will be given a user's original question, the SQL queries that were run, and the database result rows. Formulate a polite, clear, and concise natural language answer.\n\nCRITICAL LANGUAGE RULE:\n- If the user's question is entirely in English (e.g., 'what is needed for product creation?', 'show invoices'), you MUST reply ENTIRELY in English.\n- ONLY reply in Hinglish if the user's question contains actual Hindi/Hinglish words (e.g., 'invoices dikhao', 'kya haal hai'). When replying in Hinglish, ALWAYS use female verb conjugations (e.g., 'sakti hoon', 'dikha rahi hoon').\n\nReturn a JSON object with: 'answer' (your response text), and 'chart' (a chart configuration object, or an array of chart configuration objects if the user asked for a dashboard/multiple charts/visualizations, or null if no chart is needed). ONLY generate a chart if the user explicitly types the words 'chart', 'graph', 'plot', or 'dashboard' in their prompt. Otherwise, you MUST set 'chart' to null. Each chart object must have: 'type' ('bar'|'line'|'pie'|'doughnut'), 'label' (name of the metric), 'labels' (array of strings), and 'data' (array of numbers). DO NOT include markdown tables in your answer. VERY IMPORTANT: Do NOT list or repeat the database records in your 'answer' text! A visual table is automatically rendered for the user. Your 'answer' should just be a 1-sentence summary (e.g. 'Here are the results:' or 'Ye lijiye aapke results:').",
                });
                const prompt = `${historyContext} User Question: "${question}"
SQL Queries Executed: ${JSON.stringify(queriesToRun)}
Database Results: ${JSON.stringify(dbResults)}`;
                const synthesisResponse = await synthesisModel.generateContent(prompt);
                if (synthesisResponse.response.usageMetadata) {
                    promptTokens +=
                        synthesisResponse.response.usageMetadata.promptTokenCount || 0;
                    completionTokens +=
                        synthesisResponse.response.usageMetadata.candidatesTokenCount || 0;
                    totalTokens +=
                        synthesisResponse.response.usageMetadata.totalTokenCount || 0;
                }
                const finalResponseText = synthesisResponse.response.text();
                let answer = '';
                let chart = null;
                try {
                    const parsed = JSON.parse(finalResponseText);
                    answer = parsed.answer || '';
                    chart = parsed.chart || parsed.charts || null;
                }
                catch (e) {
                    answer = finalResponseText;
                }
                let autoTable = undefined;
                if (dbResults.length > 0 &&
                    Array.isArray(dbResults[0]) &&
                    dbResults[0].length > 0) {
                    const resultSet = dbResults[0];
                    if (typeof resultSet[0] === 'object' && resultSet[0] !== null) {
                        const dbKeys = Object.keys(resultSet[0]);
                        const headers = dbKeys.map(k => {
                            if (!k || k.trim() === '')
                                return 'Result';
                            return k
                                .split('_')
                                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                .join(' ');
                        });
                        const rows = resultSet.map((row) => dbKeys.map((h) => {
                            const val = row[h];
                            if (val === null || val === undefined || val === '')
                                return '-';
                            if (val instanceof Date) {
                                return val.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });
                            }
                            if (typeof val === 'string' &&
                                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                                const d = new Date(val);
                                if (!isNaN(d.getTime())) {
                                    return d.toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                }
                            }
                            if (typeof val === 'object' && val !== null) {
                                if (typeof val.toNumber === 'function') {
                                    return String(val);
                                }
                                const stringified = JSON.stringify(val);
                                if (stringified &&
                                    stringified.startsWith('"') &&
                                    stringified.endsWith('"') &&
                                    !stringified.includes('{') &&
                                    !stringified.includes('[')) {
                                    return stringified.slice(1, -1);
                                }
                                return stringified;
                            }
                            const strVal = String(val);
                            return strVal.trim() === '' ? '-' : strVal;
                        }));
                        autoTable = { headers, rows };
                    }
                }
                return {
                    success: true,
                    answer,
                    sql: queriesToRun.join(';\n\n'),
                    chart,
                    table: autoTable,
                    latencyMs: Date.now() - startTime,
                    usage: { promptTokens, completionTokens, totalTokens },
                };
            }
            return {
                success: false,
                answer: `Sorry, I received an unrecognized response type from the AI model. Output: ${JSON.stringify(parsed)}`,
            };
        }
        catch (error) {
            console.error('AI Service Error:', error);
            return {
                success: false,
                answer: `An error occurred while processing your request: ${error.message || error}`,
            };
        }
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map