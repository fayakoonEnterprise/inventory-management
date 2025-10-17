'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  total: z.coerce.number(),
});

const purchaseSchema = z.object({
  supplier: z.string().min(2, 'Supplier name is required'),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

type PurchaseFormSheetProps = {
  children: ReactNode;
  products: Product[];
};

export function PurchaseFormSheet({ children, products }: PurchaseFormSheetProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchItems = form.watch('items');
  const totalAmount = watchItems.reduce((sum, item) => sum + (item.total || 0), 0);

  function onSubmit(values: PurchaseFormValues) {
    console.log(values);
    setOpen(false);
    form.reset();
  }

  const handleProductChange = (value: string, index: number) => {
    const product = products.find((p) => p.id === value);
    if (product) {
      const quantity = form.getValues(`items.${index}.quantity`);
      update(index, {
        productId: value,
        quantity: quantity,
        unitPrice: product.purchasePrice,
        total: product.purchasePrice * quantity,
      });
    }
  };
  
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, fieldName: 'quantity' | 'unitPrice') => {
      const value = Number(event.target.value);
      const currentItem = form.getValues(`items.${index}`);
      const quantity = fieldName === 'quantity' ? value : currentItem.quantity;
      const unitPrice = fieldName === 'unitPrice' ? value : currentItem.unitPrice;
      update(index, { ...currentItem, [fieldName]: value, total: quantity * unitPrice });
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if(!isOpen) form.reset(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-3xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Purchase</SheetTitle>
          <SheetDescription>Record new stock received from a supplier.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
            <ScrollArea className="flex-grow pr-6 -mr-6">
                <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                    <FormItem className="mb-4">
                        <FormLabel>Supplier Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. TechSupplies Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                        <div className="grid gap-2 flex-grow grid-cols-6">
                            <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field }) => (
                                <FormItem className="col-span-3">
                                    <FormLabel>Product</FormLabel>
                                    <Select onValueChange={(value) => { field.onChange(value); handleProductChange(value, index); }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
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
                                        <Input type="number" {...field} onChange={(e) => {field.onChange(e); handleFieldChange(e, index, 'quantity');}} />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Unit Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} onChange={(e) => {field.onChange(e); handleFieldChange(e, index, 'unitPrice');}} />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            <div className="col-span-1">
                               <FormLabel>Total</FormLabel>
                                <div className="font-medium text-sm h-10 flex items-center">
                                    ${(watchItems[index]?.total || 0).toFixed(2)}
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
                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, total: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-6 bg-background">
                <div className="flex justify-between items-center w-full">
                    <div className="text-lg font-medium">
                        Total Amount: <span className="text-primary font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <Button type="submit">Record Purchase</Button>
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
