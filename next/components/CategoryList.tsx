'use client';

import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import useDialogForId from '@/hooks/useDialogForId';
import { type RouterOutput, useTRPC } from '@/lib/trpc';
import CategoryListItem from './CategoryListItem';
import ConfirmationDialog from './ConfirmationDialog';
import CreateUpdateCategoryDialog from './CreateUpdateCategoryDialog';

type Category = RouterOutput['categories']['list'][number];

type Props = {
  categories: Category[];
};

export default function CategoryList({ categories }: Props) {
  const trpc = useTRPC();
  const {
    openFor,
    open: deleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDialogForId();

  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation(
    trpc.categories.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Category deleted.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to delete category. ${error.message}`
            : 'Failed to delete category.',
        );
      },
    }),
  );

  const handleDelete = async () => {
    if (!openFor) return;
    await deleteCategory({ id: openFor });
  };

  const {
    openFor: updateCategoryId,
    open: isUpdateDialogOpen,
    onOpen: onUpdateDialogOpen,
    onClose: onUpdateDialogClose,
  } = useDialogForId();

  const categoryToUpdate = useMemo(
    () => categories.find((category) => category.id === updateCategoryId),
    [categories, updateCategoryId],
  );

  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation(
    trpc.categories.update.mutationOptions({
      onSuccess: () => {
        toast.success('Category updated.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to update category. ${error.message}`
            : 'Failed to update category.',
        );
      },
    }),
  );

  return (
    <>
      <ul className="m-0 min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-0">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryListItem
              category={category}
              onUpdate={onUpdateDialogOpen}
              onDelete={onDeleteOpen}
            />
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        id="delete-category"
        title="Delete category"
        open={deleteOpen}
        loading={isDeleting}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete this category? This action cannot be
          undone and all related transactions will be uncategorised.
        </p>
      </ConfirmationDialog>

      {categoryToUpdate ? (
        <CreateUpdateCategoryDialog
          category={categoryToUpdate}
          open={isUpdateDialogOpen}
          loading={isUpdating}
          onClose={onUpdateDialogClose}
          onUpdate={updateCategory}
        />
      ) : null}
    </>
  );
}
