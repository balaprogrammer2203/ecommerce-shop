import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

const parseError = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      message:
        typeof error.data === 'string' ? error.data : 'The requested page could not be loaded.',
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Unexpected application error',
      message: error.message || 'Something went wrong.',
    };
  }

  return {
    title: 'Unexpected application error',
    message: 'Something went wrong. Please try again.',
  };
};

export const RouteErrorBoundary = () => {
  const navigate = useNavigate();
  const routeError = useRouteError();
  const parsed = parseError(routeError);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: '#F8FAFC',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 3,
          border: '1px solid rgba(229,231,235,1)',
          p: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700} color="#0F172A">
            {parsed.title}
          </Typography>
          <Alert severity="error" variant="outlined">
            {parsed.message}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You can go back to the dashboard/home or reload the page.
          </Typography>
          <Stack direction="row" spacing={1.25} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<HomeRoundedIcon />}
              onClick={() => navigate('/')}
            >
              Go to home
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
