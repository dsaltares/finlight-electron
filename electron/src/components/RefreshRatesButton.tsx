import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CachedIcon from '@mui/icons-material/Cached';
import Tooltip from '@mui/material/Tooltip';
import { enqueueSnackbar } from 'notistack';
import client from '@lib/client';
import { PolygonApiKeySettingName } from '@lib/getPolygonRates';

export default function RefreshRatesButton() {
  const { data: polygonApiKey } = client.getValue.useQuery({
    key: PolygonApiKeySettingName,
  });
  const { mutate: refreshRates, isPending: isRefreshing } =
    client.refreshExchangeRates.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Exchange rates refreshed.',
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to refresh exchange rates. ${e.message}`,
          variant: 'error',
        });
      },
    });
  const handleRefreshRates = () => {
    if (!polygonApiKey) {
      return;
    }
    refreshRates();
  };

  const button = (
    <IconButton
      color="primary"
      onClick={handleRefreshRates}
      disabled={isRefreshing}
    >
      {isRefreshing ? <CircularProgress size={24} /> : <CachedIcon />}
    </IconButton>
  );

  return !polygonApiKey ? (
    <Tooltip title="Provide your Polygon.io API key in settings">
      {button}
    </Tooltip>
  ) : (
    button
  );
}
