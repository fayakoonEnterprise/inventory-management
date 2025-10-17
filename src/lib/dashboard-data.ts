
import { supabase } from "@/supabase/supabaseClient";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, formatISO } from 'date-fns';
import type { Product } from "./types";

type Period = 'today' | 'weekly' | 'monthly';

export type DashboardStats = {
    totalSales: number;
    totalItemsSold: number;
    topSellingProducts: { name: string; quantity: number }[];
    lowStockProducts: Product[];
}

function getPeriodDates(period: Period) {
    const now = new Date();
    switch (period) {
        case 'today':
            return {
                startDate: formatISO(startOfDay(now)),
                endDate: formatISO(endOfDay(now)),
            };
        case 'weekly':
             return {
                startDate: formatISO(startOfWeek(now)),
                endDate: formatISO(endOfWeek(now)),
            };
        case 'monthly':
             return {
                startDate: formatISO(startOfMonth(now)),
                endDate: formatISO(endOfMonth(now)),
            };
        default:
            return {
                startDate: formatISO(startOfDay(now)),
                endDate: formatISO(endOfDay(now)),
            };
    }
}

export async function getDashboardStats(period: Period): Promise<DashboardStats> {
    const { startDate, endDate } = getPeriodDates(period);

    // Fetch sales within the date range
    const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, total_amount')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);

    if (salesError) {
        console.error("Error fetching sales:", salesError);
        throw salesError;
    }
    
    const saleIds = sales.map(s => s.id);
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

    let saleItems : any[] = [];
    if (saleIds.length > 0) {
        // Fetch sale items for the sales
        const { data: items, error: itemsError } = await supabase
            .from('sale_items')
            .select('quantity, products ( name )')
            .in('sale_id', saleIds);
        
        if (itemsError) {
            console.error("Error fetching sale items:", itemsError);
            throw itemsError;
        }
        saleItems = items;
    }


    const totalItemsSold = saleItems.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate top selling products
    const productSales = new Map<string, { name: string, quantity: number }>();
    saleItems.forEach(item => {
        if (item.products) {
            const productName = item.products.name;
            const existing = productSales.get(productName) || { name: productName, quantity: 0 };
            productSales.set(productName, { ...existing, quantity: existing.quantity + item.quantity });
        }
    });

    const topSellingProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // Fetch low stock products
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*')
      .filter('stock', 'lte', 'low_stock_limit');
    
    if (lowStockError) {
        console.error("Error fetching low stock products:", lowStockError);
        throw lowStockError;
    }

    return {
        totalSales,
        totalItemsSold,
        topSellingProducts,
        lowStockProducts: lowStockProducts || [],
    };
}

export async function getTotalProfit(): Promise<number> {
    const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('quantity, price, products ( purchase_price )');

    if (itemsError) {
        console.error('Error fetching sale items for profit calc:', itemsError);
        return 0;
    }

    if (!saleItems) {
        return 0;
    }

    const totalProfit = saleItems.reduce((sum, item) => {
        const purchasePrice = item.products?.purchase_price || 0;
        const sellingPrice = item.price || 0;
        const quantity = item.quantity || 0;
        const profit = (sellingPrice - purchasePrice) * quantity;
        return sum + profit;
    }, 0);

    return totalProfit;
}
