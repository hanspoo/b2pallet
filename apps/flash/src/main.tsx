import { store } from '@flash-ws/reductor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';

import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { GlobalLoader } from './app/GlobalLoader';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient();
root.render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GlobalLoader>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GlobalLoader>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
