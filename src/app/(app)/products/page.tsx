import { mockProducts } from '@/lib/data';
import { ProductsTable } from './products-table';

export default function ProductsPage() {
  return (
    <>
      <ProductsTable data={mockProducts} />
    </>
  );
}
