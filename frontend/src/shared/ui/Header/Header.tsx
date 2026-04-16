import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { FALLBACK_MEGA_MENU_ITEMS } from './megaMenuFallbackData';
import { MyntraMegaMenuPanel } from './MyntraMegaMenuPanel';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useLogoutMutation } from '../../../features/auth/api/authApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { clearCredentials } from '../../../features/auth/slices/authSlice';
import { useMyCartQuery } from '../../../features/cart/api/cartApi';
import {
  useLazyListProductsQuery,
  useMegaMenuQuery,
} from '../../../features/catalog/api/catalogApi';
import { useGetWishlistQuery } from '../../../features/wishlist/api/wishlistApi';
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

const CountBadge = ({ value }: { value: number }) => {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-white">
      {value > 99 ? '99+' : value}
    </span>
  );
};

export const Header = ({ showCategories = true }: HeaderProps) => {
  const primary = 'var(--color-primary)';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const [openDesktopId, setOpenDesktopId] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const searchPanelRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: megaMenuData } = useMegaMenuQuery();
  const [triggerSearch, { data: searchData, isFetching: isSearching }] = useLazyListProductsQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const { data: cartData } = useMyCartQuery(undefined, { skip: !isAuthenticated });
  const guestCartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const navItems = useMemo(
    () => (megaMenuData?.items?.length ? megaMenuData.items : FALLBACK_MEGA_MENU_ITEMS),
    [megaMenuData?.items],
  );

  const wishlistCount = isAuthenticated ? (wishlistData?.productIds.length ?? 0) : 0;
  const cartCount = isAuthenticated
    ? (cartData?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
    : guestCartCount;

  const searchResults = searchData?.products ?? [];

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

  useEffect(() => {
    if (!searchOpen) return;
    const timeoutId = window.setTimeout(() => {
      const q = searchTerm.trim();
      if (q.length >= 2) {
        void triggerSearch({ keyword: q, limit: 6 });
      }
    }, 280);
    return () => window.clearTimeout(timeoutId);
  }, [searchOpen, searchTerm, triggerSearch]);

  useEffect(() => {
    if (!searchOpen && !profileOpen) return;

    const onClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchPanelRef.current && !searchPanelRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [searchOpen, profileOpen]);

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

  const performSearch = async (keyword: string) => {
    const q = keyword.trim();
    if (q.length < 2) return;

    const response = await triggerSearch({ keyword: q, limit: 1 }).unwrap();
    if (response.products.length > 0) {
      navigate(`/product/${response.products[0]._id}`);
      setSearchOpen(false);
      setDrawerOpen(false);
      setSearchTerm('');
    }
  };

  const handleDesktopSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void performSearch(searchTerm);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Keep local logout resilient even if API fails.
    }
    dispatch(clearCredentials());
    setProfileOpen(false);
    resetDrawerNavigation();
    navigate('/login');
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
        <div className="relative w-full">
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

              <div className="relative ml-auto flex items-center gap-0.5">
                <div ref={searchPanelRef} className="relative">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Search"
                    onClick={() => {
                      setSearchOpen((v) => !v);
                      setProfileOpen(false);
                      setTimeout(() => searchInputRef.current?.focus(), 0);
                    }}
                  >
                    <IconSearch />
                  </button>

                  {searchOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                      <form
                        onSubmit={handleDesktopSearchSubmit}
                        className="flex items-center gap-2"
                      >
                        <input
                          ref={searchInputRef}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary"
                          placeholder="Search products..."
                          aria-label="Search products"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                        >
                          Go
                        </button>
                      </form>

                      <div className="mt-2 max-h-72 overflow-auto">
                        {searchTerm.trim().length < 2 ? (
                          <p className="px-1 py-2 text-xs text-slate-500">
                            Type at least 2 characters.
                          </p>
                        ) : isSearching ? (
                          <p className="px-1 py-2 text-xs text-slate-500">Searching...</p>
                        ) : searchResults.length === 0 ? (
                          <p className="px-1 py-2 text-xs text-slate-500">No products found.</p>
                        ) : (
                          <ul className="space-y-1">
                            {searchResults.map((p) => (
                              <li key={p._id}>
                                <RouterLink
                                  to={`/product/${p._id}`}
                                  className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchTerm('');
                                  }}
                                >
                                  {p.title ?? p.name}
                                </RouterLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <RouterLink
                  to="/wishlist"
                  className="relative hidden rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                  aria-label="Wishlist"
                >
                  <IconFavoriteBorder />
                  <CountBadge value={wishlistCount} />
                </RouterLink>

                <RouterLink
                  to="/cart"
                  className="relative rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Shopping bag"
                >
                  <IconShoppingBag />
                  <CountBadge value={cartCount} />
                </RouterLink>

                <div ref={profileMenuRef} className="relative">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen((v) => !v);
                        setSearchOpen(false);
                      }}
                      className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Profile"
                    >
                      <IconAccount />
                    </button>
                  ) : (
                    <RouterLink
                      to="/login"
                      className="rounded-lg p-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Login"
                    >
                      <IconAccount />
                    </RouterLink>
                  )}

                  {isAuthenticated && profileOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {user?.name ?? 'Account'}
                      </p>
                      <RouterLink
                        to="/account"
                        className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        Profile
                      </RouterLink>
                      <RouterLink
                        to="/account/orders"
                        className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        My Orders
                      </RouterLink>
                      <RouterLink
                        to="/account#settings"
                        className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        Settings
                      </RouterLink>
                      <RouterLink
                        to="/account#change-password"
                        className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        Change Password
                      </RouterLink>
                      {user?.role === 'admin' ? (
                        <RouterLink
                          to="/admin"
                          className="block rounded-lg px-2 py-2 text-sm text-slate-700 no-underline hover:bg-slate-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          Admin Dashboard
                        </RouterLink>
                      ) : null}
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        className="mt-1 w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                        onClick={() => {
                          void handleLogout();
                        }}
                      >
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {showCategories && activeDesktopItem ? (
            <div
              role="presentation"
              onMouseEnter={cancelScheduledClose}
              onFocusCapture={cancelScheduledClose}
              className={cn(
                'absolute left-0 right-0 top-full z-[1199] border-t border-slate-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)] transition-opacity duration-150',
                openDesktopId ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <MyntraMegaMenuPanel
                item={activeDesktopItem}
                panelId={`mega-${activeDesktopItem.id}`}
                onNavigate={() => setOpenDesktopId(null)}
              />
            </div>
          ) : null}
        </div>
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

              <form
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  void performSearch(searchTerm);
                }}
              >
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search brands and products"
                  aria-label="Search"
                />
                <button type="submit" className="text-primary" aria-label="Search submit">
                  <IconSearch size={22} />
                </button>
              </form>

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
                  Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                </RouterLink>
                <RouterLink
                  to={isAuthenticated ? '/account/orders' : '/login'}
                  className="py-2.5 text-slate-800 no-underline hover:text-primary"
                  onClick={resetDrawerNavigation}
                >
                  {isAuthenticated ? 'Profile' : 'Login'}
                </RouterLink>
                {isAuthenticated && user?.role === 'admin' ? (
                  <RouterLink
                    to="/admin"
                    className="py-2.5 text-slate-800 no-underline hover:text-primary"
                    onClick={resetDrawerNavigation}
                  >
                    Admin Dashboard
                  </RouterLink>
                ) : null}
                <RouterLink
                  to="/cart"
                  className="py-2.5 text-slate-800 no-underline hover:text-primary"
                  onClick={resetDrawerNavigation}
                >
                  Bag{cartCount > 0 ? ` (${cartCount})` : ''}
                </RouterLink>
                {isAuthenticated ? (
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    className="py-2.5 text-left text-red-600 hover:text-red-700 disabled:opacity-60"
                    onClick={() => {
                      void handleLogout();
                    }}
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                ) : null}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
