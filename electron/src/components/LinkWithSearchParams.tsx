import type { PropsWithChildren } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

type Props = PropsWithChildren<{
  pathname?: string;
  searchParam: string;
  searchValue: number | string | null | undefined;
}>;

export default function LinkWithSearchParams({
  pathname,
  searchParam,
  searchValue,
  children,
}: Props) {
  const [searchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);
  if (searchValue) {
    newSearchParams.set(searchParam, `${searchValue}`);
  } else {
    newSearchParams.delete(searchParam);
  }
  const search = newSearchParams.toString();

  return (
    <Link
      to={{
        pathname,
        search,
      }}
    >
      {children}
    </Link>
  );
}
