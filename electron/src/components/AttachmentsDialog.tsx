import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { enqueueSnackbar } from 'notistack';
import client from '@lib/client';
import FullScreenSpinner from './Layout/FullScreenSpinner';
import AttachmentList from './AttachmentList';
import EmptyState from './EmptyState';

const id = 'attachments-dialog';

type Props = {
  transactionId: number;
  open: boolean;
  onClose: () => void;
};

export default function AttachmentsDialog({
  transactionId,
  open,
  onClose,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { data: attachments, isLoading } = client.getAttachments.useQuery({
    transactionId,
  });
  const { mutate: createAttachments, isPending: isUploading } =
    client.createAttachment.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Attachments uploaded.',
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to upload attachments. ${e.message}`,
          variant: 'error',
        });
      },
    });

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (!attachments || attachments.length === 0) {
    content = (
      <EmptyState Icon={FileUploadIcon}>
        This transaction doesn't have any attachments yet.
      </EmptyState>
    );
  } else {
    content = <AttachmentList attachments={attachments} />;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen={fullScreen}
      keepMounted={false}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id={`${id}-title`}>Transaction attachments</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => createAttachments({ transactionId })}
          disabled={isUploading}
          startIcon={<FileUploadIcon />}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
