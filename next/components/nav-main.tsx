"use client";

import {
	IconDashboard,
	IconFileDescription,
	IconFolder,
	type IconProps,
	IconTimelineEventText,
} from "@tabler/icons-react";
import lodash from "lodash";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	type ForwardRefExoticComponent,
	type RefAttributes,
	useMemo,
} from "react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
	name: string;
	url: string;
	icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
};

const NavItems: NavItem[] = [];

export function NavMain() {
	const pathname = usePathname();
	const selectedItemUrl = useMemo(() => {
		const matchingItems = NavItems.filter((item) =>
			pathname.startsWith(item.url),
		);
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
