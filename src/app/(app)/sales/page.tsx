import { mockProducts, mockSales } from '@/lib/data';
import { SalesClient } from './sales-client';

export default function SalesPage() {
  return (
    <>
      <SalesClient initialSales={mockSales} products={mockProducts} />
    </>
  );
}
