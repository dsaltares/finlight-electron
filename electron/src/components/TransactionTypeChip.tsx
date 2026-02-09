import PaymentIcon from '@mui/icons-material/Payment';
import PaidIcon from '@mui/icons-material/Paid';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Chip from '@mui/material/Chip';
import type { TransactionType } from '@server/transactions/types';
import LinkWithSearchParams from './LinkWithSearchParams';

type Props = {
  type: TransactionType;
};

export default function TransactionTypeChip({ type }: Props) {
  const icon =
    type === 'Expense' ? (
      <PaymentIcon />
    ) : type === 'Income' ? (
      <PaidIcon />
    ) : (
      <SwapHorizIcon />
    );
  return (
    <LinkWithSearchParams searchParam="filterByType" searchValue={type}>
      <Chip icon={icon} label={type} variant="outlined" clickable />
    </LinkWithSearchParams>
  );
}
