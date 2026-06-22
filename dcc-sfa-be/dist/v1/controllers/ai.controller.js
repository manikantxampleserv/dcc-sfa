"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const ai_service_1 = require("../services/ai.service");
exports.aiController = {
    async query(req, res) {
        try {
            const { question, history } = req.body;
            if (!question || typeof question !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'invalid_input',
                    message: 'question is required and must be a string',
                });
            }
            const result = await ai_service_1.aiService.query(question, history);
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: result.answer,
                });
            }
            return res.status(200).json({
                success: true,
                answer: result.answer,
                sql: result.sql,
                chart: result.chart,
                table: result.table,
                usage: result.usage,
                latencyMs: result.latencyMs,
            });
        }
        catch (error) {
            console.error('AI Controller Error:', error);
            return res.status(500).json({
                success: false,
                error: 'internal_server_error',
                message: error.message || 'An unexpected error occurred',
            });
        }
    },
};
//# sourceMappingURL=ai.controller.js.map