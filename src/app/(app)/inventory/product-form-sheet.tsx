
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
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  unit: z.string().min(1, { message: 'Unit is required.' }),
  purchase_price: z.coerce.number().min(0, { message: 'Purchase price must be positive.' }),
  selling_price: z.coerce.number().min(0, { message: 'Selling price must be positive.' }),
  stock: z.coerce.number().int({ message: 'Stock must be an integer.' }),
  low_stock_limit: z.coerce.number().int({ message: 'Limit must be an integer.' }),
  is_box_sellable: z.boolean().default(false),
  units_per_box: z.coerce.number().optional(),
  price_per_box: z.coerce.number().optional(),
  price_per_piece: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormSheetProps = {
  children: ReactNode;
  product?: Partial<Product>;
  onProductSaved?: () => void;
};

export function ProductFormSheet({ children, product, onProductSaved }: ProductFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      unit: '',
      purchase_price: 0,
      selling_price: 0,
      stock: 0,
      low_stock_limit: 10,
      is_box_sellable: false,
      units_per_box: undefined,
      price_per_box: undefined,
      price_per_piece: undefined,
    },
  });

  const isBoxSellable = form.watch('is_box_sellable');

  // This effect opens the sheet programmatically if a product name is passed for creation
  useEffect(() => {
    if (product?.name && !product?.id) {
        setOpen(true);
    }
    form.reset({
        name: product?.name || '',
        category: product?.category || '',
        unit: product?.unit || '',
        purchase_price: product?.purchase_price ?? 0,
        selling_price: product?.selling_price ?? 0,
        stock: product?.stock ?? 0,
        low_stock_limit: product?.low_stock_limit ?? 10,
        is_box_sellable: product?.is_box_sellable ?? false,
        units_per_box: product?.units_per_box ?? undefined,
        price_per_box: product?.price_per_box ?? undefined,
        price_per_piece: product?.price_per_piece ?? undefined,
    })
  }, [product, form])


  async function onSubmit(values: ProductFormValues) {
     const productData = {
      ...values,
    };
    
    const { error } = product?.id
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
        title: product?.id ? 'Product Updated' : 'Product Created',
        description: `${values.name} has been saved successfully.`,
      });
      setOpen(false);
      onProductSaved?.();
    }
  }

  const isEditMode = !!product?.id;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Update the details of your existing product.' : 'Fill in the details for the new product.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            <ScrollArea className="flex-grow pr-6 -mr-6">
              <div className="space-y-4 pb-4">
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
                
                <div className="space-y-4 rounded-lg border p-4">
                    <FormField
                        control={form.control}
                        name="is_box_sellable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                                <FormLabel>Sell in Boxes?</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {isBoxSellable && (
                        <>
                            <FormField
                                control={form.control}
                                name="units_per_box"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Units per Box</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price_per_box"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price per Box</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price_per_piece"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price per Piece</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </>
                    )}
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="pt-4 mt-auto">
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Product'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
