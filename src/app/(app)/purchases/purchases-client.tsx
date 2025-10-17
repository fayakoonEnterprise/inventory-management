'use client';

import type { PurchaseWithItems, Product } from '@/lib/types';
import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
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
  initialPurchases: PurchaseWithItems[];
  products: Product[];
  onDateChange: (sales: PurchaseWithItems[]) => void;
};

export function PurchasesClient({ initialPurchases, products, onDateChange }: PurchasesClientProps) {
  const [date, setDate] = useState<Date>(new Date());

  const handleDateChange = async (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const { data, error } = await supabase
        .from('purchases')
        .select(`
            *,
            purchase_items (
                quantity,
                cost_price,
                products (
                    id,
                    name
                )
            )
        `)
        .eq('purchase_date', format(newDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases for date:', error);
        onDateChange([]);
      } else {
        onDateChange(data as PurchaseWithItems[]);
      }
    }
  };
  
  const totalPurchases = initialPurchases.reduce((acc, purchase) => acc + (purchase.total_amount || 0), 0);

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
                <TableHead>Time</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPurchases.length > 0 ? (
                initialPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="even:bg-muted/50">
                    <TableCell className="font-medium">
                        <div className="text-sm text-muted-foreground">{format(new Date(purchase.created_at!), 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell>{purchase.supplier_name}</TableCell>
                    <TableCell>
                      {purchase.purchase_items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity} x {item.products?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(purchase.total_amount || 0)}</TableCell>
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
