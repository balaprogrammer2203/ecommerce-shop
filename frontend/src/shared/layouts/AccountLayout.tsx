import { NavLink, Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';

export const AccountLayout = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            My Account
          </h1>
          <nav className="flex flex-wrap gap-2" aria-label="Account sections">
            {[
              { to: '/account', label: 'Profile' },
              { to: '/account/orders', label: 'Orders' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/account'}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
