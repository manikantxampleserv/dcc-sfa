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
function getSystemInstruction() {
    if (cachedSystemInstruction) {
        return cachedSystemInstruction;
    }
    const parsedSchema = parsePrismaSchema() || FALLBACK_SCHEMA;
    cachedSystemInstruction = `
You are the DCC-SFA AI Assistant, an intelligent system built to help managers and operators query sales force automation (SFA) data from the Microsoft SQL Server database.
You have access to the database via read-only SQL SELECT queries.

Here is the database schema description of all tables:
${parsedSchema}

*Additional context on Sales Force Roles:*
- A salesperson/salesman/representative is a user with a role named 'Salesman', 'Sales Person', or 'Sales Representative' (role_key = 'salesman', 'sales_person', or 'sales_representative' in the roles table).

Guidelines for generating SQL queries:
- Return ONLY a JSON object in the following format:
  {
    "type": "sql",
    "query": "SELECT ...",
    "explanation": "Brief description of what this query will fetch"
  }
- Crucial: Only generate SELECT queries. Do not generate INSERT, UPDATE, DELETE, ALTER, DROP, or any other mutating query.
- Use Microsoft SQL Server (T-SQL) dialect. For example, use TOP N instead of LIMIT N for limiting rows (e.g. SELECT TOP 5 * FROM users).
- Use joins where necessary (e.g., join users with roles to filter by role_key = 'salesman').
- Handle active flags (e.g., is_active = 'Y').
- If the user's question does not require database access (e.g., greeting, general questions, or explaining a concept), return:
  {
    "type": "text",
    "text": "Your natural language response here."
  }
`;
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
            const text = response.response.text();
            const parsed = JSON.parse(text);
            if (parsed.type === 'text') {
                return { success: true, answer: parsed.text };
            }
            if (parsed.type === 'sql') {
                const sqlQuery = parsed.query;
                const upperQuery = sqlQuery.toUpperCase().trim();
                if (!upperQuery.startsWith('SELECT') &&
                    !upperQuery.startsWith('WITH')) {
                    return {
                        success: false,
                        answer: 'Security Block: Only read-only SELECT queries are allowed.',
                    };
                }
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
                const synthesisModel = this.genAI.getGenerativeModel({
                    model: 'gemini-flash-lite-latest',
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                    systemInstruction: "You are the DCC-SFA AI Assistant. You will be given a user's original question, the SQL query that was run, and the database result rows. Formulate a polite, clear, and concise natural language answer. Return a JSON object with: 'answer' (your natural language response text) and 'chart' (a chart configuration object if the user explicitly asked for a chart/graph/visualization, otherwise null). If the user explicitly asks for a chart/graph and does NOT ask for a table/list, do NOT include a markdown table in your 'answer' text (only provide a brief text explanation). If they ask for both, or if they did not ask for a chart, include the markdown table in your 'answer' text. The 'chart' object must have: 'type' ('bar'|'line'|'pie'|'doughnut'), 'label' (name of the metric), 'labels' (array of strings), and 'data' (array of numbers).",
                });
                const prompt = `${historyContext}User Question: "${question}"
SQL Query Executed: "${sqlQuery}"
Database Result: ${JSON.stringify(dbResult)}`;
                const synthesisResponse = await synthesisModel.generateContent(prompt);
                const finalResponseText = synthesisResponse.response.text();
                let answer = '';
                let chart = null;
                try {
                    const parsed = JSON.parse(finalResponseText);
                    answer = parsed.answer || '';
                    chart = parsed.chart || null;
                }
                catch (e) {
                    answer = finalResponseText;
                }
                return {
                    success: true,
                    answer,
                    sql: sqlQuery,
                    data: dbResult,
                    chart,
                };
            }
            return {
                success: false,
                answer: 'Sorry, I received an unrecognized response type from the AI model.',
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