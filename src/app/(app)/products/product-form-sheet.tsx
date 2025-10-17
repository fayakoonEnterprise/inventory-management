'use client';

import type { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Product } from '@/lib/types';
import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  unit: z.string().min(1, { message: 'Unit is required.' }),
  purchase_price: z.coerce.number().min(0, { message: 'Purchase price must be positive.' }),
  selling_price: z.coerce.number().min(0, { message: 'Selling price must be positive.' }),
  stock: z.coerce.number().int({ message: 'Stock must be an integer.' }),
  low_stock_limit: z.coerce.number().int({ message: 'Limit must be an integer.' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormSheetProps = {
  children: ReactNode;
  product?: Product;
  products: Product[];
};

export function ProductFormSheet({ children, product, products }: ProductFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        category: product.category || '',
        unit: product.unit || '',
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: product.stock || 0,
        low_stock_limit: product.low_stock_limit || 10,
    } : {
      name: '',
      category: '',
      unit: '',
      purchase_price: 0,
      selling_price: 0,
      stock: 0,
      low_stock_limit: 10,
    },
  });

  async function onSubmit(values: ProductFormValues) {
     const productData = {
      ...values,
      // The DB schema doesn't have imageUrl, so we don't submit it.
      // The UI will temporarily use a placeholder.
    };
    
    const { data, error } = product
      ? await supabase.from('products').update(productData).eq('id', product.id)
      : await supabase.from('products').insert([productData]);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error saving product',
        description: error.message,
      });
    } else {
      toast({
        title: product ? 'Product Updated' : 'Product Created',
        description: `${values.name} has been saved successfully.`,
      });
      setOpen(false);
      // You'll want to refresh the data on the page here
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{product ? 'Edit Product' : 'Add New Product'}</SheetTitle>
          <SheetDescription>
            {product ? 'Update the details of your existing product.' : 'Fill in the details for the new product.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Quantum HD-Display" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. pcs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="low_stock_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="pt-4">
              <Button type="submit">{product ? 'Save Changes' : 'Create Product'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
