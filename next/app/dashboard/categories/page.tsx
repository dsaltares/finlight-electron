'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Tag } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { toast } from 'sonner';
import CategoryList from '@/components/CategoryList';
import CreateUpdateCategoryDialog from '@/components/CreateUpdateCategoryDialog';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import useDialog from '@/hooks/use-dialog';
import { useTRPC } from '@/lib/trpc';

export default function CategoriesPage() {
  const trpc = useTRPC();
  const [search, setSearch] = useQueryState('q', { defaultValue: '' });
  const { data: categories, isLoading } = useQuery(
    trpc.categories.list.queryOptions(),
  );
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();

  const { mutateAsync: createCategory, isPending: isCreating } = useMutation(
    trpc.categories.create.mutationOptions({
      onSuccess: () => {
        toast.success('Category created.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to create category. ${error.message}`
            : 'Failed to create category.',
        );
      },
    }),
  );

  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      if (category.name.toLowerCase().includes(query)) return true;
      return category.importPatterns.some((pattern) =>
        pattern.toLowerCase().includes(query),
      );
    });
  }, [categories, search]);

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex w-full justify-center items-center h-full">
        <Spinner />
      </div>
    );
  } else if (!categories || categories.length === 0) {
    content = (
      <EmptyState Icon={Tag}>You don't have any categories yet.</EmptyState>
    );
  } else if (filteredCategories.length === 0) {
    content = (
      <EmptyState Icon={Tag}>No categories match your search.</EmptyState>
    );
  } else {
    content = <CategoryList categories={filteredCategories} />;
  }

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex shrink-0 flex-row items-center gap-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full"
        />
        <Button onClick={onCreateDialogOpen}>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {content}
      </div>

      <CreateUpdateCategoryDialog
        open={isCreateDialogOpen}
        loading={isCreating}
        onClose={onCreateDialogClose}
        onCreate={createCategory}
      />
    </div>
  );
}
