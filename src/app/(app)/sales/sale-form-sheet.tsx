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

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number(),
  total: z.coerce.number(),
  name: z.string(), // Added to store product name for invoice
});

const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

type SaleFormSheetProps = {
  children: ReactNode;
  products: Product[];
};

export function SaleFormSheet({ children, products }: SaleFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [submittedSale, setSubmittedSale] = useState<SaleFormValues | null>(null);
  const invoiceRef = useRef(null);
  
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1, unitPrice: 0, total: 0, name: '' }],
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

  function onSubmit(values: SaleFormValues) {
    console.log(values);
    setSubmittedSale(values);
    // In a real app, you would save the sale to the database here.
    // We are not resetting the form immediately to allow for printing.
  }
  
  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setSubmittedSale(null);
    }
  }

  const handleProductChange = (value: string, index: number) => {
    const product = products.find((p) => p.id === value);
    if (product) {
      const quantity = form.getValues(`items.${index}.quantity`);
      update(index, {
        productId: value,
        quantity: quantity,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice * quantity,
        name: product.name,
      });
    }
  };
  
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const quantity = Number(event.target.value);
      const unitPrice = form.getValues(`items.${index}.unitPrice`);
      update(index, { ...form.getValues(`items.${index}`), quantity, total: quantity * unitPrice });
  }

  const productOptions = Object.entries(
    products.reduce((acc, product) => {
      const { category } = product;
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
    return (
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
         <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Invoice Preview</SheetTitle>
            <SheetDescription>Review the generated invoice. You can print it or close this panel.</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-1">
            <InvoicePreview ref={invoiceRef} sale={submittedSale} totalAmount={totalAmount} />
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
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Sale</SheetTitle>
          <SheetDescription>Select products and quantities to record a new sale.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
            <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                        <div className="grid gap-2 flex-grow grid-cols-5">
                            <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
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
                ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, total: 0, name: '' })}
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
                    <Button type="submit">Generate Invoice</Button>
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
