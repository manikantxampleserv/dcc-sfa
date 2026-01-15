import AppRouter from './routes';
import ContextProvider from './context';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Main application component that sets up the application structure with providers and guards.
 *
 * This component orchestrates the core application setup by:
 * - Wrapping the app with ErrorBoundary for error handling
 * - Wrapping the app with ContextProvider for global state management
 * - Implementing authentication guard to protect routes
 * - Providing routing functionality through AppRouter
 * - Including toast notifications for user feedback
 *
 * @component
 * @returns {React.ReactElement} The main application component with all providers and routing
 */
const App = (): React.ReactElement => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log errors to console in development
        if (import.meta.env.DEV) {
          console.error('App-level error:', error, errorInfo);
        }
        // In production, you would send this to an error tracking service
        // errorTrackingService.captureException(error, errorInfo);
      }}
    >
      <ContextProvider>
        <ErrorBoundary>
          <AuthGuard>
            <AppRouter />
            <ToastContainer />
          </AuthGuard>
        </ErrorBoundary>
      </ContextProvider>
    </ErrorBoundary>
  );
};

export default App;
