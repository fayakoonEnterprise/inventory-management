'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { FayakoonLogo } from '@/components/icons';

type InvoicePreviewProps = {
  sale: { items: { name: string; quantity: number; unitPrice: number; total: number }[] };
  totalAmount: number;
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ sale, totalAmount }, ref) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  return (
    <div ref={ref} className="p-4 bg-white text-black text-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <FayakoonLogo className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-xl font-bold font-headline">Fayakoon</h1>
                <p className="text-xs text-gray-600">123 Market St, SF, CA</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Invoice</h2>
          <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <Separator className="my-4 bg-gray-300" />
      
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-black">Item</TableHead>
            <TableHead className="text-center text-black">Quantity</TableHead>
            <TableHead className="text-right text-black">Unit Price</TableHead>
            <TableHead className="text-right text-black">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Separator className="my-4 bg-gray-300" />
      
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tax (0%):</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <Separator className="my-2 bg-gray-300"/>
          <div className="flex justify-between font-bold text-base">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Thank you for your business!</p>
        <p>Fayakoon POS</p>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
