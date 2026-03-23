import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Container, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '../system/Button';

export type HeroSlide = {
  id: string;
  /** Full URL to background image */
  image: string;
  /** Small label above the title */
  kicker?: string;
  heading: string;
  subheading: string;
  /** Primary CTA route */
  ctaTo?: string;
  ctaLabel?: string;
};

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
    kicker: 'New season',
    heading: 'Style that moves with you',
    subheading: 'Fresh fashion drops, member prices, and easy returns on every order.',
    ctaTo: '/',
    ctaLabel: 'Shop now',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1920&q=80',
    kicker: 'Tech deals',
    heading: 'Upgrade your everyday',
    subheading: 'Laptops, audio, and smart home picks with fast delivery and secure checkout.',
    ctaTo: '/',
    ctaLabel: 'Shop now',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1920&q=80',
    kicker: 'Home & living',
    heading: 'Make space feel like home',
    subheading: 'Curated decor and essentials—minimal fuss, maximum comfort.',
    ctaTo: '/',
    ctaLabel: 'Shop now',
  },
];

export type HeroBannerProps = {
  slides?: HeroSlide[];
  /** Autoplay interval in ms (0 to disable) */
  autoPlayInterval?: number;
};

export const HeroBanner = ({
  slides = defaultSlides,
  autoPlayInterval = 6000,
}: HeroBannerProps) => {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { defaultMatches: false });
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = slides.length;
  const safeActive = count === 0 ? 0 : active % count;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive((index + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(safeActive - 1), [goTo, safeActive]);
  const goNext = useCallback(() => goTo(safeActive + 1), [goTo, safeActive]);

  useEffect(() => {
    if (count <= 1 || reduceMotion || autoPlayInterval <= 0 || isPaused) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, autoPlayInterval);

    return () => window.clearInterval(id);
  }, [count, reduceMotion, autoPlayInterval, isPaused]);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 400);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  if (count === 0) {
    return null;
  }

  const transitionMs = reduceMotion ? 0 : 700;

  return (
    <Box
      component="section"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        color: 'common.white',
        minHeight: { xs: 380, sm: 420, md: 500 },
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (t) => `inset 0 0 0 3px ${t.palette.primary.light}`,
        },
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === safeActive;
        return (
          <Box
            key={slide.id}
            aria-hidden={!isActive}
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: `opacity ${transitionMs}ms ease-in-out`,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'scale(1.02)',
              }}
            />
            {/* Readability overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: [
                  'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.2) 100%)',
                  'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
                ].join(', '),
              }}
            />
            <Container
              maxWidth="lg"
              sx={{
                position: 'relative',
                height: '100%',
                minHeight: { xs: 380, sm: 420, md: 500 },
                display: 'flex',
                alignItems: 'center',
                py: { xs: 4, sm: 5, md: 6 },
                px: { xs: 2, sm: 3 },
              }}
            >
              <Stack
                spacing={{ xs: 2, sm: 2.5 }}
                maxWidth={{ xs: '100%', sm: '90%', md: 560 }}
                sx={{
                  textShadow: '0 1px 12px rgba(0,0,0,0.35)',
                }}
              >
                {slide.kicker ? (
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'rgba(255,255,255,0.92)',
                      letterSpacing: { xs: 1.5, sm: 2 },
                      fontWeight: 700,
                    }}
                  >
                    {slide.kicker}
                  </Typography>
                ) : null}
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight={800}
                  sx={{
                    lineHeight: 1.12,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: theme.typography.h3.fontSize },
                  }}
                >
                  {slide.heading}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.92)',
                    maxWidth: 520,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    lineHeight: 1.6,
                  }}
                >
                  {slide.subheading}
                </Typography>
                <Box sx={{ pt: { xs: 0.5, sm: 1 } }}>
                  <Button
                    to={slide.ctaTo ?? '/'}
                    shopVariant="secondary"
                    size="large"
                    sx={{
                      px: { xs: 3, sm: 4 },
                      bgcolor: 'common.white',
                      color: 'primary.main',
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                    }}
                  >
                    {slide.ctaLabel ?? 'Shop now'}
                  </Button>
                </Box>
              </Stack>
            </Container>
          </Box>
        );
      })}

      {count > 1 ? (
        <>
          <IconButton
            aria-label="Previous slide"
            onClick={goPrev}
            sx={{
              position: 'absolute',
              left: { xs: 4, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'common.white',
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}
            size="large"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Next slide"
            onClick={goNext}
            sx={{
              position: 'absolute',
              right: { xs: 4, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'common.white',
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}
            size="large"
          >
            <ChevronRightIcon />
          </IconButton>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{
              position: 'absolute',
              bottom: { xs: 16, sm: 20 },
              left: 0,
              right: 0,
              zIndex: 2,
            }}
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((slide, index) => (
              <Box
                key={slide.id}
                component="button"
                type="button"
                role="tab"
                aria-selected={index === safeActive}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                sx={{
                  width: index === safeActive ? 28 : 8,
                  height: 8,
                  p: 0,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  bgcolor: index === safeActive ? 'common.white' : 'rgba(255,255,255,0.45)',
                  transition: 'width 0.25s ease, background-color 0.25s ease',
                  '&:hover': {
                    bgcolor: index === safeActive ? 'common.white' : 'rgba(255,255,255,0.65)',
                  },
                }}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  );
};
