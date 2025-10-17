

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Briefcase, Archive } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTotalProfit } from '@/lib/dashboard-data';
import { supabase } from '@/supabase/supabaseClient';

export default async function ReportsPage() {
    const { data: salesData } = await supabase.from('sales').select('total_amount');
    const totalSales = salesData?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
    
    const { data: purchaseData } = await supabase.from('purchases').select('total_amount');
    const totalPurchases = purchaseData?.reduce((acc, p) => acc + (p.total_amount || 0), 0) || 0;
    
    const profit = await getTotalProfit();
    
    const { data: productsData } = await supabase.from('products').select('*');
    const products = productsData || [];

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
                    <div className="flex justify-between font-semibold text-base"><span>Profit:</span> <span className="text-accent">PKR {profit.toFixed(2)}</span></div>
                </div>
            </CardContent>
            <CardContent>
                 <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </CardContent>
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
             <CardContent>
                 <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
