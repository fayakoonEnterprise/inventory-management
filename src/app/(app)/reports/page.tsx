
'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, Download, Briefcase, Archive, Printer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/supabase/supabaseClient';
import type { Product } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DayEndReportPreview } from './day-end-report-preview';
import { StockReportPreview } from './stock-report-preview';
import { Skeleton } from '@/components/ui/skeleton';

function ReportsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                     <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ReportsPage() {
    const [totalSales, setTotalSales] = useState(0);
    const [totalPurchases, setTotalPurchases] = useState(0);
    const [profit, setProfit] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isDayEndPreviewOpen, setIsDayEndPreviewOpen] = useState(false);
    const [isStockReportPreviewOpen, setIsStockReportPreviewOpen] = useState(false);

    const dayEndReportRef = useRef(null);
    const stockReportRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const salesPromise = supabase.from('sales').select('total_amount');
            const purchasesPromise = supabase.from('purchases').select('total_amount');
            const productsPromise = supabase.from('products').select('*');
            const saleItemsPromise = supabase.from('sale_items').select('quantity, price, products ( purchase_price )');

            const [
                { data: salesData },
                { data: purchaseData },
                { data: productsData },
                { data: saleItemsData, error: saleItemsError }
            ] = await Promise.all([salesPromise, purchasesPromise, productsPromise, saleItemsPromise]);

            const currentTotalSales = salesData?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
            setTotalSales(currentTotalSales);
            
            const currentTotalPurchases = purchaseData?.reduce((acc, p) => acc + (p.total_amount || 0), 0) || 0;
            setTotalPurchases(currentTotalPurchases);
            
            setProducts(productsData || []);

            if (saleItemsError) {
                console.error('Error fetching data for profit calculation:', saleItemsError);
                setProfit(0);
            } else if (saleItemsData) {
                const totalProfit = saleItemsData.reduce((acc: number, item: any) => {
                    const product = item.products;
                    if (product && typeof product.purchase_price === 'number' && typeof item.price === 'number' && typeof item.quantity === 'number') {
                        const profitPerItem = item.price - product.purchase_price;
                        return acc + (profitPerItem * item.quantity);
                    }
                    return acc;
                    }, 0);
                setProfit(totalProfit);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const handlePrintDayEnd = useReactToPrint({ content: () => dayEndReportRef.current });
    const handlePrintStockReport = useReactToPrint({ content: () => stockReportRef.current });
    
    if(loading) {
        return <ReportsSkeleton />;
    }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Day-End Summary</CardTitle>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Sales:</span> <span className="font-medium">PKR {totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Purchases:</span> <span className="font-medium">PKR {totalPurchases.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold text-base"><span>Profit:</span> <span className="text-primary">PKR {profit.toFixed(2)}</span></div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={() => setIsDayEndPreviewOpen(true)}>
                    <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </CardFooter>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Stock Report</CardTitle>
                <Archive className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                <div className="rounded-lg border max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="even:bg-muted/50">
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="text-right">{product.stock}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <CardFooter>
                 <Button className="w-full" onClick={() => setIsStockReportPreviewOpen(true)}>
                    <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </CardFooter>
        </Card>
      </div>

        {/* Day-End Report Dialog */}
        <Dialog open={isDayEndPreviewOpen} onOpenChange={setIsDayEndPreviewOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Day-End Report Preview</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[70vh]">
                    <DayEndReportPreview 
                        ref={dayEndReportRef} 
                        totalSales={totalSales}
                        totalPurchases={totalPurchases}
                        profit={profit}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handlePrintDayEnd}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Stock Report Dialog */}
        <Dialog open={isStockReportPreviewOpen} onOpenChange={setIsStockReportPreviewOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Stock Report Preview</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[70vh]">
                   <StockReportPreview ref={stockReportRef} products={products} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handlePrintStockReport}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
