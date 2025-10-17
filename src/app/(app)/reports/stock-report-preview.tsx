
'use client';

import React from 'react';
import type { Product } from '@/lib/types';
import { ShopStockLogo } from '@/components/icons';

type StockReportPreviewProps = {
    products: Product[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
};


export const StockReportPreview = React.forwardRef<HTMLDivElement, StockReportPreviewProps>(({ products }, ref) => {
    const reportDate = new Date();
    const totalStockValue = products.reduce((acc, p) => acc + (p.stock || 0) * p.selling_price, 0);
    const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans text-sm">
             <style>
                {`@media print {
                    body { -webkit-print-color-adjust: exact; }
                    .print-container {
                        padding: 2rem;
                    }
                    .print-table th, .print-table td {
                        padding: 8px 12px;
                    }
                    .print-table thead {
                        background-color: #f3f4f6;
                    }
                }`}
            </style>
            <div className="print-container">
                <header className="flex justify-between items-center pb-4 border-b border-gray-300">
                    <div className="flex items-center gap-4">
                        <ShopStockLogo className="w-12 h-12 text-gray-800" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">ShopStock</h1>
                            <p className="text-xs text-gray-600">123 Market St, SF, CA</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-800">Inventory Stock Report</h2>
                        <p className="text-xs text-gray-600">Date: {reportDate.toLocaleDateString()}</p>
                    </div>
                </header>

                <main className="my-8">
                     <table className="w-full text-left border-collapse print-table">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="p-2 font-semibold">Product Name</th>
                                <th className="p-2 font-semibold">Category</th>
                                <th className="p-2 font-semibold text-right">Current Stock</th>
                                <th className="p-2 font-semibold text-right">Selling Price</th>
                                <th className="p-2 font-semibold text-right">Stock Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b even:bg-gray-50">
                                    <td className="p-2">{product.name}</td>
                                    <td className="p-2">{product.category}</td>
                                    <td className="p-2 text-right">{product.stock} {product.unit}</td>
                                    <td className="p-2 text-right">{formatCurrency(product.selling_price)}</td>
                                    <td className="p-2 text-right">{formatCurrency((product.stock || 0) * product.selling_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={2} className="p-2 text-right">Total:</td>
                                <td className="p-2 text-right">{totalStockCount} Items</td>
                                <td colSpan={2} className="p-2 text-right">{formatCurrency(totalStockValue)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>

                <footer className="pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                    <p>Generated on: {reportDate.toLocaleString()}</p>
                    <p>This is an automatically generated report.</p>
                </footer>
            </div>
        </div>
    );
});

StockReportPreview.displayName = 'StockReportPreview';

