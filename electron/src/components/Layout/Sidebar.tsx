import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useIsMobile from '@lib/useIsMobile';
import SidebarContent from './SidebarContent';
import { DrawerWidth } from './constants';

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: '90%',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  ) : (
    <Box
      component="nav"
      sx={{
        width: { sm: DrawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DrawerWidth,
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
