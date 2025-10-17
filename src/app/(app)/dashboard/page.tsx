'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Activity, ShoppingBag, BarChart3, DollarSign } from 'lucide-react';
import { getDashboardStats, getTotalRevenue } from '@/lib/dashboard-data';
import type { DashboardStats } from '@/lib/dashboard-data';
import { TopProductsChart } from './top-products-chart';
import { LowStockAlerts } from './low-stock-alerts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function CurrencyIcon() {
    return <span className="text-muted-foreground text-sm">PKR</span>;
}

function DashboardSkeleton() {
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/2 mt-2" />
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

type Period = 'today' | 'weekly' | 'monthly';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<Period>('today');


  const fetchDashboardData = useCallback(async (currentPeriod: Period) => {
    setLoading(true);
    const [data, revenue] = await Promise.all([
        getDashboardStats(currentPeriod),
        getTotalRevenue()
    ]);
    setStats(data);
    setTotalRevenue(revenue);
    setLoading(false);
  }, []);

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
  }, []);
  
  useEffect(() => {
    fetchDashboardData(period);
  }, [period, fetchDashboardData]);

  useEffect(() => {
    const handleDbChanges = async () => {
        await fetchDashboardData(period);
        await fetchLowStockProducts();
    }

    const productChannel = supabase
      .channel('product-stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          handleDbChanges();
        }
      )
      .subscribe();
      
    const salesChannel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        (payload) => {
           handleDbChanges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(salesChannel);
    };
  }, [period, fetchDashboardData, fetchLowStockProducts]);

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }
  
  const handlePeriodChange = (value: string) => {
    setPeriod(value as Period);
  }

  const periodTitles = {
    today: "Today's Stats",
    weekly: "This Week's Stats",
    monthly: "This Month's Stats",
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{periodTitles[period]}</h1>
        <Tabs defaultValue="today" className="w-auto" onValueChange={handlePeriodChange} value={period}>
            <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="monthly">This Month</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales ({period})</CardTitle>
            <CurrencyIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold ({period})</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItemsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product ({period})</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.topSellingProducts[0]?.name || 'N/A'}</div>
             <p className="text-xs text-muted-foreground">{stats.topSellingProducts[0]?.quantity || 0} units sold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products ({period})</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <TopProductsChart data={stats.topSellingProducts} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts ({lowStockProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlerts products={lowStockProducts} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
