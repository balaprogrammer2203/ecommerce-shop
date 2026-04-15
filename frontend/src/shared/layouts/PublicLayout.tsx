import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header';
import { SiteFooter } from '../ui/home/SiteFooter';

export const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
