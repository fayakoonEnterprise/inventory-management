import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen bg-muted/40">
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col flex-1">
           <AppHeader />
           <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="w-full">
                {children}
            </div>
           </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
