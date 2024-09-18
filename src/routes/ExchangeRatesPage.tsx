import { Helmet } from 'react-helmet';
import SettingsIcon from '@mui/icons-material/Settings';
import CalculateIcon from '@mui/icons-material/Calculate';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import client from '@lib/client';
import AppName from '@lib/appName';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import ExchangeRatesTable from '@components/ExchangeRatesTable';
import EmptyState from '@components/EmptyState';
import Fab from '@components/Fab';
import useDialog from '@components/useDialog';
import ExchangeRatesSettingsDialog from '@components/ExchangeRatesSettingsDialog';
import { PolygonApiKeySettingName } from '@lib/getPolygonRates';
import ExchangeRateCalculatorDialog from '@components/ExchangeRateCalculatorDialog';
import RefreshRatesButton from '@components/RefreshRatesButton';

export default function ExchangeRatesPage() {
  const { data: polygonKeyValue } = client.getValue.useQuery({
    key: PolygonApiKeySettingName,
  });
  const { data: rates, isLoading } = client.getExchangeRates.useQuery();
  const { mutateAsync: updateValue, isPending: isUpdatingSettings } =
    client.updateValue.useMutation();
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const {
    open: isSettingsDialogOpen,
    onOpen: onSettingsDialogOpen,
    onClose: onSettingsDialogClose,
  } = useDialog();
  const {
    open: isCalculatorDialogOpen,
    onOpen: onCalculatorDialogOpen,
    onClose: onCalculatorDialogClose,
  } = useDialog();

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (rates && rates.length > 0) {
    content = <ExchangeRatesTable rates={rates || []} />;
  } else {
    content = (
      <EmptyState Icon={CurrencyExchangeIcon}>
        No exchange rates found.
      </EmptyState>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Exchange Rates - ${AppName}`}</title>
      </Helmet>
      <Stack gap={2} height="100%">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={3}
        >
          <TextField
            placeholder="Search..."
            value={filtersByField.rateSearch || ''}
            onChange={(e) => setFilters({ rateSearch: e.target.value })}
            size="small"
            fullWidth
          />
          <Stack direction="row" gap={1}>
            <IconButton color="primary" disabled={!rates}>
              <CalculateIcon onClick={onCalculatorDialogOpen} />
            </IconButton>
            <RefreshRatesButton />
            <IconButton color="primary">
              <SettingsIcon onClick={onSettingsDialogOpen} />
            </IconButton>
          </Stack>
        </Stack>
        {content}
        {isSettingsDialogOpen && (
          <ExchangeRatesSettingsDialog
            open={isSettingsDialogOpen}
            loading={isUpdatingSettings}
            apiKey={polygonKeyValue?.value}
            onClose={onSettingsDialogClose}
            onUpdate={updateValue}
          />
        )}
        {isCalculatorDialogOpen && rates && (
          <ExchangeRateCalculatorDialog
            open={isCalculatorDialogOpen}
            onClose={onCalculatorDialogClose}
            rates={rates}
          />
        )}
      </Stack>
      <Fab aria-label="New rate">
        <AddIcon />
      </Fab>
    </>
  );
}
