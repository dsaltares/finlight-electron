import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import SidebarLayout from '@components/Layout/SidebarLayout';

export default function Root() {
  const location = useLocation();
  useEffect(() => {
    console.log('navigation change: ', location.pathname, location.search);
  }, [location.pathname, location.search]);

  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
