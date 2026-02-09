"use client";

import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:h-auto! data-[slot=sidebar-menu-button]:overflow-visible data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<Link href="/" className="flex items-center gap-2">
								<Image
									src="/logo-no-text.svg"
									alt="Finlight logo"
									width={48}
									height={48}
									className="dark:hidden"
								/>
								<Image
									src="/logo-no-text-dark.svg"
									alt="Finlight logo (dark)"
									width={48}
									height={48}
									className="hidden dark:block"
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
