import { aiService } from '../services/ai.service';

export const aiController = {
  async query(req: any, res: any) {
    try {
      const { question, history } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'invalid_input',
          message: 'question is required and must be a string',
        });
      }

      const result = await aiService.query(question, history);

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
        data: result.data,
        chart: result.chart,
        charts: result.charts,
        usage: result.usage,
        latencyMs: result.latencyMs,
      });
    } catch (error: any) {
      console.error('AI Controller Error:', error);
      return res.status(500).json({
        success: false,
        error: 'internal_server_error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  },
};
