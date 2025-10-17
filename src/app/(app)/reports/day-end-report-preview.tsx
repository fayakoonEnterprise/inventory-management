
'use client';

import React from 'react';
import { FayakoonLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

type DayEndReportPreviewProps = {
    totalSales: number;
    totalPurchases: number;
    profit: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
};

export const DayEndReportPreview = React.forwardRef<HTMLDivElement, DayEndReportPreviewProps>(({ totalSales, totalPurchases, profit }, ref) => {
    const reportDate = new Date();

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans text-sm">
            <style>
                {`@media print {
                    body { -webkit-print-color-adjust: exact; }
                    .print-container {
                        padding: 2rem;
                    }
                }`}
            </style>
            <div className="print-container">
                <header className="flex justify-between items-center pb-4 border-b border-gray-300">
                    <div className="flex items-center gap-4">
                        <FayakoonLogo className="w-12 h-12 text-gray-800" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Fayakoon</h1>
                            <p className="text-xs text-gray-600">123 Market St, SF, CA</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-800">Day-End Summary Report</h2>
                        <p className="text-xs text-gray-600">Date: {reportDate.toLocaleDateString()}</p>
                    </div>
                </header>

                <main className="my-8">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-base">
                                    <span className="text-gray-600">Total Sales Revenue:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(totalSales)}</span>
                                </div>
                                <div className="flex justify-between items-center text-base">
                                    <span className="text-gray-600">Total Purchases Cost:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(totalPurchases)}</span>
                                </div>
                                <Separator className="my-2 bg-gray-300" />
                                <div className="flex justify-between items-center text-xl">
                                    <span className="font-bold text-gray-900">Gross Profit:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(profit)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                    <p>Generated on: {reportDate.toLocaleString()}</p>
                    <p>This is an automatically generated report.</p>
                </footer>
            </div>
        </div>
    );
});

DayEndReportPreview.displayName = 'DayEndReportPreview';
