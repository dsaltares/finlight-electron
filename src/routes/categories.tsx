import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import Stack from '@mui/material/Stack';
import { Helmet } from 'react-helmet';
import Fab from '@components/Fab';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import EmptyState from '@components/EmptyState';
import AppName from '@lib/appName';
import client from '@lib/client';
import useDialog from '@components/useDialog';
import CategoryList from '@components/CategoryList';
import CreateUpdateCategoryDialog from '@components/CreateUpdateCategoryDialog';

export default function CategoriesPage() {
  const { data: categories, isLoading } = client.getCategories.useQuery();
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();
  const { mutateAsync: createCategory, isPending: isCreating } =
    client.createCategory.useMutation();

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (!categories || categories.length === 0) {
    content = (
      <EmptyState
        Icon={LabelIcon}
      >{`You don't have any categories yet`}</EmptyState>
    );
  } else {
    content = (
      <Stack paddingBottom={5}>
        <CategoryList categories={categories} />
      </Stack>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Categories - ${AppName}`}</title>
      </Helmet>
      {content}
      {isCreateDialogOpen && (
        <CreateUpdateCategoryDialog
          open={isCreateDialogOpen}
          loading={isCreating}
          onClose={onCreateDialogClose}
          onCreate={createCategory}
        />
      )}
      <Fab aria-label="New category" onClick={onCreateDialogOpen}>
        <AddIcon />
      </Fab>
    </>
  );
}
