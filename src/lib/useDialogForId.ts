import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const useDialogForId = (queryParam: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openFor = searchParams.get(queryParam);
  const onOpen = useCallback(
    (id: number) => {
      setSearchParams((prev) => ({ ...prev, [queryParam]: id }));
    },
    [queryParam, setSearchParams],
  );
  const onClose = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(queryParam);
      return newParams;
    });
  }, [queryParam, setSearchParams]);
  return {
    openFor: openFor ? parseInt(openFor, 10) : null,
    open: !!openFor,
    onOpen,
    onClose,
  };
};

export default useDialogForId;
