'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Activity } from 'lucide-react';
import {
  getTodaysSales,
  getTotalRevenue,
  getTopSellingProducts,
  mockProducts
} from '@/lib/data';
import { TopProductsChart } from './top-products-chart';
import { LowStockAlerts } from './low-stock-alerts';
import { Skeleton } from '@/components/ui/skeleton';

function CurrencyIcon() {
    return <span className="text-muted-foreground text-sm">PKR</span>;
}

function DashboardSkeleton() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/2 mt-2" />
                            <Skeleton className="h-3 w-1/3 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <Skeleton className="h-[350px] w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <Skeleton className="h-9 w-9" />
                                    <div className="ml-4 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const todaysSales = getTodaysSales();
  const totalRevenue = getTotalRevenue();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const topSellingProducts = getTopSellingProducts(5);

  const fetchLowStockProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('stock', 'lte', 'low_stock_limit');

    if (error) {
      console.error('Error fetching low stock products:', error);
    } else {
      setLowStockProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLowStockProducts();

    const channel = supabase
      .channel('product-stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product stock change detected:', payload);
          fetchLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLowStockProducts]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <CurrencyIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CurrencyIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">items needing attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <TopProductsChart data={topSellingProducts} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlerts products={lowStockProducts} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
