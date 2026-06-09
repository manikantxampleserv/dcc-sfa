import {
  ArrowUpward,
  Close,
  Fullscreen,
  FullscreenExit,
  Info,
  Mic,
  MicOff,
  PlaylistRemove,
  RecordVoiceOver,
  Stop,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Button from 'shared/Button';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './components/MessageBubble';
import { useAIAssistantChat } from './hooks/useAIAssistantChat';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
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

  const [inputValue, setInputValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputValueRef = useRef('');

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const speakRef = useRef<((text: string) => void) | null>(null);

  const {
    messages,
    isLoading,
    activeSql,
    setActiveSql,
    handleSend,
    handleStop,
    clearChat: clearChatBase,
  } = useAIAssistantChat({
    sessionKey,
    onAssistantReply: (text, isVoice) => {
      if (isVoice && speakRef.current) {
        speakRef.current(text);
      }
    },
  });

  const {
    isListening,
    isConversationMode,
    toggleVoiceInput,
    toggleConversationMode,
    speakAssistantReply,
    stopAllSpeech,
  } = useSpeechRecognition({
    onTranscriptReady: handleSend,
    inputValueRef,
    setInputValue,
  });

  useEffect(() => {
    speakRef.current = speakAssistantReply;
  }, [speakAssistantReply]);

  const clearChat = () => {
    stopAllSpeech();
    clearChatBase();
  };

  const onStopGenerating = () => {
    stopAllSpeech();
    handleStop();
  };

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

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
    setInputValue('');
  };

  return (
    <>
      <div
        className={`flex flex-col bg-white overflow-hidden ${
          isFullscreen
            ? 'h-screen w-screen fixed inset-0 z-[9999]'
            : 'h-[calc(100vh-150px)] rounded-lg border border-gray-200 shadow-sm'
        }`}
      >
        <Box className="!flex !justify-between p-3 border-b border-gray-200 !items-center">
          <Box>
            <p className="!font-bold !text-gray-900">AI Assistant</p>
            <p className="!text-gray-500 text-sm">
              Ask questions, fetch statistics, and get insights from the
              database
            </p>
          </Box>
          <Box className="!flex !items-center !border !border-gray-200 !rounded-md !px-1 !py-0.5 bg-white">
            <Tooltip title="Clear Chat">
              <IconButton
                onClick={clearChat}
                className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
              >
                <PlaylistRemove className="!w-5 !h-5" />
              </IconButton>
            </Tooltip>
            <div className="w-[1px] h-4 bg-gray-300 mx-1" />
            <Tooltip title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}>
              <IconButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="!text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !p-1.5 !rounded-md !outline-none"
              >
                {isFullscreen ? (
                  <FullscreenExit className="!w-5 !h-5" />
                ) : (
                  <Fullscreen className="!w-5 !h-5" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

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
              if (inputValue.trim() && !isLoading) {
                handleSend(inputValue);
                setInputValue('');
              }
            }}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 transition-all shadow-sm"
          >
            {isListening ? (
              <div className="flex-1 flex items-center pl-2 h-[32px] gap-2 overflow-hidden bg-transparent">
                <div className="flex items-center gap-[3px] h-full">
                  <div className="voice-wave" />
                  <div className="voice-wave" />
                  <div className="voice-wave" />
                  <div className="voice-wave" />
                  <div className="voice-wave" />
                </div>
                <span className="ml-2 text-sm text-[#155dfc] font-semibold animate-pulse tracking-wide shrink-0">
                  Listening...
                </span>
                {inputValue && (
                  <span className="ml-2 text-sm text-gray-500 truncate">
                    "{inputValue}"
                  </span>
                )}
              </div>
            ) : (
              <div className="flex-1 relative flex items-center">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  autoFocus
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim() && !isLoading) {
                        handleSend(inputValue);
                        setInputValue('');
                      }
                    }
                  }}
                  placeholder="Ask AI Assistant about salespeople, depots, customers, orders..."
                  disabled={isLoading}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className={`w-full p-2 truncate text-ellipsis outline-none bg-transparent border-none resize-none text-[15px] py-1 placeholder:text-gray-400 disabled:text-gray-400 max-h-24 overflow-y-auto caret-animated`}
                />
              </div>
            )}
            <Tooltip
              arrow
              placement="top"
              title={
                isConversationMode
                  ? 'Stop Conversation Mode'
                  : 'Start Conversation Mode'
              }
            >
              <IconButton
                type="button"
                onClick={toggleConversationMode}
                className={`!p-1.5 !rounded-[6px] !transition-all !outline-none ${
                  isConversationMode
                    ? '!bg-green-100 !text-green-600 animate-pulse'
                    : '!bg-gray-100 !text-gray-500 hover:!bg-gray-200'
                }`}
              >
                <RecordVoiceOver className="w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip
              arrow
              placement="top"
              title={isListening ? 'Stop listening' : 'Start voice command'}
            >
              <span className="inline-block">
                <IconButton
                  type="button"
                  onClick={() => toggleVoiceInput()}
                  disabled={isLoading}
                  className={`!p-1.5 !rounded-[6px] !transition-all !outline-none ${
                    isListening
                      ? '!bg-red-100 !text-red-500 animate-pulse'
                      : '!bg-gray-100 !text-gray-500 hover:!bg-gray-200'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            {isLoading ? (
              <Tooltip arrow placement="top" title="Stop generating">
                <IconButton
                  type="button"
                  onClick={onStopGenerating}
                  className="!p-1.5 !rounded-[6px] !transition-all !outline-none !bg-red-500 !text-white hover:!bg-red-600"
                >
                  <Stop className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip arrow placement="top" title="Send message">
                <span className="inline-block">
                  <IconButton
                    type="submit"
                    disabled={isListening || !inputValue.trim()}
                    className={`!p-1.5 !rounded-[6px] !transition-all !outline-none ${
                      inputValue.trim() && !isListening
                        ? '!bg-blue-600 !text-white hover:!bg-blue-700'
                        : '!bg-gray-100 !text-gray-300'
                    }`}
                  >
                    <ArrowUpward className="w-4 h-4" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
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
