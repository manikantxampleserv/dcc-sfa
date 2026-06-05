import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../configs/prisma.client';
import * as fs from 'fs';
import * as path from 'path';

function parsePrismaSchema(): string {
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
      console.warn(
        'WARNING: schema.prisma not found. Using fallback hardcoded schema.'
      );
      return '';
    }

    const content = fs.readFileSync(schemaPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const models: { [modelName: string]: string[] } = {};
    const relationsList: string[] = [];
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
      } else if (line === '}') {
        currentModelName = '';
      } else if (
        currentModelName &&
        line &&
        !line.startsWith('//') &&
        !line.startsWith('@@')
      ) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1];
          const isOptional = fieldType.endsWith('?');
          const cleanType = isOptional ? fieldType.slice(0, -1) : fieldType;

          const lowerField = fieldName.toLowerCase();
          if (
            lowerField.includes('password') ||
            lowerField.includes('hash') ||
            lowerField.includes('token') ||
            lowerField.includes('salt')
          ) {
            continue;
          }

          if (PRISMA_TYPES.has(cleanType)) {
            models[currentModelName].push(
              `${fieldName} (${cleanType}${isOptional ? '?' : ''})`
            );
          } else if (line.includes('@relation')) {
            const referencedModel = fieldType.replace('[]', '');
            const relationMatch = line.match(
              /fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/
            );
            if (relationMatch) {
              const fks = relationMatch[1].split(',').map(s => s.trim());
              const pks = relationMatch[2].split(',').map(s => s.trim());
              for (let i = 0; i < fks.length; i++) {
                relationsList.push(
                  `- ${currentModelName}.${fks[i]} references ${referencedModel}.${pks[i]}`
                );
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
  } catch (error) {
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

function getSystemInstruction(): string {
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

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn(
        'WARNING: GEMINI_API_KEY is not defined in environment variables.'
      );
    }
  }

  async query(
    question: string,
    history?: { sender: 'user' | 'assistant'; text: string; sql?: string }[]
  ): Promise<{
    success: boolean;
    answer: string;
    sql?: string;
    data?: any;
    chart?: any;
    charts?: any[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    latencyMs?: number;
  }> {
    const startTime = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    if (!this.genAI && process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    if (!this.genAI) {
      return {
        success: false,
        answer:
          'Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in the backend .env file.',
      };
    }

    let historyContext = '';
    if (history && history.length > 0) {
      historyContext =
        'Conversation history so far:\n' +
        history
          .map(
            h =>
              `${h.sender === 'user' ? 'User' : 'AI Assistant'}: ${h.text}${h.sql ? `\n[Executed SQL: ${h.sql}]` : ''}`
          )
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

      if (parsed.type === 'text') {
        return {
          success: true,
          answer: parsed.text,
          latencyMs: Date.now() - startTime,
          usage: { promptTokens, completionTokens, totalTokens },
        };
      }

      if (parsed.type === 'sql') {
        const sqlQuery = parsed.query;
        const upperQuery = sqlQuery.toUpperCase().trim();

        if (
          !upperQuery.startsWith('SELECT') &&
          !upperQuery.startsWith('WITH')
        ) {
          return {
            success: false,
            answer:
              'Security Block: Only read-only SELECT queries are allowed.',
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

        const dbResult: any[] = await prisma.$queryRawUnsafe(sqlQuery);

        const scrubbedResult = dbResult.map(row => {
          if (!row || typeof row !== 'object') return row;
          const newRow = { ...row };
          for (const key of Object.keys(newRow)) {
            if (/password|hash|salt|secret/i.test(key)) {
              newRow[key] = '[REDACTED]';
            }
          }
          return newRow;
        });

        const synthesisModel = this.genAI.getGenerativeModel({
          model: 'gemini-flash-lite-latest',
          generationConfig: {
            responseMimeType: 'application/json',
          },
          systemInstruction:
            "You are the DCC-SFA AI Assistant. You will be given a user's original question, the SQL query that was run, and the database result rows. Formulate a polite, clear, and concise natural language answer. Return a JSON object with: 'answer' (your natural language response text), 'charts' (an array of chart configuration objects if the user asked for a dashboard/multiple charts/visualizations, otherwise an empty array or null), and 'chart' (a fallback single chart configuration object, or null). If the user explicitly asks for charts/graphs/dashboards and does NOT ask for a table/list, do NOT include a markdown table in your 'answer' text. If they ask for both, or if they did not ask for charts, include the markdown table in your 'answer' text. Each chart object must have: 'type' ('bar'|'line'|'pie'|'doughnut'), 'label' (name of the metric), 'labels' (array of strings), and 'data' (array of numbers).",
        });

        const prompt = `${historyContext}User Question: "${question}"
SQL Query Executed: "${sqlQuery}"
Database Result: ${JSON.stringify(scrubbedResult)}`;

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
        let charts = null;
        try {
          const parsed = JSON.parse(finalResponseText);
          answer = parsed.answer || '';
          chart = parsed.chart || null;
          charts = parsed.charts || null;
        } catch (e) {
          answer = finalResponseText;
        }

        return {
          success: true,
          answer,
          sql: sqlQuery,
          data: scrubbedResult,
          chart,
          charts,
          latencyMs: Date.now() - startTime,
          usage: { promptTokens, completionTokens, totalTokens },
        };
      }

      return {
        success: false,
        answer:
          'Sorry, I received an unrecognized response type from the AI model.',
      };
    } catch (error: any) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        answer: `An error occurred while processing your request: ${error.message || error}`,
      };
    }
  }
}

export const aiService = new AIService();
