'use client';

import {
  IconArrowsExchange,
  IconBuildingBank,
  IconChartBar,
  IconFileImport,
  IconPigMoney,
  type IconProps,
  IconReceipt2,
  IconSettings,
  IconTags,
} from '@tabler/icons-react';
import lodash from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useMemo,
} from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavItem = {
  name: string;
  url: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
};

const NavItems: NavItem[] = [
  {
    name: 'Accounts',
    url: '/dashboard/accounts',
    icon: IconBuildingBank,
  },
  {
    name: 'Transactions',
    url: '/dashboard/transactions?period=lastMonth',
    icon: IconReceipt2,
  },
  {
    name: 'Categories',
    url: '/dashboard/categories',
    icon: IconTags,
  },
  {
    name: 'Import Presets',
    url: '/dashboard/import-presets',
    icon: IconFileImport,
  },
  {
    name: 'Insights',
    url: '/dashboard/insights',
    icon: IconChartBar,
  },
  {
    name: 'Budget',
    url: '/dashboard/budget',
    icon: IconPigMoney,
  },
  {
    name: 'Exchange Rates',
    url: '/dashboard/exchange-rates',
    icon: IconArrowsExchange,
  },
  {
    name: 'Settings',
    url: '/dashboard/settings',
    icon: IconSettings,
  },
];

export function NavMain() {
  const pathname = usePathname();
  const selectedItemUrl = useMemo(() => {
    const matchingItems = NavItems.filter((item) => {
      const itemPath = item.url.split('?')[0];
      return pathname.startsWith(itemPath);
    });
    const sortedItems = lodash
      .sortBy(matchingItems, (item) => item.url.length)
      .toReversed();
    if (sortedItems.length > 0) {
      return sortedItems[0].url;
    }
    return null;
  }, [pathname]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {NavItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                tooltip={item.name}
                asChild
                isActive={selectedItemUrl === item.url}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
