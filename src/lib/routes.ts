const Routes = {
  home: '/',
  notFound: '/404',
  transactions: '/transactions',
  recentTransactions: '/transactions?filterByPeriod=lastMonth',
  transactionsForCategory: (categoryId: number) =>
    `/transactions?filterByCategoryId=${categoryId}&filterByPeriod=lastMonth`,
  transactionsForAccount: (accountId: number) =>
    `/transactions?filterByAccountId=${accountId}&filterByPeriod=lastMonth`,
  accounts: '/accounts',
  insights: '/insights?filterByPeriod=lastMonth',
  budget: '/budget',
  categories: '/categories',
  importPresets: '/importPresets',
};

export default Routes;
