export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  label: string;
  labels: string[];
  data: number[];
}

export interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sql?: string;
  chart?: ChartData | ChartData[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
}
