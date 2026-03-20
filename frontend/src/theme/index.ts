import { createTheme } from '@mui/material/styles';

import { palette } from './palette';
import { typography } from './typography';

export const appTheme = createTheme({
  palette,
  typography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});
