
'use client';

import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
import { PlusCircle, Trash2, Printer, Box } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReactToPrint } from 'react-to-print';
import { InvoicePreview } from './invoice-preview';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/supabase/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const saleItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number(),
  unit_sold: z.enum(['pcs', 'box']).default('pcs'),
  // For UI display only
  name: z.string(),
  total: z.coerce.number(),
  stock: z.number().optional(),
  is_box_sellable: z.boolean().optional(),
  price_per_piece: z.number().optional(),
  price_per_box: z.number().optional(),
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
  
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.total || 0), 0);
  
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  async function onSubmit(values: SaleFormValues) {
    const total_amount = values.items.reduce((sum, item) => sum + item.total, 0);

    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
            sale_date: format(new Date(), 'yyyy-MM-dd'),
            total_amount: total_amount,
            payment_type: 'cash',
        })
        .select()
        .single();

    if (saleError || !saleData) {
        toast({ variant: 'destructive', title: 'Error creating sale', description: saleError.message });
        return;
    }

    const saleItemsToInsert = values.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        unit_sold: item.unit_sold,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert as any);

    if (itemsError) {
        toast({ variant: 'destructive', title: 'Error saving sale items', description: itemsError.message });
        await supabase.from('sales').delete().eq('id', saleData.id);
        return;
    }
    
    // IMPORTANT: Stock update is now handled by a database trigger.
    // The client-side stock update logic has been removed.

    toast({ title: 'Sale Recorded', description: 'The sale has been successfully recorded.' });
    const uiItems = values.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        name: product?.name || 'Unknown',
      }
    })
    setSubmittedSale({ items: uiItems, total: total_amount});
    onSaleAdded(); 
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
      const initialUnit = 'pcs';
      const price = product.is_box_sellable ? product.price_per_piece : product.selling_price;
      
      update(index, {
        product_id: value,
        quantity: quantity,
        price: price || 0,
        total: (price || 0) * quantity,
        name: product.name,
        stock: product.stock || 0,
        is_box_sellable: product.is_box_sellable || false,
        price_per_box: product.price_per_box || 0,
        price_per_piece: product.price_per_piece || 0,
        unit_sold: initialUnit,
      });
    }
  };

  const handleUnitChange = (unit: 'pcs' | 'box', index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) return;

    const price = unit === 'box' ? product.price_per_box : product.price_per_piece;
    const quantity = currentItem.quantity || 1;
    
    update(index, {
      ...currentItem,
      unit_sold: unit,
      price: price || 0,
      total: (price || 0) * quantity,
    });
  }
  
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const quantity = Number(event.target.value);
      const currentItem = form.getValues(`items.${index}`);
      update(index, { ...currentItem, quantity, total: quantity * (currentItem.price || 0) });
  }

  const productOptions = Object.entries(
    products.reduce((acc, product) => {
      const { category } = product;
      if (!category) return acc;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ value: product.id, label: product.name, hasBox: product.is_box_sellable });
      return acc;
    }, {} as Record<string, { value: string; label: string, hasBox?: boolean | null }[]>)
  ).map(([category, products]) => ({
    label: category,
    options: products,
  }));


  if (submittedSale) {
    const invoiceSale = {
      items: submittedSale.items.map(i => ({ name: `${i.name} (${i.unit_sold})`, quantity: i.quantity, unitPrice: i.price, total: i.total }))
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
      <SheetContent className="sm:max-w-4xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Sale</SheetTitle>
          <SheetDescription>Select products and quantities to record a new sale.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-hidden">
            <ScrollArea className="flex-grow pr-6 -mr-6">
                {fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 rounded-lg mt-4">
                        <p className="text-muted-foreground">No items added yet.</p>
                        <p className="text-sm text-muted-foreground">Click "Add Item" to start a sale.</p>
                    </div>
                )}
                <div className="space-y-4">
                {fields.map((field, index) => {
                  const item = watchedItems[index];
                  const remainingStock = item && item.stock !== undefined ? item.stock - item.quantity : null;
                  return (
                    <div key={field.id} className="flex items-start gap-2 p-3 border rounded-lg">
                        <div className="grid gap-x-2 gap-y-4 flex-grow grid-cols-12">
                            <FormField
                                control={form.control}
                                name={`items.${index}.product_id`}
                                render={({ field }) => (
                                <FormItem className="col-span-12 md:col-span-4">
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
                            {item?.is_box_sellable && (
                              <FormField
                                control={form.control}
                                name={`items.${index}.unit_sold`}
                                render={({ field }) => (
                                  <FormItem className="col-span-12 md:col-span-3">
                                    <FormLabel>Unit</FormLabel>
                                    <FormControl>
                                       <RadioGroup
                                          onValueChange={(value: 'pcs' | 'box') => { field.onChange(value); handleUnitChange(value, index); }}
                                          defaultValue={field.value}
                                          className="flex items-center space-x-2 h-10"
                                        >
                                          <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                              <RadioGroupItem value="pcs" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Piece</FormLabel>
                                          </FormItem>
                                          <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                              <RadioGroupItem value="box" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Box</FormLabel>
                                          </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                            <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                <FormItem className={cn("col-span-4 md:col-span-1", item?.is_box_sellable && "md:col-start-8")}>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} onChange={(e) => {field.onChange(e); handleQuantityChange(e, index);}} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <div className="col-span-4 md:col-span-2 text-center">
                               <FormLabel>Stock Left</FormLabel>
                                <div className={`font-medium text-sm h-10 flex items-center justify-center ${remainingStock !== null && remainingStock < 0 ? 'text-destructive' : ''}`}>
                                    {item.stock !== undefined ? `${item.stock} in stock` : '-'}
                                </div>
                            </div>
                            <div className="col-span-4 md:col-span-2 text-center">
                               <FormLabel>Total</FormLabel>
                                <div className="font-medium text-sm h-10 flex items-center justify-center">
                                    PKR {(item?.total || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-6">
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
                    onClick={() => append({ product_id: '', quantity: 1, price: 0, total: 0, name: '', stock: 0, unit_sold: 'pcs', is_box_sellable: false })}
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

    

    