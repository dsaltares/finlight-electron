import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { formatAmount } from '@lib/format';

type Props = {
  balance: number;
  currency: string;
};

export default function BalanceCard({ balance, currency }: Props) {
  const theme = useTheme();
  const color = balance > 0 ? 'success.main' : 'error.main';
  const iconSize = 32;
  return (
    <Paper
      sx={{
        paddingX: theme.spacing(2),
        paddingY: theme.spacing(1),
      }}
    >
      <Stack gap={1}>
        <Typography variant="body2">Total balance</Typography>
        <Stack direction="row" gap={2} alignItems="center">
          <Box color={color} sx={{ width: iconSize, height: iconSize }}>
            <AccountBalanceIcon sx={{ width: '100%', height: '100%' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: theme.typography.fontWeightBold }}
            color={color}
          >
            {formatAmount(balance, currency)}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
