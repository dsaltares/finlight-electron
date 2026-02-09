import type { OverridableComponent } from '@mui/material/OverridableComponent';
import Stack from '@mui/material/Stack';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import type { PropsWithChildren } from 'react';

type Props = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
};

export default function EmptyState({
  Icon,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Stack padding={3} gap={1} alignItems="center">
      <Typography color="text.secondary">
        <Icon sx={{ width: 42, height: 42 }} />
      </Typography>
      <Typography>{children}</Typography>
    </Stack>
  );
}
