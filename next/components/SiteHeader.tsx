'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';

const RouteTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/accounts': 'Accounts',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/categories': 'Categories',
  '/dashboard/import-presets': 'Import Presets',
  '/dashboard/insights': 'Insights',
  '/dashboard/budget': 'Budget',
  '/dashboard/exchange-rates': 'Exchange Rates',
  '/dashboard/settings': 'Settings',
};

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = useMemo(() => {
    const matchingRoutes = Object.keys(RouteTitleMap).filter((route) =>
      pathname.startsWith(route),
    );
    const sortedRoutes = matchingRoutes.toSorted((a, b) => b.length - a.length);
    if (sortedRoutes.length > 0) {
      return RouteTitleMap[sortedRoutes[0]];
    }
    return 'Page title';
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-background flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
