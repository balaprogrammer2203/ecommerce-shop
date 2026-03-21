import { Grid, Paper, Typography } from '@mui/material';

export const CheckoutPage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Shipping details
          </Typography>
          <Typography color="text.secondary">Address forms and validation live here.</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order summary
          </Typography>
          <Typography color="text.secondary">Cart totals, promos, and payment buttons.</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
