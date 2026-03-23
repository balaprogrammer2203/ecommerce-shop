import { Box, Container, Stack, Typography } from '@mui/material';
import { type FormEvent, useState } from 'react';

import { Button } from '../system/Button';
import { Input } from '../system/Input';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 5 },
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[50]} 100%)`,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="md">
        <Stack
          component="form"
          onSubmit={handleSubmit}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Deals in your inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subscribe for launches, coupons, and curated picks. Unsubscribe anytime.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitted}
              sx={{ minWidth: { sm: 260 } }}
            />
            <Button type="submit" shopVariant="primary" disabled={submitted} sx={{ minWidth: 120 }}>
              {submitted ? 'Subscribed' : 'Subscribe'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
