import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onTranscriptReady: (text: string, isVoice: boolean) => void;
  inputValueRef: React.MutableRefObject<string>;
  setInputValue: (val: string) => void;
}

export const useSpeechRecognition = ({
  onTranscriptReady,
  inputValueRef,
  setInputValue,
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isConversationModeRef = useRef(false);

  useEffect(() => {
    isConversationModeRef.current = isConversationMode;
  }, [isConversationMode]);

  const resetConversationTimeout = () => {
    if (conversationTimeoutRef.current)
      clearTimeout(conversationTimeoutRef.current);
    if (isConversationModeRef.current) {
      conversationTimeoutRef.current = setTimeout(() => {
        if (isConversationModeRef.current) {
          setIsConversationMode(false);
          isConversationModeRef.current = false;
          if (recognitionRef.current) recognitionRef.current.stop();
        }
      }, 20000);
    }
  };

  const stopAllSpeech = () => {
    setIsConversationMode(false);
    if (conversationTimeoutRef.current)
      clearTimeout(conversationTimeoutRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleVoiceInput = (forceStart: boolean = false) => {
    if (isListening && !forceStart) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (conversationTimeoutRef.current)
        clearTimeout(conversationTimeoutRef.current);
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsConversationMode(false);
      return;
    }

    if (isListening && forceStart) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setInputValue('');
    };

    recognition.onresult = (event: any) => {
      resetConversationTimeout();
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInputValue(finalTranscript + interimTranscript);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 1500);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      const textToSend = finalTranscript || inputValueRef.current;
      if (textToSend.trim()) {
        onTranscriptReady(textToSend, true);
      } else if (isConversationModeRef.current) {
        toggleVoiceInput(true);
      }
    };

    recognition.start();
  };

  const toggleConversationMode = () => {
    if (isConversationMode) {
      setIsConversationMode(false);
      if (conversationTimeoutRef.current)
        clearTimeout(conversationTimeoutRef.current);
      if (isListening) toggleVoiceInput();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsConversationMode(true);
      isConversationModeRef.current = true;
      resetConversationTimeout();
      if (!isListening) toggleVoiceInput(true);
    }
  };

  const speakAssistantReply = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';

      utterance.onend = () => {
        if (isConversationModeRef.current) {
          resetConversationTimeout();
          toggleVoiceInput(true);
        }
      };

      window.speechSynthesis.speak(utterance);
    } else if (isConversationModeRef.current) {
      resetConversationTimeout();
      toggleVoiceInput(true);
    }
  };

  return {
    isListening,
    isConversationMode,
    toggleVoiceInput,
    toggleConversationMode,
    speakAssistantReply,
    stopAllSpeech,
  };
};
