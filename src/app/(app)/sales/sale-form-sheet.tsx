'use client';

import type { ReactNode } from 'react';
import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Product } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Printer } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReactToPrint } from 'react-to-print';
import { InvoicePreview } from './invoice-preview';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/supabase/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const saleItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number(),
  // For UI display only
  name: z.string(),
  total: z.coerce.number(),
  stock: z.number().optional(),
});

const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

type UiSaleItem = z.infer<typeof saleItemSchema>;

type SaleFormSheetProps = {
  children: ReactNode;
  products: Product[];
  onSaleAdded: () => void;
};

export function SaleFormSheet({ children, products, onSaleAdded }: SaleFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [submittedSale, setSubmittedSale] = useState<{items: UiSaleItem[], total: number} | null>(null);
  const invoiceRef = useRef(null);
  const { toast } = useToast();
  
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchItems = form.watch('items');
  const totalAmount = watchItems.reduce((sum, item) => sum + (item.total || 0), 0);
  
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  async function onSubmit(values: SaleFormValues) {
    const total_amount = values.items.reduce((sum, item) => sum + item.total, 0);

    // 1. Create the sale record
    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
            sale_date: format(new Date(), 'yyyy-MM-dd'),
            total_amount: total_amount,
            payment_type: 'cash', // default
        })
        .select()
        .single();

    if (saleError || !saleData) {
        toast({ variant: 'destructive', title: 'Error creating sale', description: saleError.message });
        return;
    }

    // 2. Create sale_items records
    const saleItemsToInsert = values.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

    if (itemsError) {
        toast({ variant: 'destructive', title: 'Error saving sale items', description: itemsError.message });
        // Optionally, delete the created sale record for consistency
        await supabase.from('sales').delete().eq('id', saleData.id);
        return;
    }
    
    // 3. Update stock for each product
    const stockUpdatePromises = values.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const newStock = (product?.stock || 0) - item.quantity;
        return supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
    });

    const stockUpdateResults = await Promise.all(stockUpdatePromises);
    const stockUpdateError = stockUpdateResults.find(res => res.error);
    if(stockUpdateError) {
       toast({ variant: 'destructive', title: 'Error updating stock', description: stockUpdateError.error?.message });
       // This is a partial failure, you might want to handle this case more gracefully
    }


    toast({ title: 'Sale Recorded', description: 'The sale has been successfully recorded.' });
    setSubmittedSale({ items: values.items, total: total_amount});
    onSaleAdded(); // Refresh the sales list
  }
  
  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset({ items: []});
      setSubmittedSale(null);
    }
  }

  const handleProductChange = (value: string, index: number) => {
    const product = products.find((p) => p.id === value);
    if (product) {
      const quantity = form.getValues(`items.${index}.quantity`) || 1;
      update(index, {
        product_id: value,
        quantity: quantity,
        price: product.selling_price,
        total: product.selling_price * quantity,
        name: product.name,
        stock: product.stock || 0,
      });
    }
  };
  
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const quantity = Number(event.target.value);
      const price = form.getValues(`items.${index}.price`);
      update(index, { ...form.getValues(`items.${index}`), quantity, total: quantity * price });
  }

  const productOptions = Object.entries(
    products.reduce((acc, product) => {
      const { category } = product;
      if (!category) return acc;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ value: product.id, label: product.name });
      return acc;
    }, {} as Record<string, { value: string; label: string }[]>)
  ).map(([category, products]) => ({
    label: category,
    options: products,
  }));


  if (submittedSale) {
    const invoiceSale = {
      items: submittedSale.items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, total: i.total }))
    }
    return (
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
         <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Invoice Preview</SheetTitle>
            <SheetDescription>Review the generated invoice. You can print it or close this panel.</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-1">
            <InvoicePreview ref={invoiceRef} sale={invoiceSale} totalAmount={submittedSale.total} />
          </div>
          <SheetFooter className="pt-6 bg-background">
            <Button variant="outline" onClick={() => handleSheetOpenChange(false)}>Close</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-3xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Sale</SheetTitle>
          <SheetDescription>Select products and quantities to record a new sale.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
            <ScrollArea className="flex-grow pr-6 -mr-6">
                {fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 rounded-lg mt-4">
                        <p className="text-muted-foreground">No items added yet.</p>
                        <p className="text-sm text-muted-foreground">Click "Add Item" to start a sale.</p>
                    </div>
                )}
                <div className="space-y-4">
                {fields.map((field, index) => {
                  const item = watchItems[index];
                  const remainingStock = item && item.stock !== undefined ? item.stock - item.quantity : null;
                  return (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                        <div className="grid gap-2 flex-grow grid-cols-6">
                            <FormField
                                control={form.control}
                                name={`items.${index}.product_id`}
                                render={({ field }) => (
                                <FormItem className="col-span-3">
                                    <FormLabel>Product</FormLabel>
                                     <FormControl>
                                      <Combobox
                                        options={productOptions}
                                        value={field.value}
                                        onValueChange={(value) => { field.onChange(value); handleProductChange(value, index); }}
                                        placeholder="Select a product"
                                        searchPlaceholder="Search products..."
                                        notFoundPlaceholder="No product found."
                                      />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={(e) => {field.onChange(e); handleQuantityChange(e, index);}} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <div className="col-span-1">
                               <FormLabel>Stock Left</FormLabel>
                                <div className={`font-medium text-sm h-10 flex items-center ${remainingStock !== null && remainingStock < 0 ? 'text-destructive' : ''}`}>
                                    {remainingStock !== null ? `${remainingStock} left` : '-'}
                                </div>
                            </div>
                            <div className="col-span-1">
                               <FormLabel>Total</FormLabel>
                                <div className="font-medium text-sm h-10 flex items-center">
                                    PKR {(watchItems[index]?.total || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  );
                })}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ product_id: '', quantity: 1, price: 0, total: 0, name: '', stock: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-6 bg-background">
                <div className="flex justify-between items-center w-full">
                    <div className="text-lg font-medium">
                        Total Amount: <span className="text-primary font-bold">PKR {totalAmount.toFixed(2)}</span>
                    </div>
                    <Button type="submit" disabled={fields.length === 0}>Generate Invoice</Button>
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
