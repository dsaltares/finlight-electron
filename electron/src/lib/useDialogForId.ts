import { useCallback, useState } from 'react';

const useDialogForId = () => {
  const [openFor, setOpenFor] = useState<number | null>(null);
  const onOpen = useCallback((id: number) => setOpenFor(id), [setOpenFor]);
  const onClose = useCallback(() => setOpenFor(null), [setOpenFor]);
  return {
    openFor,
    open: !!openFor,
    onOpen,
    onClose,
  };
};

export default useDialogForId;
