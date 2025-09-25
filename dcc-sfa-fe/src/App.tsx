import AppRouter from './routes';
import ContextProvider from './context';

const App: React.FC = () => {
  return (
    <ContextProvider>
      <AppRouter />
    </ContextProvider>
  );
};

export default App;
