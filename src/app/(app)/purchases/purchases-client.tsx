'use client';

import type { Purchase, Product } from '@/lib/types';
import { useState } from 'react';
import { getPurchasesByDate } from '@/lib/data';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type PurchasesClientProps = {
  initialPurchases: Purchase[];
  products: Product[];
};

export function PurchasesClient({ initialPurchases, products }: PurchasesClientProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [purchases, setPurchases] = useState<Purchase[]>(
    initialPurchases.filter(
      (p) => format(new Date(p.date), 'yyyy-MM-dd') >= format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd')
    )
  );

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const filteredPurchases = getPurchasesByDate(newDate);
      setPurchases(filteredPurchases);
    }
  };
  
  const totalPurchases = purchases.reduce((acc, purchase) => acc + purchase.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };
  
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Purchases on {format(date, 'PPP')}</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'outline'}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(date, 'PPP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="even:bg-muted/50">
                    <TableCell className="font-medium">
                        <div>{purchase.purchaseOrder}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(purchase.date), 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>
                      {purchase.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity} x {getProductName(item.productId)}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(purchase.total)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No purchases recorded for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
       <CardFooter className="flex justify-end gap-4 items-center pt-6">
        <div className="font-semibold text-lg">Total Purchases:</div>
        <div className="font-bold text-xl text-primary">{formatCurrency(totalPurchases)}</div>
      </CardFooter>
    </Card>
  );
}
