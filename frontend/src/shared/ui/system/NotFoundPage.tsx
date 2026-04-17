import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

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
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            404
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            Page not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The page you are trying to open does not exist or may have been moved.
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
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
