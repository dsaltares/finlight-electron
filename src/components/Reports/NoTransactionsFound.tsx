import SearchOffIcon from '@mui/icons-material/SearchOff';
import EmptyState from '@components/EmptyState';

export default function NoTransactionsFound() {
  return <EmptyState Icon={SearchOffIcon}>No transactions found</EmptyState>;
}
