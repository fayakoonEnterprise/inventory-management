import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">{title}</h1>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
