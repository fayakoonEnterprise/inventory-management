'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { ProductsTable } from './products-table';
import type { Product } from '@/lib/types';
import { ProductFormSheet } from './product-form-sheet';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ProductsSkeleton() {
    return (
        <div className="rounded-lg border">
            <div className="p-4">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
       <PageHeader 
        title="Inventory" 
        description="Manage your inventory and product catalog."
      >
        <ProductFormSheet onProductSaved={fetchProducts}>
            <Button>
                <PlusCircle />
                Add Product
            </Button>
        </ProductFormSheet>
      </PageHeader>
      {loading ? <ProductsSkeleton /> : <ProductsTable data={products} onProductSaved={fetchProducts} />}
    </>
  );
}
