import { useCallback, useState } from 'react';

export default function useDialog() {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);
  return {
    open,
    onOpen,
    onClose,
  };
}
