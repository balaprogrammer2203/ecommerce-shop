import { ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { appTheme } from '../../theme';
import { store } from '../store';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
};
