import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Box, Container, Divider, IconButton, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const footerColumns = [
  {
    title: 'Get to know us',
    links: [
      { label: 'About ShopSphere', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Press', to: '/' },
    ],
  },
  {
    title: 'Let us help you',
    links: [
      { label: 'Your account', to: '/account/orders' },
      { label: 'Returns centre', to: '/' },
      { label: 'Help', to: '/' },
    ],
  },
  {
    title: 'Shopping',
    links: [
      { label: 'Your cart', to: '/cart' },
      { label: 'Saved for later', to: '/' },
      { label: 'Gift cards', to: '/' },
    ],
  },
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.300',
        pt: { xs: 4, md: 6 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: 'common.white', fontWeight: 800, letterSpacing: 0.5, mb: 1 }}
            >
              ShopSphere
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
              Everything you need — electronics, fashion, home &amp; more. Trusted delivery and easy
              returns.
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton aria-label="Facebook" sx={{ color: 'grey.400' }} size="small">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="Twitter" sx={{ color: 'grey.400' }} size="small">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="Instagram" sx={{ color: 'grey.400' }} size="small">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="YouTube" sx={{ color: 'grey.400' }} size="small">
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {footerColumns.map((col) => (
            <Box key={col.title}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'common.white', fontWeight: 700, mb: 1.5 }}
              >
                {col.title}
              </Typography>
              <Stack spacing={1}>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    component={RouterLink}
                    to={l.to}
                    underline="hover"
                    sx={{ color: 'grey.400', fontSize: 14, '&:hover': { color: 'common.white' } }}
                  >
                    {l.label}
                  </Link>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography variant="caption" sx={{ color: 'grey.600' }}>
            © {year} ShopSphere. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Link href="#" underline="hover" sx={{ color: 'grey.500', fontSize: 12 }}>
              Privacy
            </Link>
            <Link href="#" underline="hover" sx={{ color: 'grey.500', fontSize: 12 }}>
              Terms of use
            </Link>
            <Link href="#" underline="hover" sx={{ color: 'grey.500', fontSize: 12 }}>
              Cookies
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
