'use client';

import type { ReactNode } from 'react';
import { useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { InvoicePreview } from './invoice-preview';
import type { SaleWithItems } from '@/lib/types';

type SaleReceiptSheetProps = {
  children: ReactNode;
  sale: SaleWithItems;
};

export function SaleReceiptSheet({ children, sale }: SaleReceiptSheetProps) {
  const [open, setOpen] = useState(false);
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const invoiceData = {
    items: sale.sale_items.map(item => ({
        name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
    })),
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Invoice Preview</SheetTitle>
          <SheetDescription>
            Review the generated invoice. You can print it or close this panel.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-1">
          <InvoicePreview
            ref={invoiceRef}
            sale={invoiceData}
            totalAmount={sale.total_amount || 0}
          />
        </div>
        <SheetFooter className="pt-6 bg-background">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
