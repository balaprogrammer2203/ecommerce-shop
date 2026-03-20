import { Paper, Stack, Typography } from '@mui/material';

export const HomePage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        Welcome to ShopSphere
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="text.secondary">
          Use the category navigation menu above to browse products by category, subcategory, and
          item.
        </Typography>
      </Paper>
    </Stack>
  );
};
