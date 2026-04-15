import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/cn';
import { IconChevronLeft, IconChevronRight } from '../icons/storefront';
import { Button } from '../system/Button';

export type HeroSlide = {
  id: string;
  image: string;
  kicker?: string;
  heading: string;
  subheading: string;
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
  autoPlayInterval?: number;
};

export const HeroBanner = ({
  slides = defaultSlides,
  autoPlayInterval = 6000,
}: HeroBannerProps) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

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
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[380px] w-full overflow-hidden text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:min-h-[420px] md:min-h-[500px]"
    >
      {slides.map((slide, index) => {
        const isActive = index === safeActive;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0',
              isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={{ transition: `opacity ${transitionMs}ms ease-in-out` }}
          >
            <div
              className="absolute inset-0 scale-[1.02] bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.2) 100%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <div className="relative mx-auto flex h-full min-h-[380px] max-w-screen-lg items-center px-4 py-8 sm:min-h-[420px] sm:px-6 md:min-h-[500px] md:py-10">
              <div
                className="flex max-w-full flex-col gap-3 sm:max-w-[90%] sm:gap-4 md:max-w-[560px]"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}
              >
                {slide.kicker ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 sm:tracking-[0.25em]">
                    {slide.kicker}
                  </p>
                ) : null}
                <h1 className="text-[1.75rem] font-extrabold leading-[1.12] sm:text-4xl md:text-5xl">
                  {slide.heading}
                </h1>
                <p className="max-w-[520px] text-[0.95rem] leading-relaxed text-white/90 sm:text-base">
                  {slide.subheading}
                </p>
                <div className="pt-1 sm:pt-2">
                  <Button
                    to={slide.ctaTo ?? '/'}
                    shopVariant="secondary"
                    size="large"
                    className="border-0 bg-white !px-6 !text-primary font-bold shadow-lg !ring-white hover:!bg-white/90 sm:!px-8"
                  >
                    {slide.ctaLabel ?? 'Shop now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-[2] hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6 sm:flex"
          >
            <IconChevronLeft size={28} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-[2] hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:flex"
          >
            <IconChevronRight size={28} />
          </button>

          <div
            className="absolute bottom-4 left-0 right-0 z-[2] flex justify-center gap-2 sm:bottom-5"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === safeActive}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 rounded border-0 p-0 transition-all duration-200',
                  index === safeActive ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/65',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
};
