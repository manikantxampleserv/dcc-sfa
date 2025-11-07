import AppRouter from './routes';
import ContextProvider from './context';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';

const App: React.FC = () => {
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
