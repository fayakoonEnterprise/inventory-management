import { PageHeader } from '@/components/page-header';
import { mockProducts, mockSales } from '@/lib/data';
import { SalesClient } from './sales-client';

export default function SalesPage() {
  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view your sales history."
      />
      <SalesClient initialSales={mockSales} products={mockProducts} />
    </>
  );
}
