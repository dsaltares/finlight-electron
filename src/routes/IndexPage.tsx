import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Routes from '@lib/routes';

export default function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(Routes.accounts, { replace: true });
  }, []);
  return null;
}
