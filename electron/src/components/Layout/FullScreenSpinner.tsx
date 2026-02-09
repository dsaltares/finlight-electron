import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

export default function FullScreenSpinner() {
  return (
    <Stack
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Stack>
  );
}
