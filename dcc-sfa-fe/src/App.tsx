import AppRouter from './routes';
import ContextProvider from './context';
import ToastContainer from './components/ToastContainer';
import 'configs/agGrid.config';

const App: React.FC = () => {
  return (
    <ContextProvider>
      <AppRouter />
      <ToastContainer />
    </ContextProvider>
  );
};

export default App;
