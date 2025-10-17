'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { Product, SaleWithItems } from '@/lib/types';
import { SalesClient } from './sales-client';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { SaleFormSheet } from './sale-form-sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function SalesSkeleton() {
    return (
        <div className="rounded-lg border">
            <div className="p-4">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
        </div>
    )
}


export default function SalesPage() {
    const [sales, setSales] = useState<SaleWithItems[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSalesAndProducts = async () => {
        setLoading(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesPromise = supabase
            .from('sales')
            .select(`
                *,
                sale_items (
                    quantity,
                    products (
                        name
                    )
                )
            `)
            .gte('sale_date', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });

        const productsPromise = supabase.from('products').select('*');

        const [salesResponse, productsResponse] = await Promise.all([salesPromise, productsPromise]);

        if (salesResponse.error) {
            console.error('Error fetching sales:', salesResponse.error);
        } else {
            setSales(salesResponse.data as SaleWithItems[]);
        }
        
        if (productsResponse.error) {
            console.error('Error fetching products:', productsResponse.error);
        } else {
            setProducts(productsResponse.data);
        }

        setLoading(false);
    }

    useEffect(() => {
        fetchSalesAndProducts();
    }, []);

    const handleSaleAdded = () => {
        fetchSalesAndProducts();
    }

  return (
    <>
      <PageHeader 
        title="Sales" 
        description="Record and manage all your customer sales."
      >
        <SaleFormSheet products={products} onSaleAdded={handleSaleAdded}>
            <Button>
                <PlusCircle />
                Register Sale
            </Button>
        </SaleFormSheet>
      </PageHeader>
      {loading ? <SalesSkeleton /> : <SalesClient initialSales={sales} products={products} onDateChange={setSales} />}
    </>
  );
}
