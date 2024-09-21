import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Stack from '@mui/material/Stack';
import { Helmet } from 'react-helmet';
import { enqueueSnackbar } from 'notistack';
import client from '@lib/client';
import Fab from '@components/Fab';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import EmptyState from '@components/EmptyState';
import AppName from '@lib/appName';
import useDialog from '@components/useDialog';
import CSVImportPresetList from '@components/CSVImportPresetList';
import CreateUpdateCSVImportPresetDialog from '@components/CreateUpdateCSVImportPresetDialog';

export default function ImportPresetsPage() {
  const { data: presets, isLoading } = client.getCSVImportPresets.useQuery();
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();
  const { mutateAsync: createCSVImportPreset, isPending: isCreating } =
    client.createCSVImportPreset.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Import preset created.',
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to create import preset. ${e.message}`,
          variant: 'error',
        });
      },
    });

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (!presets || presets.length === 0) {
    content = (
      <EmptyState
        Icon={FileUploadIcon}
      >{`You don't have any import presets yet.`}</EmptyState>
    );
  } else {
    content = (
      <Stack paddingBottom={5}>
        <CSVImportPresetList presets={presets} />
      </Stack>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Import presets - ${AppName}`}</title>
      </Helmet>
      {content}
      {isCreateDialogOpen && (
        <CreateUpdateCSVImportPresetDialog
          open={isCreateDialogOpen}
          loading={isCreating}
          onClose={onCreateDialogClose}
          onCreate={createCSVImportPreset}
        />
      )}
      <Fab aria-label="New preset" onClick={onCreateDialogOpen}>
        <AddIcon />
      </Fab>
    </>
  );
}
