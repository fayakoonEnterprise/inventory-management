'use client';

import type { Product, SaleWithItems } from '@/lib/types';
import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { Calendar as CalendarIcon, MoreHorizontal, FileText } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SaleReceiptSheet } from './sale-receipt-sheet';


type SalesClientProps = {
  initialSales: SaleWithItems[];
  products: Product[];
  onDateChange: (sales: SaleWithItems[]) => void;
};

export function SalesClient({ initialSales, products, onDateChange }: SalesClientProps) {
  const [date, setDate] = useState<Date>(new Date());
  
  const handleDateChange = async (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            sale_items (
                quantity,
                price,
                products (
                    id,
                    name
                )
            )
        `)
        .eq('sale_date', format(newDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales for date:', error);
        onDateChange([]);
      } else {
        onDateChange(data as SaleWithItems[]);
      }
    }
  };

  const totalSales = initialSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

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
                <TableHead>Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSales.length > 0 ? (
                initialSales.map((sale) => (
                  <TableRow key={sale.id} className="even:bg-muted/50">
                    <TableCell className="font-medium">
                        <div className="text-sm text-muted-foreground">{format(new Date(sale.created_at!), 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      {sale.sale_items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity} x {item.products?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total_amount || 0)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <SaleReceiptSheet sale={sale}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Receipt
                                    </DropdownMenuItem>
                                </SaleReceiptSheet>
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
