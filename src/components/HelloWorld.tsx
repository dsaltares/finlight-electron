import client from '@lib/client';

export default function HelloWorld() {
  const { data } = client.helloWorld.useQuery({ name: 'David' });
  return <h1>{data?.message || 'Loading...'}</h1>;
}
