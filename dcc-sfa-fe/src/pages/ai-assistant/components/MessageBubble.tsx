import { Check, ContentCopy, GetApp, Terminal } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatCalendarTime } from 'utils/dateUtils';
import ChartWidget from './ChartWidget';
import type { Message } from '../types';
import { handleExportExcel } from '../utils';

const MessageBubble = React.memo(
  ({
    msg,
    userQuery,
    userInitials,
    setActiveSql,
  }: {
    msg: Message;
    userQuery: string;
    userInitials: string;
    setActiveSql: (sql: string | null) => void;
  }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyMessage = async () => {
      try {
        await navigator.clipboard.writeText(msg.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    const hasChart = !!msg.chart;
    const requestsTable =
      userQuery.includes('table') ||
      userQuery.includes('both') ||
      userQuery.includes('list') ||
      userQuery.includes('dashboard');
    const showTable = !hasChart || requestsTable;

    return (
      <div
        className={`flex items-start gap-3 py-4 border-b border-gray-100 last:border-b-0 animate-fade-in ${
          msg.sender === 'user' ? 'flex-row-reverse' : ''
        }`}
      >
        <Avatar
          variant="rounded"
          className={`!w-10 !h-10 shrink-0 ${
            msg.sender === 'user'
              ? '!bg-primary-100 !text-primary-600'
              : '!bg-purple-100 !text-purple-600'
          }`}
        >
          {msg.sender === 'user' ? userInitials : 'AI'}
        </Avatar>

        <div
          className={`flex-1 min-w-0 ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}
        >
          <div
            className={`flex justify-between items-center w-full ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <span className="text-sm font-semibold text-gray-900">
              {msg.sender === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
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
              <div className="space-y-2">
                <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 max-w-none text-gray-700 break-words">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {showTable && msg.table && msg.table.headers.length > 0 && (
                  <div className="mb-4 mt-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                        Results
                      </span>
                      <button
                        onClick={() => {
                          if (msg.table) {
                            handleExportExcel(
                              msg.table.headers,
                              msg.table.rows
                            );
                          }
                        }}
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
                            {msg.table.headers.map((h, i) => (
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
                          {msg.table.rows.map((row, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              {row.map((cell, j) => (
                                <td
                                  key={j}
                                  className="px-3 py-2 text-gray-600 font-medium"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {Array.isArray(msg.chart) && msg.chart.length > 0 && (
                  <div
                    className={`grid grid-cols-1 ${msg.chart.length > 1 ? 'md:grid-cols-2' : ''} gap-4 w-full`}
                  >
                    {msg.chart.map((c, ci) => (
                      <React.Fragment key={ci}>
                        <ChartWidget chartData={c} />
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {!Array.isArray(msg.chart) && msg.chart && (
                  <ChartWidget chartData={msg.chart} />
                )}
                {(msg.latencyMs !== undefined || msg.usage) && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium select-none">
                    {msg.latencyMs !== undefined && (
                      <span>
                        {(msg.latencyMs / 1000).toFixed(2)}s response time
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
                onClick={handleCopyMessage}
                className="text-[10px] font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-transparent border-none cursor-pointer outline-none p-0 flex items-center gap-1"
              >
                <span>{isCopied ? 'COPIED!' : 'COPY'}</span>
                {isCopied ? (
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
  }
);

export default MessageBubble;
