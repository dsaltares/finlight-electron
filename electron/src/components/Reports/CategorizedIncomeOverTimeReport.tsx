import type { TimeGranularity } from '@server/reports/types';
import getDateFilter from '@lib/getDateFilter';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import client from '@lib/client';
import NoTransactionsFound from './NoTransactionsFound';
import CategoryOverTimeReport from './CategoryOverTimeReport';

export default function CategorizedIncomeOverTimeReport() {
  const { filtersByField } = useFiltersFromUrl();
  const { data, isLoading: isLoadingReport } =
    client.getBucketedCategoryReport.useQuery({
      type: 'Income',
      date: getDateFilter(filtersByField),
      accounts: filtersByField.accounts?.split(',').map(Number),
      categories: filtersByField.categories?.split(',').map(Number),
      currency: filtersByField.currency,
      granularity: filtersByField.timeGranularity as TimeGranularity,
    });
  const { data: categories, isLoading: isLoadingCategories } =
    client.getCategories.useQuery();
  const currency = filtersByField.currency || 'EUR';

  if (isLoadingReport || isLoadingCategories) {
    return <FullScreenSpinner />;
  } else if (!data || data.length === 0) {
    return <NoTransactionsFound />;
  }

  return (
    <CategoryOverTimeReport
      data={data}
      currency={currency}
      categories={categories}
      numberType="positive"
    />
  );
}
