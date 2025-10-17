'use client';

import type { Sale, Product } from '@/lib/types';
import { useState } from 'react';
import { getSalesByDate } from '@/lib/data';
import { Calendar as CalendarIcon, FileText } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

type SalesClientProps = {
  initialSales: Sale[];
  products: Product[];
};

export function SalesClient({ initialSales, products }: SalesClientProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [sales, setSales] = useState<Sale[]>(
    initialSales.filter(
      (s) => format(new Date(s.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    )
  );
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // In a real app, you'd fetch this from the server
      const filteredSales = getSalesByDate(newDate);
      setSales(filteredSales);
    }
  };

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales for {format(date, 'PPP')}</CardTitle>
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
                <TableHead>Invoice</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id} className="even:bg-muted/50">
                    <TableCell className="font-medium">
                        <div>{sale.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(sale.date), 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      {sale.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity} x {getProductName(item.productId)}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No sales recorded for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 items-center pt-6">
        <div className="font-semibold text-lg">Total Sales:</div>
        <div className="font-bold text-xl text-primary">{formatCurrency(totalSales)}</div>
      </CardFooter>
    </Card>
  );
}
