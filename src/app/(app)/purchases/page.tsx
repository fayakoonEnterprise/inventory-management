import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockProducts, mockPurchases } from '@/lib/data';
import { PurchasesClient } from './purchases-client';
import { PurchaseFormSheet } from './purchase-form-sheet';

export default function PurchasesPage() {
  return (
    <>
      <PageHeader
        title="Purchases"
        description="Record new stock purchases and view your purchase history."
      >
        <PurchaseFormSheet products={mockProducts}>
          <Button>
            <PlusCircle className="mr-2" />
            Add Purchase
          </Button>
        </PurchaseFormSheet>
      </PageHeader>

      <PurchasesClient initialPurchases={mockPurchases} products={mockProducts} />
    </>
  );
}
