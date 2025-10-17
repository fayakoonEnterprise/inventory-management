import type { Product, Sale, Purchase, Settings } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format } from 'date-fns';

const productImages = PlaceHolderImages.filter(img => img.id.startsWith('product-'));

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Quantum HD-Display', category: 'Electronics', unit: 'pcs', purchasePrice: 350, sellingPrice: 499.99, stock: 50, lowStockLimit: 10, imageUrl: productImages[0]?.imageUrl || '' },
  { id: 'prod-2', name: 'AcousticPro Headphones', category: 'Audio', unit: 'pcs', purchasePrice: 80, sellingPrice: 149.99, stock: 120, lowStockLimit: 20, imageUrl: productImages[1]?.imageUrl || '' },
  { id: 'prod-3', name: 'ErgoFlow Mouse', category: 'Peripherals', unit: 'pcs', purchasePrice: 25, sellingPrice: 49.99, stock: 8, lowStockLimit: 15, imageUrl: productImages[2]?.imageUrl || '' },
  { id: 'prod-4', name: 'Gourmet Coffee Beans', category: 'Groceries', unit: 'kg', purchasePrice: 15, sellingPrice: 29.99, stock: 200, lowStockLimit: 30, imageUrl: productImages[3]?.imageUrl || '' },
  { id: 'prod-5', name: 'Zen Garden Desk Set', category: 'Office', unit: 'set', purchasePrice: 30, sellingPrice: 59.99, stock: 75, lowStockLimit: 10, imageUrl: productImages[4]?.imageUrl || '' },
  { id: 'prod-6', name: 'Eco-Friendly Water Bottle', category: 'Kitchen', unit: 'pcs', purchasePrice: 5, sellingPrice: 14.99, stock: 5, lowStockLimit: 25, imageUrl: productImages[5]?.imageUrl || '' },
];

export const mockSales: Sale[] = [
  { id: 'sale-1', invoiceNumber: 'INV-2024001', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), items: [{ productId: 'prod-1', quantity: 2, unitPrice: 499.99, total: 999.98 }, { productId: 'prod-3', quantity: 1, unitPrice: 49.99, total: 49.99 }], total: 1049.97 },
  { id: 'sale-2', invoiceNumber: 'INV-2024002', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), items: [{ productId: 'prod-2', quantity: 5, unitPrice: 149.99, total: 749.95 }], total: 749.95 },
  { id: 'sale-3', invoiceNumber: 'INV-2024003', date: new Date().toISOString(), items: [{ productId: 'prod-4', quantity: 3, unitPrice: 29.99, total: 89.97 }, { productId: 'prod-6', quantity: 10, unitPrice: 14.99, total: 149.90 }], total: 239.87 },
];

export const mockPurchases: Purchase[] = [
    { id: 'pur-1', purchaseOrder: 'PO-2024001', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), supplier: 'TechSupplies Inc.', items: [{ productId: 'prod-1', quantity: 20, unitPrice: 350, total: 7000 }], total: 7000 },
    { id: 'pur-2', purchaseOrder: 'PO-2024002', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), supplier: 'AudioWarehouse', items: [{ productId: 'prod-2', quantity: 50, unitPrice: 80, total: 4000 }], total: 4000 },
];

export const mockSettings: Settings = {
    shopName: 'ShopStock',
    logoUrl: PlaceHolderImages.find(img => img.id === 'shop-logo')?.imageUrl || '',
    address: '123 Market St, Suite 456, San Francisco, CA 94103',
    currency: 'PKR',
    taxEnabled: true
};

export const getTodaysSales = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return mockSales
        .filter(sale => format(new Date(sale.date), 'yyyy-MM-dd') === today)
        .reduce((sum, sale) => sum + sale.total, 0);
};

export const getTotalRevenue = () => {
    return mockSales.reduce((sum, sale) => sum + sale.total, 0);
};

export const getTopSellingProducts = (limit: number = 5) => {
    const productSales = new Map<string, { name: string, quantity: number }>();
    mockSales.forEach(sale => {
        sale.items.forEach(item => {
            const product = mockProducts.find(p => p.id === item.productId);
            if (product) {
                const existing = productSales.get(item.productId) || { name: product.name, quantity: 0 };
                productSales.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
            }
        });
    });
    return Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
};

export const getLowStockProducts = () => {
    return mockProducts.filter(p => p.stock <= p.lowStockLimit);
};

export const getSalesByDate = (date: Date) => {
    const selectedDate = format(date, 'yyyy-MM-dd');
    return mockSales.filter(sale => format(new Date(sale.date), 'yyyy-MM-dd') === selectedDate);
}

export const getPurchasesByDate = (date: Date) => {
    const selectedDate = format(date, 'yyyy-MM-dd');
    return mockPurchases.filter(purchase => format(new Date(purchase.date), 'yyyy-MM-dd') === selectedDate);
}
