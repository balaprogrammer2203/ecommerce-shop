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
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';

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
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                { to: '/admin', label: 'Dashboard', end: true },
                { to: '/admin/products', label: 'Products' },
                { to: '/admin/categories', label: 'Categories' },
                { to: '/admin/category-attributes', label: 'Attributes' },
                { to: '/admin/orders', label: 'Orders' },
                { to: '/admin/users', label: 'Users' },
              ].map((nav) => (
                <Button
                  key={nav.to}
                  component={NavLink}
                  to={nav.to}
                  end={nav.end}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    '&.active': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {nav.label}
                </Button>
              ))}
            </Stack>
            <Box bgcolor="#1E293B" borderRadius={2} p={3}>
              <Outlet />
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
