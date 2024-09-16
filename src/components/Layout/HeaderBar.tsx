import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';
import useIsMobile from '@lib/useIsMobile';
import { DrawerWidth } from './constants';

type Props = {
  onOpenSidebar: () => void;
};

const RouteTitles: Record<string, string> = {
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/insights': 'Insights',
  '/importPresets': 'Import Presets',
  '/budget': 'Budget',
  '/exchangeRates': 'Exchange Rates',
};

export default function HeaderBar({ onOpenSidebar }: Props) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  return (
    <>
      <AppBar position="fixed" sx={{ top: 0, left: 0 }}>
        <Toolbar>
          {!isMobile && <Box width={DrawerWidth} />}
          <Stack direction="row" gap={3} alignItems="center">
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={onOpenSidebar}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" component="h1">
              {RouteTitles[pathname]}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
