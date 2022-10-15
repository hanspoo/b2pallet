import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';

import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { GlobalLoader } from './app/GlobalLoader';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient();
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GlobalLoader>
        <App />
      </GlobalLoader>
    </QueryClientProvider>
  </StrictMode>
);
