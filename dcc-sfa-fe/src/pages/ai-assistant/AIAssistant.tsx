import {
  ArrowUpward,
  Close,
  Fullscreen,
  FullscreenExit,
  Info,
  PlaylistRemove,
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
import axiosInstance from 'configs/axio.config';
import React, { useEffect, useRef, useState } from 'react';
import Button from 'shared/Button';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import type { Message } from './types';
import { highlightSql } from './utils';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        chart: response.data.chart,
        table: response.data.table,
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
            return (
              <MessageBubble
                key={index}
                msg={msg}
                userQuery={userQuery}
                userInitials={userInitials}
                setActiveSql={setActiveSql}
              />
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
