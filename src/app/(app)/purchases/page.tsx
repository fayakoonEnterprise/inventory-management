'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { PurchaseWithItems, Product } from '@/lib/types';
import { PurchasesClient } from './purchases-client';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PurchaseFormSheet } from './purchase-form-sheet';
import { Skeleton } from '@/components/ui/skeleton';

function PurchasesSkeleton() {
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

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<PurchaseWithItems[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPurchasesAndProducts = useCallback(async () => {
        setLoading(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const purchasesPromise = supabase
            .from('purchases')
            .select(`
                *,
                purchase_items (
                    quantity,
                    cost_price,
                    products (
                        id,
                        name
                    )
                )
            `)
            .gte('purchase_date', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });

        const productsPromise = supabase.from('products').select('*');

        const [purchasesResponse, productsResponse] = await Promise.all([purchasesPromise, productsPromise]);

        if (purchasesResponse.error) {
            console.error('Error fetching purchases:', purchasesResponse.error);
        } else {
            setPurchases(purchasesResponse.data as PurchaseWithItems[]);
        }
        
        if (productsResponse.error) {
            console.error('Error fetching products:', productsResponse.error);
        } else {
            setProducts(productsResponse.data);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPurchasesAndProducts();
    }, [fetchPurchasesAndProducts]);

    const handlePurchaseAdded = () => {
        fetchPurchasesAndProducts();
    }

  return (
    <>
      <PageHeader 
        title="Purchases" 
        description="Record and manage all your stock purchases."
      >
        <PurchaseFormSheet products={products} onPurchaseAdded={handlePurchaseAdded}>
            <Button>
                <PlusCircle />
                Record Purchase
            </Button>
        </PurchaseFormSheet>
      </PageHeader>
      {loading ? <PurchasesSkeleton /> : <PurchasesClient initialPurchases={purchases} products={products} onDateChange={setPurchases} />}
    </>
  );
}
