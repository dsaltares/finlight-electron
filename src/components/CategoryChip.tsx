import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import stringToColor from 'string-to-color';
import Routes from '@lib/routes';
import LinkWithSearchParams from './LinkWithSearchParams';

type Props = {
  id?: number | null;
  name?: string | null;
};

export default function CategoryChip({ id, name }: Props) {
  const theme = useTheme();
  return id && name ? (
    <LinkWithSearchParams
      pathname={Routes.transactions}
      searchParam="filterByCategoryId"
      searchValue={id}
    >
      <Chip
        sx={{
          backgroundColor: stringToColor(name),
          color: theme.palette.getContrastText(stringToColor(name)),
        }}
        label={name}
        clickable
      />
    </LinkWithSearchParams>
  ) : (
    ''
  );
}
