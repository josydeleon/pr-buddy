import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './components/Dashboard';
import { AppHeader } from './components/AppHeader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-hidden">
          <Dashboard />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
