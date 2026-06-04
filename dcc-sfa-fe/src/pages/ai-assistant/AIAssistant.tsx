import {
  Check,
  Close,
  ContentCopy,
  GetApp,
  Info,
  Refresh,
  Send,
  Terminal,
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import axiosInstance from 'configs/axio.config';
import React, { useEffect, useRef, useState } from 'react';
import tokenService from 'services/auth/tokenService';
import Button from 'shared/Button';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sql?: string;
  data?: any;
  chart?: any;
  timestamp: Date;
}

const suggestions = [
  'How many active salespeople do I have?',
  'Show me the list of active depots',
  'How many customers/outlets are registered?',
  'List active products in the catalog',
];

const AIAssistant: React.FC = () => {
  const user = tokenService.getUser();
  const userId = user?.id;
  const sessionKey = userId ? `dcc_sfa_ai_chat_${userId}` : null;
  const userInitials = user?.username
    ? user.username.charAt(0).toUpperCase()
    : 'U';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSql, setActiveSql] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (sessionKey) {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const formatted = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(formatted);
          return;
        } catch (e) {
          console.error('Failed to parse stored chat history:', e);
        }
      }
    }

    setMessages([
      {
        sender: 'assistant',
        text: "Hello! I am your SFA AI Assistant. You can ask me questions about your database like: *'How many salespeople do I have?'* or *'Show me active depots'*. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, [sessionKey]);

  useEffect(() => {
    if (sessionKey && messages.length > 0) {
      sessionStorage.setItem(sessionKey, JSON.stringify(messages));
    }
  }, [messages, sessionKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    const historyPayload = messages
      .slice(1)
      .slice(-10)
      .map(m => ({
        sender: m.sender,
        text: m.text,
        sql: m.sql,
      }));

    try {
      const response = await axiosInstance.post('/ai/query', {
        question: text,
        history: historyPayload,
      });

      const assistantMsg: Message = {
        sender: 'assistant',
        text: response.data.answer || "I couldn't find an answer.",
        sql: response.data.sql,
        data: response.data.data,
        chart: response.data.chart,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('AI Error:', error);
      const errMsg =
        error.response?.data?.message ||
        'Sorry, I encountered an issue querying the database. Please verify your connection or Gemini API key.';
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: errMsg,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: 'Chat cleared. What else can I fetch from the database for you?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleExportExcel = (headers: string[], rows: string[][]) => {
    const data = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(
      workbook,
      `query_results_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const renderChart = (chartData: {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    label: string;
    labels: string[];
    data: number[];
  }) => {
    if (!chartData || !chartData.type || !chartData.labels || !chartData.data) {
      return null;
    }

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: chartData.label || 'Value',
          data: chartData.data,
          backgroundColor:
            chartData.type === 'pie' || chartData.type === 'doughnut'
              ? [
                  '#3b82f6',
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981',
                  '#06b6d4',
                  '#f43f5e',
                ]
              : 'rgba(59, 130, 246, 0.8)',
          borderColor:
            chartData.type === 'pie' || chartData.type === 'doughnut'
              ? '#ffffff'
              : '#3b82f6',
          borderWidth: 1.5,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartData.type === 'pie' || chartData.type === 'doughnut',
          position: 'bottom' as const,
          labels: {
            font: {
              size: 11,
            },
            boxWidth: 12,
          },
        },
      },
      scales:
        chartData.type === 'pie' || chartData.type === 'doughnut'
          ? undefined
          : {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#f3f4f6',
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
            },
    };

    const ChartComponent = () => {
      switch (chartData.type) {
        case 'bar':
          return <Bar data={data} options={options} />;
        case 'line':
          return <Line data={data} options={options} />;
        case 'pie':
          return <Pie data={data} options={options} />;
        case 'doughnut':
          return <Doughnut data={data} options={options} />;
        default:
          return null;
      }
    };

    return (
      <div className="my-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-xl h-[300px] flex flex-col justify-between">
        <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-1.5 mb-2">
          {chartData.label || 'Visualization'}
        </div>
        <div className="flex-1 min-h-0 relative">
          <ChartComponent />
        </div>
      </div>
    );
  };

  const renderTable = (headers: string[], rows: string[][]) => {
    return (
      <div className="my-3 border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            Results
          </span>
          <button
            onClick={() => handleExportExcel(headers, rows)}
            className="text-[12px] font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-transparent border-none cursor-pointer outline-none p-0 flex items-center gap-1"
          >
            <GetApp style={{ fontSize: '14px' }} />
            Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs md:text-sm">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }
                >
                  {row.map((val, vi) => (
                    <td
                      key={vi}
                      className="px-3 py-2 text-gray-600 font-medium"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const highlightSql = (sql: string) => {
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'JOIN',
      'LEFT',
      'RIGHT',
      'INNER',
      'ON',
      'AND',
      'OR',
      'GROUP',
      'BY',
      'ORDER',
      'LIMIT',
      'OFFSET',
      'COUNT',
      'SUM',
      'MIN',
      'MAX',
      'AVG',
      'AS',
      'IN',
      'IS',
      'NULL',
      'NOT',
      'LIKE',
      'INSERT',
      'UPDATE',
      'DELETE',
      'SET',
      'CREATE',
      'TABLE',
      'DROP',
      'ALTER',
      'WITH',
      'HAVING',
    ];

    const regex = new RegExp(
      `(\\b(?:${keywords.join('|')})\\b|'[^']*'|\\b\\d+\\b|[=<>!+*/-]+)`,
      'gi'
    );

    const parts = sql.split(regex);
    return parts.map((part, index) => {
      if (!part) return null;
      const upperPart = part.toUpperCase();
      if (keywords.includes(upperPart)) {
        return (
          <span key={index} className="text-pink-600 font-semibold">
            {part}
          </span>
        );
      } else if (part.startsWith("'") && part.endsWith("'")) {
        return (
          <span key={index} className="text-green-600">
            {part}
          </span>
        );
      } else if (/^\d+$/.test(part)) {
        return (
          <span key={index} className="text-amber-600">
            {part}
          </span>
        );
      } else if (/^[=<>!+*/-]+$/.test(part)) {
        return (
          <span key={index} className="text-sky-600">
            {part}
          </span>
        );
      } else {
        return part;
      }
    });
  };

  const parseMessageContent = (text: string, showTable: boolean = true) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('|') && line.endsWith('|')) {
        if (showTable) {
          const cells = line
            .split('|')
            .map(s => s.trim())
            .filter((_, index, arr) => index > 0 && index < arr.length - 1);
          if (!inTable) {
            inTable = true;
            tableHeaders = cells;
            if (i + 1 < lines.length && lines[i + 1].includes('-')) {
              i++;
            }
          } else {
            tableRows.push(cells);
          }
        }
      } else {
        if (inTable) {
          if (showTable) {
            elements.push(renderTable(tableHeaders, tableRows));
          }
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        if (line !== '') {
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          elements.push(
            <p key={i} className="mb-2 text-gray-700 leading-relaxed text-sm">
              {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={index} className="font-semibold text-gray-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                } else if (part.startsWith('*') && part.endsWith('*')) {
                  return (
                    <strong key={index} className="font-semibold text-gray-900">
                      {part.slice(1, -1)}
                    </strong>
                  );
                } else {
                  return part;
                }
              })}
            </p>
          );
        }
      }
    }

    if (inTable && showTable) {
      elements.push(renderTable(tableHeaders, tableRows));
    }

    return elements;
  };

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">AI Assistant</p>
          <p className="!text-gray-500 text-sm">
            Ask questions, fetch statistics, and get insights from the database
          </p>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          onClick={clearChat}
          className="!capitalize !outline-none"
        >
          Clear Chat
        </Button>
      </Box>

      <div className="flex flex-col h-[calc(100vh-210px)] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto px-6 bg-white">
          {messages.map((msg, index) => {
            const userQuery = index > 0 ? messages[index - 1].text.toLowerCase() : '';
            const hasChart = !!msg.chart;
            const requestsTable = userQuery.includes('table') || userQuery.includes('both') || userQuery.includes('list');
            const showTable = !hasChart || requestsTable;

            return (
              <div
                key={index}
                className={`flex items-start gap-3 py-5 border-b border-gray-100 last:border-b-0 animate-fade-in ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0 ${
                    msg.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}
                >
                  {msg.sender === 'user' ? userInitials : 'AI'}
                </div>

                <div
                  className={`flex-1 min-w-0 ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}
                >
                  <div
                    className={`flex justify-between items-center w-full mb-1 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      {msg.sender === 'user' && (
                        <span className="text-gray-300 mr-0.5">✓</span>
                      )}
                      <span>
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`text-sm text-gray-700 leading-relaxed break-words ${msg.sender === 'user' ? 'text-right' : ''}`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="space-y-3">
                        {parseMessageContent(msg.text, showTable)}
                        {msg.chart && renderChart(msg.chart)}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleCopyMessage(msg.text, index)}
                        className="text-[10px] font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-transparent border-none cursor-pointer outline-none p-0 flex items-center gap-1"
                      >
                        <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                        {copiedIndex === index ? (
                          <Check style={{ fontSize: '10px', color: '#10b981' }} />
                        ) : (
                          <ContentCopy style={{ fontSize: '10px' }} />
                        )}
                      </button>
                    </div>
                  ) : (
                    msg.sql && (
                      <div className="mt-2.5 max-w-md w-full">
                        <button
                          type="button"
                          onClick={() => setActiveSql(msg.sql || null)}
                          className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md cursor-pointer transition-all text-left outline-none"
                        >
                          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-gray-600">
                            <Terminal
                              style={{ fontSize: '14px' }}
                              className="text-gray-400"
                            />
                            sql
                          </span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 py-5 animate-fade-in">
              <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-purple-600 shrink-0">
                AI
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    AI Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 py-1">
                  <span
                    className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    Searching database...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 space-y-3">
          {messages.length <= 2 && !isLoading && (
            <div className="flex flex-wrap gap-2 pb-1 overflow-x-auto">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-xs font-medium text-primary-600 hover:text-white bg-primary-50 hover:bg-primary-600 border border-primary-100 hover:border-primary-600 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask AI Assistant about salespeople, depots, customers, orders..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-200 focus:border-primary-500 rounded-lg focus:outline-none text-sm transition-all shadow-sm placeholder:text-gray-400 disabled:bg-gray-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              variant="contained"
              color="primary"
              className="!rounded-lg flex items-center justify-center min-w-[50px] !p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium px-1">
            <Info className="w-3.5 h-3.5 text-gray-300" />
            Note: This assistant runs safe read-only queries. Modifying the
            database is prohibited.
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(activeSql)}
        onClose={() => setActiveSql(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            className: '!rounded-lg !outline-none',
          },
        }}
      >
        <DialogTitle className="!font-bold !text-base !flex !justify-between !items-center !px-4 !py-3 border-b border-gray-100">
          <span>SQL Query</span>
          <IconButton
            onClick={() => setActiveSql(null)}
            size="small"
            className="!p-1 !outline-none"
          >
            <Close className="w-5 h-5 text-gray-500" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!px-4 !py-3">
          <div className="bg-gray-50 text-gray-800 p-3 rounded-lg text-xs md:text-sm font-mono border border-gray-200 shadow-inner leading-relaxed whitespace-pre-wrap break-words">
            <code>{activeSql ? highlightSql(activeSql) : ''}</code>
          </div>
        </DialogContent>
        <DialogActions className="!px-4 !py-3 border-t border-gray-100">
          <Button
            onClick={() => setActiveSql(null)}
            variant="outlined"
            size="small"
            className="!capitalize !outline-none"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIAssistant;
