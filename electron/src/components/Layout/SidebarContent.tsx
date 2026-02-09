import Stack from '@mui/material/Stack';
import Logo from '@components/Logo';
import NavigationItems from './NavigationItems';

export default function SidebarContent() {
  return (
    <Stack height="100%" paddingTop={4} paddingBottom={1} gap={3}>
      <Stack alignItems="center">
        <Logo />
      </Stack>
      <NavigationItems />
    </Stack>
  );
}
