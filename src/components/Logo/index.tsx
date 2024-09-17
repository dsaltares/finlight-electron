import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Routes from '@lib/routes';
import logoUrl from './logo-no-text.svg';

export default function Logo() {
  return (
    <Link to={Routes.home} style={{ textDecoration: 'none' }}>
      <Stack alignItems="center" gap={0.1}>
        <img src={logoUrl} alt="logo" width={100} height={90} />
        <Typography color="primary" fontWeight="bold" sx={{ fontSize: 24 }}>
          FINLIGHT
        </Typography>
      </Stack>
    </Link>
  );
}
