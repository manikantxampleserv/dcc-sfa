import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/Header';
import Sidebar from '../shared/UpdatedSidebar';
import BreadCrumbs from 'shared/BreadCrumbs';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef<string>('');
  const prevForceReloadRef = useRef<number | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const locationState = location.state as { forceReload?: number } | null;
    const forceReload = locationState?.forceReload ?? null;
    const pathChanged = prevPathnameRef.current !== currentPath;
    const forceReloadChanged = prevForceReloadRef.current !== forceReload;

    if (pathChanged || forceReloadChanged) {
      if (pathChanged) {
        prevPathnameRef.current = currentPath;
      }
      if (forceReloadChanged && forceReload !== null) {
        prevForceReloadRef.current = forceReload;
      }
      setRemountKey(prev => prev + 1);

      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, location.search, location.key, location.state]);

  const outletKey = `${location.pathname}${location.search}${location.key || remountKey}${(location.state as { forceReload?: number } | null)?.forceReload || ''}`;

  const getNavItem = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const isNumeric = /^\d+$/.test(lastSegment);

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <BreadCrumbs
          navItem={getNavItem()}
          navLink={location.pathname}
          id={location.pathname}
        />
        <main ref={mainRef} className="flex-1 overflow-auto p-5">
          <Outlet key={outletKey} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
