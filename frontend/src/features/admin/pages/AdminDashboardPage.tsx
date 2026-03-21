import { Grid, Paper, Stack, Typography } from '@mui/material';

export const AdminDashboardPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Business overview
      </Typography>
      <Grid container spacing={3}>
        {[1, 2, 3].map((tile) => (
          <Grid item xs={12} md={4} key={tile}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
              <Typography variant="body2" textTransform="uppercase" color="text.secondary">
                Metric {tile}
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                0
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};
