import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package } from 'lucide-react';

export function LowStockAlerts({ products }: { products: Product[] }) {
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
