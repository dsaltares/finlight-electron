import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useDialog(queryParam: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const open = !!searchParams.get(queryParam);
  const onOpen = useCallback(() => {
    setSearchParams((prev) => ({ ...prev, [queryParam]: true }));
  }, [queryParam, setSearchParams]);
  const onClose = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(queryParam);
      return newParams;
    });
  }, [queryParam, setSearchParams]);
  return { open, onOpen, onClose };
}

export default useDialog;
