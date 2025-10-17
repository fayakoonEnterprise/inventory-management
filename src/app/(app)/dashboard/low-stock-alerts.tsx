import type { Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
          <Avatar className="h-9 w-9">
            <AvatarImage src={product.imageUrl} alt={product.name} />
            <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.stock} units left (limit: {product.lowStockLimit})
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Button asChild size="sm" variant="outline">
                <Link href={`/products?product=${product.id}`}>
                    Restock
                </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
