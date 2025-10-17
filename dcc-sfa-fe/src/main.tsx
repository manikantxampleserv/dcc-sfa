import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Comprehensive error suppression system
const shouldSuppressError = (message: string): boolean => {
  const suppressPatterns = [
    'ERR_CONNECTION_REFUSED',
    'net::ERR_CONNECTION_REFUSED',
    'Failed to fetch',
    'Network Error',
    'code-inspector-plugin',
    'Retrying request',
    'dispatchXhrRequest',
    'xhr.js',
    'axio.config.ts',
    'GET http://192.168.29.169:4000',
    'POST http://192.168.29.169:4000',
    'PUT http://192.168.29.169:4000',
    'DELETE http://192.168.29.169:4000',
    'PATCH http://192.168.29.169:4000',
    'axios',
    'XMLHttpRequest',
    'fetch',
    'Promise.then',
    'queryFn',
    'fetchFn',
    'run @ retryer.ts',
    'start @ retryer.ts',
    'fetch @ query.ts',
    '#executeFetch @ queryObserver.ts',
    'onSubscribe @ queryObserver.ts',
    'subscribe @ subscribable.ts',
    'useBaseQuery.ts',
    'subscribeToStore @ react-dom-client.development.js',
    'react_stack_bottom_frame @ react-dom-client.development.js',
    'runWithFiberInDEV @ react-dom-client.development.js',
    'commitHookEffectListMount @ react-dom-client.development.js',
    'commitHookPassiveMountEffects @ react-dom-client.development.js',
    'recursivelyTraversePassiveMountEffects @ react-dom-client.development.js',
    'commitPassiveMountOnFiber @ react-dom-client.development.js',
    'flushPassiveEffects @ react-dom-client.development.js',
    'flushPendingEffects @ react-dom-client.development.js',
    'performSyncWorkOnRoot @ react-dom-client.development.js',
    'flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js',
    'flushSpawnedWork @ react-dom-client.development.js',
    'commitRoot @ react-dom-client.development.js',
    'commitRootWhenReady @ react-dom-client.development.js',
    'performWorkOnRoot @ react-dom-client.development.js',
    'performWorkOnRootViaSchedulerTask @ react-dom-client.development.js',
    'performWorkUntilDeadline @ scheduler.development.js',
    'XMLHttpRequest.send',
    'dispatchXhrRequest',
    'xhr',
    'dispatchRequest',
    'Axios.js',
    'bind.js',
    'retryRequest',
    'users/me',
    'main.tsx',
  ];

  return suppressPatterns.some(pattern => message.includes(pattern));
};

// Suppress console logs and errors globally
if (import.meta.env.VITE_APP_ENV !== 'development') {
  console.error = () => {};
  console.warn = () => {};
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
} else {
  // In development, only suppress network errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;

  console.error = (...args) => {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return; // Suppress these errors
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return; // Suppress these warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  console.log = (...args) => {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return; // Suppress these logs
    }
    originalConsoleLog.apply(console, args);
  };

  console.info = (...args) => {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return; // Suppress these info messages
    }
    originalConsoleInfo.apply(console, args);
  };

  console.debug = (...args) => {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return; // Suppress these debug messages
    }
    originalConsoleDebug.apply(console, args);
  };
}

// Override global error handlers
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const errorMessage = String(message);
  if (shouldSuppressError(errorMessage)) {
    return true; // Suppress the error
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

// Override unhandled promise rejection handler
const originalOnUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = function (event) {
  const message = event.reason?.message || String(event.reason) || '';
  if (shouldSuppressError(message)) {
    event.preventDefault();
    return;
  }
  if (originalOnUnhandledRejection) {
    originalOnUnhandledRejection.call(window, event);
  }
};

// Override XMLHttpRequest to suppress network errors
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null
) {
  (this as any)._url = url;
  return originalXHROpen.call(
    this,
    method,
    url,
    async ?? true,
    username,
    password
  );
};

XMLHttpRequest.prototype.send = function (
  data?: Document | XMLHttpRequestBodyInit | null
) {
  const xhr = this;

  // Override the error event
  const originalOnError = xhr.onerror;
  xhr.onerror = function (event) {
    const url = (xhr as any)._url || '';
    if (shouldSuppressError(url)) {
      return; // Suppress the error
    }
    if (originalOnError) {
      originalOnError.call(this, event);
    }
  };

  return originalXHRSend.call(this, data);
};

// Override fetch to suppress network errors
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : (input as Request).url;

  return originalFetch.call(this, input, init).catch(error => {
    if (shouldSuppressError(url)) {
      // Return a rejected promise that won't be logged
      return Promise.reject(new Error('Suppressed network error'));
    }
    throw error;
  });
};

// Additional aggressive error suppression
// Override the browser's native error reporting
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (
  type: string,
  listener: any,
  options?: any
) {
  if (type === 'error' || type === 'unhandledrejection') {
    const wrappedListener = (event: any) => {
      const message =
        event.message || event.reason?.message || String(event.reason) || '';
      if (shouldSuppressError(message)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (typeof listener === 'function') {
        listener(event);
      }
    };
    return originalAddEventListener.call(this, type, wrappedListener, options);
  }
  return originalAddEventListener.call(this, type, listener, options);
};

// Override console methods at the prototype level for even more coverage
const originalConsoleMethods: Record<string, (...args: any[]) => void> = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
  debug: console.debug,
};

Object.keys(originalConsoleMethods).forEach(method => {
  (console as any)[method] = function (...args: any[]) {
    const message = args.join(' ');
    if (shouldSuppressError(message)) {
      return;
    }
    originalConsoleMethods[method].apply(console, args);
  };
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
