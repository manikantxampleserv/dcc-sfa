import AppRouter from './routes';
import ContextProvider from './context';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
  return (
    <ContextProvider>
      <AppRouter />
      <ToastContainer />
    </ContextProvider>
  );
};

export default App;
