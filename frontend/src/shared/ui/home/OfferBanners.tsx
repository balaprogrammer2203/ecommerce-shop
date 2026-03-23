import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const OfferBanners = () => {
  return (
    <Box component="section" sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: 3,
              borderRadius: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              bgcolor: alpha(theme.palette.error.main, 0.06),
              borderColor: alpha(theme.palette.error.main, 0.2),
            })}
          >
            <Box
              sx={{
                bgcolor: 'error.main',
                color: 'common.white',
                p: 1,
                borderRadius: 1.5,
                display: 'flex',
              }}
            >
              <LocalOfferOutlinedIcon />
            </Box>
            <Stack spacing={0.5}>
              <Typography fontWeight={800}>Extra 10% off with ShopSphere Pay</Typography>
              <Typography variant="body2" color="text.secondary">
                On orders above $50. Limited period. T&amp;C apply.
              </Typography>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: 3,
              borderRadius: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              borderColor: alpha(theme.palette.primary.main, 0.2),
            })}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                p: 1,
                borderRadius: 1.5,
                display: 'flex',
              }}
            >
              <PaymentsOutlinedIcon />
            </Box>
            <Stack spacing={0.5}>
              <Typography fontWeight={800}>No-cost EMI on select cards</Typography>
              <Typography variant="body2" color="text.secondary">
                3 &amp; 6 month plans on bestsellers. Checkout for eligible items.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
