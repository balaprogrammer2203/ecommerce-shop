import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';
import { SiteFooter } from '../ui/home/SiteFooter';

export const PublicLayout = () => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  );
};
