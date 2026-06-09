export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    label: string;
    labels: string[];
    data: number[];
}
export declare class AIService {
    private genAI;
    constructor();
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