import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { Avatar, Box, Container, Paper, Stack, Typography } from '@mui/material';

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Verified buyer',
    quote: 'Delivery was fast and packaging was perfect. Great prices compared to other sites.',
    initials: 'P',
  },
  {
    name: 'James L.',
    role: 'Prime member',
    quote: 'Easy returns and helpful support. I order electronics here regularly now.',
    initials: 'J',
  },
  {
    name: 'Anita R.',
    role: 'Fashion shopper',
    quote: 'Love the filters and photos. Checkout is smooth on mobile too.',
    initials: 'A',
  },
];

export const TestimonialsSection = () => {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3, textAlign: 'center' }}>
          Customers love ShopSphere
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {testimonials.map((t) => (
            <Paper
              key={t.name}
              variant="outlined"
              sx={{ p: 3, borderRadius: 2, height: '100%', position: 'relative' }}
            >
              <FormatQuoteIcon
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  fontSize: 40,
                  color: 'action.disabled',
                  opacity: 0.35,
                }}
              />
              <Stack spacing={2}>
                <Typography variant="body1" color="text.secondary" sx={{ pr: 3 }}>
                  “{t.quote}”
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                    {t.initials}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.role}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
