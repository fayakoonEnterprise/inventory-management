'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, PlusCircle, Settings } from 'lucide-react';
import { SaleFormSheet } from '@/app/(app)/sales/sale-form-sheet';
import { mockProducts } from '@/lib/data';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <SaleFormSheet products={mockProducts}>
          <Button size="sm">
            <PlusCircle className="mr-2" />
            Register Sale
          </Button>
        </SaleFormSheet>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/settings">
            <Settings />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
