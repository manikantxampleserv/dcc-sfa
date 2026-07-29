/**
 * Interface representing chart data returned by the AI.
 */
export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    label: string;
    labels: string[];
    data: number[];
}
/**
 * Service handling all interactions with the Google Generative AI (Gemini).
 */
export declare class AIService {
    private genAI;
    /**
     * Initializes the AIService.
     * Creates an instance of GoogleGenerativeAI using the GEMINI_API_KEY from environment variables.
     */
    constructor();
    /**
     * Queries the AI model with a natural language question and conversational history.
     * It handles text-only responses and read-only SQL queries, formats the result, and extracts charts/tables.
     *
     * @param {string} question - The user's natural language question.
     * @param {Array<{ sender: 'user' | 'assistant'; text: string; sql?: string }>} [history] - Optional conversation history.
     * @returns {Promise<any>} An object containing the success status, answer, executed SQL, charts, table data, usage metrics, and latency.
     */
    query(question: string, history?: {
        sender: 'user' | 'assistant';
        text: string;
        sql?: string;
    }[]): Promise<{
        success: boolean;
        answer: string;
        sql?: string;
        chart?: ChartData | ChartData[];
        table?: {
            headers: string[];
            rows: string[][];
        };
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
        latencyMs?: number;
    }>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map