"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoMapVariables = exports.extractPlaceholders = exports.renderDetailsHtml = exports.formatRequestType = exports.generateEmailContent = void 0;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const formatRequestType = (type) => {
    if (!type)
        return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
exports.formatRequestType = formatRequestType;
const renderDetailsHtml = (request_detail) => {
    if (!request_detail)
        return '';
    let html = `<h4 style="margin: 0; margin-bottom: 5px;">Request Details:</h4><ul style="margin: 0; padding-left: 10px;">`;
    for (const [key, value] of Object.entries(request_detail)) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        let formatted;
        if (value instanceof Date) {
            formatted = value.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
        else {
            formatted = value?.toString() ?? 'N/A';
        }
        html += `<li style="margin: 0; line-height: 1.2;"><strong>${label}:</strong> ${formatted}</li>`;
    }
    html += `</ul>`;
    return html;
};
exports.renderDetailsHtml = renderDetailsHtml;
const extractPlaceholders = (str) => {
    const matches = str.match(/\$\{\s*(\w+)\s*\}|\{\{\s*(\w+)\s*\}\}/g) || [];
    return matches.map(m => m.replace(/\$\{|\{|\}|\s/g, ''));
};
exports.extractPlaceholders = extractPlaceholders;
const autoMapVariables = (template, vars) => {
    const placeholders = [
        ...extractPlaceholders(template.subject || ''),
        ...extractPlaceholders(template.body || ''),
    ];
    const mapped = { ...vars };
    placeholders.forEach(key => {
        if (!mapped[key]) {
            const aliasMap = {
                employee_name: [
                    'employee_name',
                    'staff_name',
                    'candidate_name',
                    'user_name',
                ],
                candidate_name: ['candidate_name'],
                requester_name: [
                    'applicant_name',
                    'initiator_name',
                    'salesperson_name',
                ],
                user_name: ['user_name'],
                approver_name: ['manager_name', 'reviewer_name'],
                days: ['remaining_days', 'days'],
                customer_name: ['customer_name', 'client_name'],
                order_number: ['order_number', 'order_no'],
                total_amount: ['total_amount', 'amount', 'order_amount'],
            };
            if (aliasMap[key]) {
                const alias = aliasMap[key].find(a => vars[a] !== undefined);
                if (alias) {
                    mapped[key] = vars[alias];
                    return;
                }
            }
            const candidate = Object.keys(vars).find(k => k.toLowerCase().includes(key.toLowerCase().split('_')[0]) ||
                key.toLowerCase().includes(k.toLowerCase().split('_')[0]));
            if (candidate) {
                mapped[key] = vars[candidate];
            }
        }
    });
    return mapped;
};
exports.autoMapVariables = autoMapVariables;
const generateEmailContent = async (key, variables = {}) => {
    console.log(' generateEmailContent called with:');
    console.log('  Key:', key);
    console.log('  Variables:', variables);
    try {
        const template = await prisma_client_1.default.sfa_d_templates.findUnique({
            where: { key },
        });
        if (!template) {
            console.error(`Template not found for key: ${key}`);
            throw new Error(`Email template with key "${key}" not found.`);
        }
        const normalizedVars = autoMapVariables(template, variables);
        const computedVars = {
            ...normalizedVars,
            request_type: formatRequestType(normalizedVars.request_type),
            request_detail: renderDetailsHtml(normalizedVars.request_detail),
        };
        const render = (str) => {
            if (!str)
                return '';
            let rendered = str;
            rendered = rendered.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => {
                const value = computedVars[key];
                return value?.toString() || '';
            });
            rendered = rendered.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
                const value = computedVars[key];
                return value?.toString() || '';
            });
            return rendered;
        };
        const result = {
            subject: render(template.subject),
            body: render(template.body),
        };
        console.log(' Email template rendered successfully');
        return result;
    }
    catch (error) {
        console.error(' Error generating email content:', error);
        throw error;
    }
};
exports.generateEmailContent = generateEmailContent;
exports.default = exports.generateEmailContent;
//# sourceMappingURL=emailTemplates.js.map