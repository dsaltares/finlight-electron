import { Helmet } from 'react-helmet';
import Stack from '@mui/material/Stack';
import ErrorIcon from '@mui/icons-material/Error';
import AppName from '@lib/appName';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import client from '@lib/client';
import SettingsForm from '@components/SettingsForm';
import EmptyState from '@components/EmptyState';

export default function SettingsPage() {
  const { data: settings, isLoading } = client.getUserSettings.useQuery();

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (settings) {
    content = (
      <Stack gap={2} paddingBottom={5}>
        <SettingsForm settings={settings} />
      </Stack>
    );
  } else {
    content = (
      <EmptyState Icon={ErrorIcon}>
        There was an issue loading settings
      </EmptyState>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Settings - ${AppName}`}</title>
      </Helmet>
      {content}
    </>
  );
}
