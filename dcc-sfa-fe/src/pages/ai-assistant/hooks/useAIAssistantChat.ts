import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosInstance from 'configs/axio.config';
import type { Message } from '../types';

interface UseAIAssistantChatProps {
  sessionKey: string | null;
  onAssistantReply: (text: string, isVoice: boolean) => void;
}

export const useAIAssistantChat = ({
  sessionKey,
  onAssistantReply,
}: UseAIAssistantChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSql, setActiveSql] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

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

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
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

  const handleSend = async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
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
      abortControllerRef.current = new AbortController();
      const response = await axiosInstance.post(
        '/ai/query',
        {
          question: text,
          history: historyPayload,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      const answerText = response.data.answer || "I couldn't find an answer.";

      onAssistantReply(answerText, isVoice);

      const assistantMsg: Message = {
        sender: 'assistant',
        text: answerText,
        sql: response.data.sql,
        chart: response.data.chart,
        table: response.data.table,
        usage: response.data.usage,
        latencyMs: response.data.latencyMs,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      if (
        axios.isCancel(error) ||
        error.name === 'CanceledError' ||
        error.code === 'ERR_CANCELED'
      ) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: 'Generation interrupted by user.',
            timestamp: new Date(),
          },
        ]);
        return;
      }
      const error_message =
        error.response?.data?.message ||
        'Sorry, I encountered an issue querying the database.';
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: error_message,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    activeSql,
    setActiveSql,
    handleSend,
    handleStop,
    clearChat,
  };
};
