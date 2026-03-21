import { Box, Container, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';

export const AdminLayout = () => {
  return (
    <Box bgcolor="#0F172A" color="#F8FAFC" minHeight="100vh">
      <Header />
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
  );
};
