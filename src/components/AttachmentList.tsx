import List from '@mui/material/List';
import type { Attachment } from '@server/attachments/types';
import AttachmentListItem from './AttachmentListItem';

type Props = {
  attachments: Attachment[];
};

export default function AttachmentList({ attachments }: Props) {
  return (
    <List>
      {attachments.map((attachment) => (
        <AttachmentListItem key={attachment.id} attachment={attachment} />
      ))}
    </List>
  );
}
