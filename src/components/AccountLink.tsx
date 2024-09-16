import Routes from '@lib/routes';
import LinkWithSearchParams from './LinkWithSearchParams';

type Props = {
  id: number;
  name: string;
};

export default function AccountLink({ id, name }: Props) {
  return (
    <LinkWithSearchParams
      pathname={Routes.transactions}
      searchParam="filterByAccountId"
      searchValue={id}
    >
      {name}
    </LinkWithSearchParams>
  );
}
