'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/supabase/supabaseClient';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, PlusCircle, LogOut } from 'lucide-react';
import { SaleFormSheet } from '@/app/(app)/sales/sale-form-sheet';
import { mockProducts } from '@/lib/data';

export function AppHeader({ session }: { session: Session | null }) {
  const router = useRouter();
  const user = session?.user;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-sidebar text-sidebar-foreground px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <SaleFormSheet products={mockProducts}>
          <Button size="sm" variant="outline" className="bg-transparent border-sidebar-border hover:bg-sidebar-accent">
            <PlusCircle className="mr-2" />
            Register Sale
          </Button>
        </SaleFormSheet>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-sidebar-accent">
          <Bell />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-sidebar-accent">
               <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.name} />
                  <AvatarFallback>{user?.user_metadata.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                <div className="text-sm font-medium">{user?.user_metadata.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center w-full">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
