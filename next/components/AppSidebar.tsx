'use client';

import Image from 'next/image';
import Link from 'next/link';
import type * as React from 'react';
import { NavMain } from '@/components/NavMain';
import { NavUser } from '@/components/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:h-auto! data-[slot=sidebar-menu-button]:overflow-visible data-[slot=sidebar-menu-button]:p-1.5! [&_svg]:size-10!"
            >
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-no-text.svg"
                  alt="Finlight"
                  width={40}
                  height={40}
                />
                <span className="text-2xl font-semibold leading-none">
                  Finlight
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
