import Box from '@mui/material/Box';
import {
  useState,
  type PropsWithChildren,
  useEffect,
  useCallback,
} from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import useIsMobile from '@lib/useIsMobile';
import Sidebar from './Sidebar';
import { DrawerWidth } from './constants';
import HeaderBar from './HeaderBar';

export default function SidebarLayout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  useRouteChange(useCallback(() => setMobileOpen(false), [setMobileOpen]));
  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <Stack
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${DrawerWidth}px)`,
        }}
      >
        <HeaderBar onOpenSidebar={handleDrawerToggle} />
        <Stack
          component="main"
          flexGrow={1}
          paddingY={isMobile ? 2 : 3}
          paddingX={isMobile ? 1 : 3}
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          {children}
        </Stack>
      </Stack>
    </Box>
  );
}

const useRouteChange = (onRouteChange: () => void) => {
  const location = useLocation();
  useEffect(() => {
    onRouteChange();
  }, [location, onRouteChange]);
};
