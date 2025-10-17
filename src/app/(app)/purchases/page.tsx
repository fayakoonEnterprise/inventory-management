import { mockProducts, mockPurchases } from '@/lib/data';
import { PurchasesClient } from './purchases-client';

export default function PurchasesPage() {
  return (
    <>
      <PurchasesClient initialPurchases={mockPurchases} products={mockProducts} />
    </>
  );
}
