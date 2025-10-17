import { supabase } from "@/supabase/supabaseClient";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, formatISO } from 'date-fns';

type Period = 'today' | 'weekly' | 'monthly';

export type DashboardStats = {
    totalSales: number;
    totalItemsSold: number;
    topSellingProducts: { name: string; quantity: number }[];
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

    if (saleIds.length === 0) {
        return {
            totalSales: 0,
            totalItemsSold: 0,
            topSellingProducts: []
        };
    }

    // Fetch sale items for the sales
    const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('quantity, products ( name )')
        .in('sale_id', saleIds);
    
    if (itemsError) {
        console.error("Error fetching sale items:", itemsError);
        throw itemsError;
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


    return {
        totalSales,
        totalItemsSold,
        topSellingProducts,
    };
}