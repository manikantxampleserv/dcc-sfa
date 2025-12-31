import AppRouter from './routes';
import ContextProvider from './context';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';

/**
 * Main application component that sets up the application structure with providers and guards.
 *
 * This component orchestrates the core application setup by:
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
    <ContextProvider>
      <AuthGuard>
        <AppRouter />
        <ToastContainer />
      </AuthGuard>
    </ContextProvider>
  );
};

export default App;
