import { Outlet } from 'react-router-dom';

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
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
