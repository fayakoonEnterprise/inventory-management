import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockProducts, mockSales } from '@/lib/data';
import { SalesClient } from './sales-client';
import { SaleFormSheet } from './sale-form-sheet';

export default function SalesPage() {
  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view your sales history."
      >
        <SaleFormSheet products={mockProducts}>
            <Button>
                <PlusCircle className="mr-2" />
                Add Sale
            </Button>
        </SaleFormSheet>
      </PageHeader>
      
      <SalesClient initialSales={mockSales} products={mockProducts} />
    </>
  );
}
