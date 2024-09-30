import '@fontsource/roboto-mono/300.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import '@styles/global.css';
import 'file-icon-vectors/dist/file-icon-classic.min.css';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { SnackbarProvider } from 'notistack';
import theme from '@styles/theme';
import TRPCProvider from '@components/TRPCProvider';
import Root from '@routes/RootPage';
import ErrorPage from '@routes/ErrorPage';
import IndexPage from '@routes/IndexPage';
import AccountsPage from '@routes/AccountsPage';
import TransactionsPage from '@routes/TransactionsPage';
import CategoriesPage from '@routes/CategoriesPage';
import ImportPresetsPage from '@routes/ImportPresetsPage';
import InsightsPage from '@routes/InsightsPage';
import BudgetPage from '@routes/BudgetPage';
import ExchangeRatesPage from '@routes/ExchangeRatesPage';
import SettingsPage from '@routes/SettingsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'importPresets', element: <ImportPresetsPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'exchangeRates', element: <ExchangeRatesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          preventDuplicate
          dense
          autoHideDuration={1500}
        >
          <TRPCProvider>
            <Stack
              width="100%"
              sx={{
                '@supports (height: 100dvh)': {
                  height: '100dvh',
                },
                '@supports not (height: 100dvh)': {
                  height: '100vh',
                },
              }}
            >
              <RouterProvider router={router} />
            </Stack>
          </TRPCProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
