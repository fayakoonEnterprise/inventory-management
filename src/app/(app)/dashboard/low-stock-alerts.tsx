'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function LowStockAlertsSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function LowStockAlerts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLowStockProducts = useCallback(async () => {
        setLoading(true);
        // This is the correct way to call a function that performs a column-to-column comparison.
        const { data, error } = await supabase.rpc('get_low_stock_products');

        if (error) {
            // Log the error for client-side debugging
            console.error("Error fetching low stock products:", error.message);
            setProducts([]);
        } else {
            // The result from an RPC call is not strongly typed by default
            // so we cast it to Product[]
            setProducts((data as Product[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLowStockProducts();

        const channel = supabase
            .channel('low-stock-realtime-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                console.log('Product change detected, re-checking low stock products.');
                fetchLowStockProducts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchLowStockProducts]);

    if (loading) {
        return <LowStockAlertsSkeleton />;
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-muted-foreground">🎉 All products have sufficient stock!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
        {products.map((product) => (
            <div key={product.id} className="flex items-center">
            <Package className="h-9 w-9 text-muted-foreground" />
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                {product.stock} units left (limit: {product.low_stock_limit})
                </p>
            </div>
            <div className="ml-auto font-medium">
                <Button asChild size="sm" variant="outline">
                    <Link href={`/inventory?product=${product.id}`}>
                        Restock
                    </Link>
                </Button>
            </div>
            </div>
        ))}
        </div>
    );
}
