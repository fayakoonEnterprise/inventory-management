
'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/supabase/types';

type Settings = Database['public']['Tables']['settings']['Row'];

function AppSkeleton() {
  return (
    <div className="flex min-h-screen w-screen bg-muted/40">
      <div className="hidden md:block">
        <div className="h-svh w-[16rem] p-2">
            <div className="flex h-full w-full flex-col bg-sidebar rounded-lg border-sidebar-border shadow p-2 gap-2">
                <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden p-2">
                    <div className="flex w-full min-w-0 flex-col gap-1">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-sidebar text-sidebar-foreground px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full">
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const getSessionAndSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        setLoading(false);
        router.push('/login');
        return;
      }

      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      } else {
        setSettings(settingsData);
      }
      
      setLoading(false);
    };

    getSessionAndSettings();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          router.push('/login');
        }
      }
    );

    const settingsListener = supabase
        .channel('public:settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
            if(payload.new) {
                setSettings(payload.new as Settings);
            }
        })
        .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(settingsListener);
    };
  }, [router]);

  if (loading) {
    return <AppSkeleton />;
  }

  if (!session) {
    return null; // or a loading spinner, but router.push should handle it
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen bg-muted/40">
        <Sidebar>
          <AppSidebar shopName={settings?.shop_name} loading={loading} />
        </Sidebar>
        <div className="flex flex-col flex-1">
           <AppHeader session={session} shopName={settings?.shop_name} />
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
