import { Box, Container, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';

export const PublicLayout = () => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Box component="footer" py={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
