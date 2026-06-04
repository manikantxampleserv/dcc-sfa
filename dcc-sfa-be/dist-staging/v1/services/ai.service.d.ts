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
        data?: any;
        chart?: any;
    }>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map