import {
  ArrowUpward,
  Check,
  Close,
  ContentCopy,
  Fullscreen,
  FullscreenExit,
  GetApp,
  Info,
  PlaylistRemove,
  Terminal,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import axiosInstance from 'configs/axio.config';
import React, { useEffect, useRef, useState } from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import Button from 'shared/Button';
import { formatCalendarTime } from 'utils/dateUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

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
  chart?: any | any[];
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
}

const suggestions = [
  'Show depot wise visits and orders dashboard',
  'How many active salespeople do I have?',
  'Show me the list of active depots',
  'List active products in the catalog',
];

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const sessionKey = userId ? `dcc_sfa_ai_chat_${userId}` : null;
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSql, setActiveSql] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('ai-fullscreen-active');
    } else {
      document.body.classList.remove('ai-fullscreen-active');
    }
    return () => {
      document.body.classList.remove('ai-fullscreen-active');
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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
        usage: response.data.usage,
        latencyMs: response.data.latencyMs,
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

  const extractTableFromMarkdown = (text: string) => {
    const lines = text.split('\n').map(l => l.trim());
    let inTable = false;
    let headers: string[] = [];
    let rows: string[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .split('|')
          .map(s => s.trim().replace(/^\*\*?(.*?)\*\*?$/, '$1'))
          .filter((_, index, arr) => index > 0 && index < arr.length - 1);

        if (!inTable) {
          inTable = true;
          headers = cells;
          if (i + 1 < lines.length && lines[i + 1].includes('-')) {
            i++;
          }
        } else {
          rows.push(cells);
        }
      } else if (inTable) {
        break;
      }
    }
    return { headers, rows };
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
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-[350px] flex flex-col justify-between w-full">
        <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-1.5 mb-2">
          {chartData.label || 'Visualization'}
        </div>
        <div className="flex-1 min-h-0 relative">
          <ChartComponent />
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

  return (
    <>
      {isFullscreen && (
        <style>{`
          body.ai-fullscreen-active {
            overflow: hidden !important;
          }
          body.ai-fullscreen-active header,
          body.ai-fullscreen-active aside,
          body.ai-fullscreen-active .w-72,
          body.ai-fullscreen-active div:has(> .breadcrambs) {
            display: none !important;
          }
        `}</style>
      )}

      {!isFullscreen && (
        <Box className="!mb-3 !flex !justify-between !items-center">
          <Box>
            <p className="!font-bold text-xl !text-gray-900">AI Assistant</p>
            <p className="!text-gray-500 text-sm">
              Ask questions, fetch statistics, and get insights from the
              database
            </p>
          </Box>
          <Box className="!flex !items-center !border !border-gray-200 !rounded-md !px-1 !py-0.5 bg-white">
            <IconButton
              onClick={clearChat}
              className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
              title="Clear Chat"
            >
              <PlaylistRemove className="!w-5 !h-5" />
            </IconButton>
            <div className="w-[1px] h-4 bg-gray-300 mx-1" />
            <IconButton
              onClick={() => setIsFullscreen(true)}
              className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
              title="Full Screen"
            >
              <Fullscreen className="!w-5 !h-5" />
            </IconButton>
          </Box>
        </Box>
      )}

      <div
        className={`flex flex-col bg-white overflow-hidden ${
          isFullscreen
            ? 'h-screen w-screen fixed inset-0 z-[9999]'
            : 'h-[calc(100vh-210px)] rounded-lg border border-gray-200 shadow-sm'
        }`}
      >
        {isFullscreen && (
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200 bg-gray-50 shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base">
                AI Assistant
              </span>
              <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                Fullscreen Mode
              </span>
            </div>
            <Box className="!flex !items-center !border !border-gray-200 !rounded-md !px-1 !py-0.5 bg-white">
              <IconButton
                onClick={clearChat}
                className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
                title="Clear Chat"
              >
                <PlaylistRemove className="!w-5 !h-5" />
              </IconButton>
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <IconButton
                onClick={() => setIsFullscreen(false)}
                className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
                title="Exit Full Screen"
              >
                <FullscreenExit className="!w-5 !h-5" />
              </IconButton>
            </Box>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 bg-white">
          {messages.map((msg, index) => {
            const userQuery =
              index > 0 ? messages[index - 1].text.toLowerCase() : '';
            const hasChart = !!msg.chart;
            const requestsTable =
              userQuery.includes('table') ||
              userQuery.includes('both') ||
              userQuery.includes('list') ||
              userQuery.includes('dashboard');
            const showTable = !hasChart || requestsTable;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 py-4 border-b border-gray-100 last:border-b-0 animate-fade-in ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar
                  variant="rounded"
                  className={`!w-10 !h-10 shrink-0 ${
                    msg.sender === 'user'
                      ? '!bg-blue-100 !text-blue-600'
                      : '!bg-purple-100 !text-purple-600'
                  }`}
                >
                  {msg.sender === 'user' ? userInitials : 'AI'}
                </Avatar>

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
                      <span>{formatCalendarTime(msg.timestamp)}</span>
                    </div>
                  </div>

                  <div
                    className={`text-sm text-gray-700 leading-relaxed break-words ${msg.sender === 'user' ? 'text-right' : ''}`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="space-y-3">
                        {showTable && (
                          <div className="prose prose-sm max-w-none prose-p:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-sm prose-strong:font-semibold prose-strong:text-gray-900">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ node, ...props }) => (
                                  <div className="mb-4 mt-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
                                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                      <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                                        Results
                                      </span>
                                      <button
                                        onClick={() => {
                                          const { headers, rows } =
                                            extractTableFromMarkdown(msg.text);
                                          if (headers.length > 0)
                                            handleExportExcel(headers, rows);
                                        }}
                                        className="text-[12px] font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-transparent border-none cursor-pointer outline-none p-0 flex items-center gap-1"
                                      >
                                        <GetApp style={{ fontSize: '14px' }} />
                                        Export Excel
                                      </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table
                                        className="min-w-full divide-y divide-gray-200 text-left text-xs md:text-sm"
                                        {...props}
                                      />
                                    </div>
                                  </div>
                                ),
                                thead: ({ node, ...props }) => (
                                  <thead className="bg-gray-100" {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                  <th
                                    className="px-3 py-2 font-semibold text-gray-700 uppercase tracking-wider"
                                    {...props}
                                  />
                                ),
                                tbody: ({ node, ...props }) => (
                                  <tbody
                                    className="divide-y divide-gray-200 bg-white"
                                    {...props}
                                  />
                                ),
                                tr: ({ node, ...props }) => (
                                  <tr
                                    className="hover:bg-gray-50 transition-colors"
                                    {...props}
                                  />
                                ),
                                td: ({ node, ...props }) => (
                                  <td
                                    className="px-3 py-2 text-gray-600 font-medium"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                        {Array.isArray(msg.chart) && msg.chart.length > 0 && (
                          <div
                            className={`grid grid-cols-1 ${msg.chart.length > 1 ? 'md:grid-cols-2' : ''} gap-4 w-full`}
                          >
                            {msg.chart.map((c, ci) => (
                              <React.Fragment key={ci}>
                                {renderChart(c)}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {!Array.isArray(msg.chart) &&
                          msg.chart &&
                          renderChart(msg.chart)}
                        {(msg.latencyMs !== undefined || msg.usage) && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium select-none">
                            {msg.latencyMs !== undefined && (
                              <span>
                                {(msg.latencyMs / 1000).toFixed(2)}s response
                                time
                              </span>
                            )}
                            {msg.latencyMs !== undefined && msg.usage && (
                              <span className="text-gray-300">|</span>
                            )}
                            {msg.usage && (
                              <span
                                title={`Prompt: ${msg.usage.promptTokens} | Completion: ${msg.usage.completionTokens}`}
                              >
                                {msg.usage.totalTokens} tokens
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleCopyMessage(msg.text, index)}
                        className="text-[10px] font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-transparent border-none cursor-pointer outline-none p-0 flex items-center gap-1"
                      >
                        <span>
                          {copiedIndex === index ? 'COPIED!' : 'COPY'}
                        </span>
                        {copiedIndex === index ? (
                          <Check
                            style={{ fontSize: '10px', color: '#10b981' }}
                          />
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
              <Avatar
                variant="rounded"
                className="!w-10 !h-10 !text-xs !font-bold shrink-0 !bg-purple-100 !text-purple-600"
              >
                AI
              </Avatar>
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
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 transition-all shadow-sm"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputValue.trim() && !isLoading) {
                    handleSend(inputValue);
                  }
                }
              }}
              placeholder="Ask AI Assistant about salespeople, depots, customers, orders..."
              disabled={isLoading}
              style={{ outline: 'none', boxShadow: 'none' }}
              className="flex-1 p-2 outline-none bg-transparent border-none resize-none text-sm py-1 placeholder:text-gray-400 disabled:text-gray-400 max-h-24 overflow-y-auto"
            />
            <IconButton
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`!p-1.5 !rounded-[6px] !transition-all !outline-none ${
                inputValue.trim()
                  ? '!bg-blue-600 !text-white hover:!bg-blue-700'
                  : '!bg-gray-100 !text-gray-300'
              }`}
            >
              <ArrowUpward className="w-4 h-4" />
            </IconButton>
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
