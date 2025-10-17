
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/supabase/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ProductFormSheet } from '../inventory/product-form-sheet';

const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  cost_price: z.coerce.number().min(0, 'Price must be positive'),
  total: z.coerce.number(),
});

const purchaseSchema = z.object({
  supplier_name: z.string().min(2, 'Supplier name is required'),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

type PurchaseFormSheetProps = {
  children: ReactNode;
  products: Product[];
  onPurchaseAdded: () => void;
};

export function PurchaseFormSheet({ children, products, onPurchaseAdded }: PurchaseFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [productToCreate, setProductToCreate] = useState<string | null>(null);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier_name: '',
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const totalAmount = fields.reduce((sum, item, index) => {
    const total = form.getValues(`items.${index}.total`);
    return sum + (total || 0);
  }, 0);


  async function onSubmit(values: PurchaseFormValues) {
    const total_amount = values.items.reduce((sum, item) => sum + item.total, 0);

    // 1. Create the purchase record
    const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
            purchase_date: format(new Date(), 'yyyy-MM-dd'),
            supplier_name: values.supplier_name,
            total_amount: total_amount,
        })
        .select()
        .single();

    if (purchaseError || !purchaseData) {
        toast({ variant: 'destructive', title: 'Error creating purchase', description: purchaseError.message });
        return;
    }

    // 2. Create purchase_items records
    const purchaseItemsToInsert = values.items.map(item => ({
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
    }));

    const { error: itemsError } = await supabase.from('purchase_items').insert(purchaseItemsToInsert);

    if (itemsError) {
        toast({ variant: 'destructive', title: 'Error saving purchase items', description: itemsError.message });
        await supabase.from('purchases').delete().eq('id', purchaseData.id);
        return;
    }
    
    // 3. Update stock for each product
    const stockUpdatePromises = values.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const newStock = (product?.stock || 0) + item.quantity;
        return supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
    });

    const stockUpdateResults = await Promise.all(stockUpdatePromises);
    const stockUpdateError = stockUpdateResults.find(res => res.error);
    if(stockUpdateError) {
       toast({ variant: 'destructive', title: 'Error updating stock', description: stockUpdateError.error?.message });
    }

    toast({ title: 'Purchase Recorded', description: 'The purchase has been successfully recorded and stock updated.' });
    setOpen(false);
    onPurchaseAdded();
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  }

  const handleProductChange = (value: string, index: number) => {
    const product = products.find((p) => p.id === value);
    if (product) {
      const quantity = form.getValues(`items.${index}.quantity`) || 1;
      update(index, {
        product_id: value,
        quantity: quantity,
        cost_price: product.purchase_price,
        total: product.purchase_price * quantity,
      });
    }
  };
  
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, fieldName: 'quantity' | 'cost_price') => {
      const value = Number(event.target.value);
      const currentItem = form.getValues(`items.${index}`);
      const quantity = fieldName === 'quantity' ? value : currentItem.quantity;
      const cost_price = fieldName === 'cost_price' ? value : currentItem.cost_price;
      update(index, { ...currentItem, [fieldName]: value, total: quantity * cost_price });
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

  const handleProductCreate = (productName: string) => {
    setProductToCreate(productName);
  }

  const handleProductSaved = () => {
      onPurchaseAdded(); // This will refetch products
      setProductToCreate(null); // Close the product form
  }

  return (
    <>
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
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
                    name="supplier_name"
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

                {fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 rounded-lg mt-4">
                        <p className="text-muted-foreground">No items added yet.</p>
                        <p className="text-sm text-muted-foreground">Click "Add Item" to start recording a purchase.</p>
                    </div>
                )}
                <div className="space-y-4">
                {fields.map((field, index) => (
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
                                        onCreate={handleProductCreate}
                                        placeholder="Select or create a product"
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
                                        <Input type="number" min="1" {...field} onChange={(e) => {field.onChange(e); handleFieldChange(e, index, 'quantity');}} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`items.${index}.cost_price`}
                                render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Unit Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} onChange={(e) => {field.onChange(e); handleFieldChange(e, index, 'cost_price');}} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="col-span-1">
                               <FormLabel>Total</FormLabel>
                                <div className="font-medium text-sm h-10 flex items-center">
                                    PKR {(form.getValues(`items.${index}.total`) || 0).toFixed(2)}
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
                    onClick={() => append({ product_id: '', quantity: 1, cost_price: 0, total: 0 })}
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
                    <Button type="submit" disabled={fields.length === 0}>Record Purchase</Button>
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    {productToCreate && (
         <ProductFormSheet 
            onProductSaved={handleProductSaved}
            product={{ name: productToCreate } as Product}
         >
            {/* This is a dummy trigger, the sheet is controlled by `productToCreate` state */}
            <></>
        </ProductFormSheet>
    )}
    </>
  );
}
