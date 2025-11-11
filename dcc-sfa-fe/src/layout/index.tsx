import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/Header';
import Sidebar from '../shared/Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef<string>('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    if (prevPathnameRef.current !== currentPath) {
      prevPathnameRef.current = currentPath;
      setRemountKey(prev => prev + 1);

      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, location.search, location.key]);

  const outletKey = `${location.pathname}${location.search}${remountKey}`;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main ref={mainRef} className="flex-1 overflow-auto p-5">
          <Outlet key={outletKey} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
