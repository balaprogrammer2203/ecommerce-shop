import { Box, Container, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';

export const AccountLayout = () => {
  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={600}>
            My Account
          </Typography>
          <Box>
            <Outlet />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
