import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20) => ({ width: size, height: size }) as const;

export function IconMenu({ size = 24, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  );
}

export function IconClose({ size = 24, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function IconSearch({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" d="M11 19a8 8 0 100-16 8 8 0 000 16z" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconChevronLeft({ size = 24, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ size = 24, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function IconChevronDown({ size = 20, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconExpandMore({ size = 22, ...p }: IconProps) {
  return <IconChevronDown size={size} {...p} />;
}

export function IconExpandLess({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
    </svg>
  );
}

export function IconFavoriteBorder({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...base(size)}
      {...p}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10z"
      />
    </svg>
  );
}

export function IconFavoriteFilled({ size = 22, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function IconShoppingBag({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...base(size)}
      {...p}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7h15l-1.5 12.5a2 2 0 01-2 1.5H8a2 2 0 01-2-1.5L6 7z"
      />
      <path strokeLinecap="round" d="M9 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

export function IconAccount({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" d="M20 21a8 8 0 00-16 0" />
      <path strokeLinecap="round" d="M12 13a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

export function IconFacebook({ size = 18, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2v-2.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.83 0-1 .5-1 1.2V12H16v3h-2.5v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

export function IconTwitter({ size = 18, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function IconInstagram({ size = 18, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1112 17a5.5 5.5 0 01-5.5-5.5zm0 2A3.5 3.5 0 1012 15a3.5 3.5 0 00-3.5-3.5zM17.5 6a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}

export function IconYouTube({ size = 18, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size)} {...p}>
      <path d="M23.5 6.2S23 4 21.6 3.6c-2-.6-10.1-.6-10.1-.6s-8 0-10 .6C0 4 0 6.3 0 6.3v11.4S0 20 1.5 20.4c2 .6 10 .6 10 .6s8 0 10.1-.6C23 20 23 17.7 23 17.7V6.3zM9.5 15.5V8.4l7 3.6-7 3.5z" />
    </svg>
  );
}

export function IconLocalOffer({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 2.4M3 12l9 9 9-9-9-9-9 9z" />
      <circle cx={7.5} cy={7.5} r={1.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPayments({ size = 22, ...p }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...base(size)}
      {...p}
    >
      <path strokeLinecap="round" d="M3 7h18v10H3z" />
      <path strokeLinecap="round" d="M3 11h18" />
    </svg>
  );
}

export function IconFormatQuote({ size = 40, ...p }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" opacity={0.35} {...base(size)} {...p}>
      <path d="M7 17h6v-6H9V9c0-1.66 1.34-3 3-3h1V3H9C6.79 3 5 4.79 5 7v10zm10 0h6v-6h-4V9c0-1.66 1.34-3 3-3h1V3h-4c-2.21 0-4 1.79-4 4v10z" />
    </svg>
  );
}
