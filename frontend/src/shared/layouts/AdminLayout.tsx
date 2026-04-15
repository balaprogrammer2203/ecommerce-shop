import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink, Outlet } from 'react-router-dom';

import { appTheme } from '../../theme';

export const AdminLayout = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box bgcolor="#0F172A" color="#F8FAFC" minHeight="100vh">
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: '#0F172A',
            borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
            backgroundImage: 'none',
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/admin"
              sx={{
                flexGrow: 1,
                fontWeight: 800,
                textDecoration: 'none',
                color: 'inherit',
                letterSpacing: 0.3,
              }}
            >
              ShopSphere Admin
            </Typography>
            <Button color="inherit" component={RouterLink} to="/" size="medium">
              View store
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Stack spacing={4} sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight={700}>
              Admin Console
            </Typography>
            <Box bgcolor="#1E293B" borderRadius={2} p={3}>
              <Outlet />
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
