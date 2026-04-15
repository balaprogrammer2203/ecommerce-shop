import { Link as RouterLink } from 'react-router-dom';

import { IconFacebook, IconInstagram, IconTwitter, IconYouTube } from '../icons/storefront';

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
    <footer className="bg-slate-900 pt-10 pb-6 text-slate-300 md:pt-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <div>
            <p className="mb-2 text-lg font-extrabold tracking-wide text-white">ShopSphere</p>
            <p className="mb-4 text-sm text-slate-500">
              Everything you need — electronics, fashion, home &amp; more. Trusted delivery and easy
              returns.
            </p>
            <div className="flex gap-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Twitter"
              >
                <IconTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="YouTube"
              >
                <IconYouTube />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-bold text-white">{col.title}</p>
              <ul className="flex flex-col gap-2 list-none p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <RouterLink
                      to={l.to}
                      className="text-sm text-slate-400 no-underline transition-colors hover:text-white"
                    >
                      {l.label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-8 border-slate-800" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">© {year} ShopSphere. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <RouterLink to="/" className="text-xs text-slate-500 no-underline hover:text-slate-300">
              Privacy
            </RouterLink>
            <RouterLink to="/" className="text-xs text-slate-500 no-underline hover:text-slate-300">
              Terms of use
            </RouterLink>
            <RouterLink to="/" className="text-xs text-slate-500 no-underline hover:text-slate-300">
              Cookies
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
