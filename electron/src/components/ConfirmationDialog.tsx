import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { PropsWithChildren } from 'react';

type Props = {
  id: string;
  title: string;
  open: boolean;
  loading: boolean;
  onConfirm: () => void | Promise<unknown>;
  onClose: () => void;
};

export default function ConfirmationDialog({
  id,
  title,
  open,
  loading,
  onConfirm,
  onClose,
  children,
}: PropsWithChildren<Props>) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen={fullScreen}
      keepMounted={false}
    >
      <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          loading={loading}
          onClick={handleConfirm}
        >
          Confirm
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
