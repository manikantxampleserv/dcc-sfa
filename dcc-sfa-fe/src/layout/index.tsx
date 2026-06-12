import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/Header';
import Sidebar from '../shared/UpdatedSidebar';
import BreadCrumbs from 'shared/BreadCrumbs';
import { CurrencyProvider } from '../context/CurrencyContext';
import { TourProvider } from '../context/TourContext';
import JoyrideTour from 'shared/JoyrideTour';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.search]);

  const outletKey = `${location.pathname}${location.search}${(location.state as { forceReload?: number } | null)?.forceReload || ''}`;

  const getNavItem = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const isNumeric = /^\d+$/.test(lastSegment);

    if (
      location.pathname === '/' ||
      location.pathname === '/dashboard/executive'
    ) {
      return 'Executive Dashboard';
    }

    if (isNumeric && pathSegments.length > 1) {
      const parentSegment = pathSegments[pathSegments.length - 2];
      const parentLabel = parentSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${parentLabel} @${lastSegment}`;
    }

    return (
      lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || ''
    );
  };

  return (
    <CurrencyProvider>
      <TourProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <BreadCrumbs
              id={location.pathname}
              navItem={getNavItem()}
              navLink={location.pathname}
            />
            <main ref={mainRef} className="flex-1 overflow-auto p-5">
              <Outlet key={outletKey} />
            </main>
          </div>
          <JoyrideTour />
        </div>
      </TourProvider>
    </CurrencyProvider>
  );
};

export default Layout;
