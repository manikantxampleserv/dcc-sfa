import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from 'shared/Sidebar';
import Header from 'shared/Header';
import BreadCrumbs from 'shared/BreadCrumbs';

/**
 * Main application layout: Sidebar | Header + BreadCrumbs + main content.
 * Mirrors the SFA layout exactly.
 */
const Layout: React.FC = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.search]);

  const outletKey = `${location.pathname}${location.search}${(location.state as { forceReload?: number } | null)?.forceReload ?? ''}`;

  const getNavItem = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const isNumeric = /^\d+$/.test(lastSegment);

    if (location.pathname === '/') {
      return 'Dashboard';
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

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
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
    </div>
  );
};

export default Layout;
