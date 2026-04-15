import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { FALLBACK_MEGA_MENU_ITEMS } from './megaMenuFallbackData';
import { MyntraMegaMenuPanel } from './MyntraMegaMenuPanel';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useMegaMenuQuery } from '../../../features/catalog/api/catalogApi';
import { cn } from '../../lib/cn';
import {
  IconAccount,
  IconClose,
  IconExpandLess,
  IconExpandMore,
  IconFavoriteBorder,
  IconMenu,
  IconSearch,
  IconShoppingBag,
} from '../icons/storefront';

type HeaderProps = {
  showCategories?: boolean;
};

export const Header = ({ showCategories = true }: HeaderProps) => {
  const primary = 'var(--color-primary)';
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const [openDesktopId, setOpenDesktopId] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const { data: megaMenuData } = useMegaMenuQuery();
  const navItems = useMemo(
    () => (megaMenuData?.items?.length ? megaMenuData.items : FALLBACK_MEGA_MENU_ITEMS),
    [megaMenuData?.items],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleCloseDesktop = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDesktopId(null);
      closeTimerRef.current = null;
    }, 140);
  }, [cancelScheduledClose]);

  const activeDesktopItem = useMemo(
    () => navItems.find((i) => i.id === openDesktopId) ?? null,
    [navItems, openDesktopId],
  );

  const resetDrawerNavigation = () => {
    setDrawerOpen(false);
    setMobileOpenId(null);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    setMobileOpenId(null);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[1200] border-b border-slate-200 bg-white transition-shadow duration-200',
          scrolled && 'shadow-[0_2px_10px_rgba(15,23,42,0.08)]',
        )}
        onMouseLeave={showCategories ? scheduleCloseDesktop : undefined}
      >
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="flex min-h-14 items-center gap-4 md:min-h-16">
            {showCategories ? (
              <button
                type="button"
                className="inline-flex text-slate-900 md:hidden"
                aria-label="Open menu"
                onClick={openDrawer}
              >
                <IconMenu size={26} />
              </button>
            ) : null}

            <RouterLink to="/" className="flex items-center text-inherit no-underline">
              <span className="text-lg font-black tracking-wide text-slate-900">ShopSphere</span>
            </RouterLink>

            {showCategories ? (
              <nav
                aria-label="Main categories"
                role="menubar"
                className="mx-1 hidden flex-1 items-center justify-center gap-0.5 md:flex"
                onMouseEnter={cancelScheduledClose}
              >
                {navItems.map((item) => {
                  const panelId = `mega-${item.id}`;
                  const isOpen = openDesktopId === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      type="button"
                      role="menuitem"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onMouseEnter={() => {
                        cancelScheduledClose();
                        setOpenDesktopId(item.id);
                      }}
                      onFocus={() => {
                        cancelScheduledClose();
                        setOpenDesktopId(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setOpenDesktopId(null);
                        }
                      }}
                      style={{ borderBottomColor: isOpen ? primary : 'transparent' }}
                      className={cn(
                        'min-w-0 border-b-[3px] border-transparent px-2 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-900 transition-colors hover:text-primary',
                        isOpen && 'text-primary',
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Search"
              >
                <IconSearch />
              </button>
              <RouterLink
                to="/wishlist"
                className="hidden rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                aria-label="Wishlist"
              >
                <IconFavoriteBorder />
              </RouterLink>
              <RouterLink
                to="/cart"
                className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Shopping bag"
              >
                <IconShoppingBag />
              </RouterLink>
              <RouterLink
                to={isAuthenticated ? '/account/orders' : '/login'}
                className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={isAuthenticated ? 'Profile' : 'Login'}
              >
                <IconAccount />
              </RouterLink>
            </div>
          </div>
        </div>

        {showCategories && activeDesktopItem ? (
          <div
            role="presentation"
            onMouseEnter={cancelScheduledClose}
            onFocusCapture={cancelScheduledClose}
            className={cn(
              'border-t border-slate-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)] transition-all duration-150',
              openDesktopId
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-1.5 opacity-0',
            )}
          >
            <MyntraMegaMenuPanel
              item={activeDesktopItem}
              panelId={`mega-${activeDesktopItem.id}`}
              onNavigate={() => setOpenDesktopId(null)}
            />
          </div>
        ) : null}
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close menu backdrop"
            onClick={resetDrawerNavigation}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(380px,92vw)] max-w-full flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <RouterLink
                  to="/"
                  className="text-lg font-black tracking-wide text-slate-900 no-underline"
                  onClick={resetDrawerNavigation}
                >
                  ShopSphere
                </RouterLink>
                <button
                  type="button"
                  onClick={resetDrawerNavigation}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-slate-700"
                >
                  <IconClose />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search brands and products"
                  aria-label="Search"
                />
                <button type="button" className="text-primary" aria-label="Search submit">
                  <IconSearch size={22} />
                </button>
              </div>

              <hr className="border-slate-200" />

              {showCategories ? (
                <ul className="list-none p-0" aria-label="Mobile categories">
                  {navItems.map((item) => {
                    const open = mobileOpenId === item.id;
                    return (
                      <li key={item.id} className="border-b border-slate-100 last:border-0">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between py-3 text-left"
                          onClick={() => setMobileOpenId(open ? null : item.id)}
                        >
                          <span className="text-[13px] font-black uppercase tracking-wide text-slate-900">
                            {item.label}
                          </span>
                          {open ? <IconExpandLess /> : <IconExpandMore />}
                        </button>
                        {open ? (
                          <div className="pb-2 pl-1">
                            {item.columns.map((col) => (
                              <div key={`${item.id}-${col.title}`} className="py-2 pl-2">
                                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
                                  {col.title}
                                </p>
                                <ul className="list-none space-y-0.5 p-0">
                                  {col.links.map((link) => (
                                    <li key={`${col.title}-${link.label}`}>
                                      <RouterLink
                                        to={link.href}
                                        className="block py-1.5 pl-2 text-[13px] text-slate-600 no-underline hover:text-primary"
                                        onClick={resetDrawerNavigation}
                                      >
                                        {link.label}
                                      </RouterLink>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <hr className="border-slate-200" />

              <nav className="flex flex-col">
                <RouterLink
                  to="/wishlist"
                  className="py-2.5 text-slate-800 no-underline hover:text-primary"
                  onClick={resetDrawerNavigation}
                >
                  Wishlist
                </RouterLink>
                <RouterLink
                  to={isAuthenticated ? '/account/orders' : '/login'}
                  className="py-2.5 text-slate-800 no-underline hover:text-primary"
                  onClick={resetDrawerNavigation}
                >
                  {isAuthenticated ? 'Profile' : 'Login'}
                </RouterLink>
                <RouterLink
                  to="/cart"
                  className="py-2.5 text-slate-800 no-underline hover:text-primary"
                  onClick={resetDrawerNavigation}
                >
                  Bag
                </RouterLink>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
