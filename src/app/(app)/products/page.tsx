import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockProducts } from '@/lib/data';
import { ProductsTable } from './products-table';
import { ProductFormSheet } from './product-form-sheet';

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your products, track stock, and set prices."
      >
        <ProductFormSheet>
            <Button>
                <PlusCircle className="mr-2" />
                Add Product
            </Button>
        </ProductFormSheet>
      </PageHeader>
      
      <ProductsTable data={mockProducts} />
    </>
  );
}
