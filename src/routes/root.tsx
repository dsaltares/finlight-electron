import { Outlet } from 'react-router-dom';
import SidebarLayout from '@components/Layout/SidebarLayout';

export default function Root() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
