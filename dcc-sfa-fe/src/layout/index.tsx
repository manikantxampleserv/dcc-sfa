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

  // Force remount when route changes
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Only update if pathname actually changed
    if (prevPathnameRef.current !== currentPath) {
      console.log('Route changed:', {
        from: prevPathnameRef.current,
        to: currentPath,
        locationKey: location.key,
      });

      prevPathnameRef.current = currentPath;
      // Force remount by updating key
      setRemountKey(prev => {
        const newKey = prev + 1;
        console.log('Remount key updated:', newKey);
        return newKey;
      });

      // Scroll to top
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, location.search, location.key]);

  // Create a unique key that changes on every navigation
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
