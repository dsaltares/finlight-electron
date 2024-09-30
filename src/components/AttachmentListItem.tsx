import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import IconList from 'file-icon-vectors/dist/icons/classic/catalog.json';
import { enqueueSnackbar } from 'notistack';
import ListItemButton from '@mui/material/ListItemButton';
import type { Attachment } from '@server/attachments/types';
import client from '@lib/client';

const IconSet = new Set(IconList);

type Props = {
  attachment: Attachment;
};

const StatusToMessage: Record<string, string> = {
  MISSING: 'File missing!',
};

export default function AttachmentListItem({ attachment }: Props) {
  const { mutate: deleteAttachment, isPending: isDeleting } =
    client.deleteAttachment.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Attachment deleted.',
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to delete attachment. ${e.message}`,
          variant: 'error',
        });
      },
    });

  const { mutate: showItemInFolder } = client.showItemInFolder.useMutation();
  const { mutate: openPath } = client.openPath.useMutation({
    onError: (e) => {
      enqueueSnackbar({
        message: `Failed to open attachment. ${e.message}`,
        variant: 'error',
      });
    },
  });

  const icon = getIcon(attachment);

  return (
    <ListItem disableGutters disablePadding>
      <ListItemButton>
        <ListItemAvatar>
          <span
            className={`fiv-cla fiv-icon-${icon}`}
            style={{ fontSize: '2em' }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={attachment.filename}
          primaryTypographyProps={{
            fontSize: 'small',
          }}
          secondary={
            attachment.status !== 'OK'
              ? StatusToMessage[attachment.status]
              : undefined
          }
          secondaryTypographyProps={{
            fontSize: 'x-small',
            color: 'error',
          }}
        />
        <Stack direction="row" gap={0.5} alignItems="center">
          <IconButton onClick={() => openPath({ attachment })}>
            <FileOpenIcon />
          </IconButton>
          <IconButton onClick={() => showItemInFolder({ attachment })}>
            <FolderOpenIcon />
          </IconButton>
          <IconButton
            disabled={isDeleting}
            onClick={() => deleteAttachment({ id: attachment.id })}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </ListItemButton>
    </ListItem>
  );
}

function getIcon(attachment: Attachment) {
  const extension = attachment.filename.split('.').pop()!;
  if (IconSet.has(extension)) {
    return extension;
  }
  const type = attachment.type.split('/')[0];
  if (IconSet.has(type)) {
    return type;
  }
  return 'blank';
}
