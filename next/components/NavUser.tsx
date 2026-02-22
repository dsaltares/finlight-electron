'use client';

import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import type { User } from 'better-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import authClient from '@/lib/authClient';

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  const name = user.name;
  const avatarFallback = geAvatarFallback(user);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.image ? (
                  <AvatarImage src={user.image} alt={name} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {name ? (
                  <>
                    <span className="truncate font-medium">Demo User</span>
                    <span className="text-muted-foreground truncate text-xs">
                      demo@saltares.dev
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-muted-foreground">
                    demo@saltares.dev
                  </span>
                )}
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/sign-in');
                    },
                  },
                })
              }
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function geAvatarFallback(user: User) {
  if (user.name) {
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  }
  if (user.email) {
    return user.email
      .split('@')[0]
      .split('.')
      .slice(0, 2)
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  }
  return '';
}
