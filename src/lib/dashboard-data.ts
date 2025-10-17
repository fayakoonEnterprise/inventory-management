
import { supabase } from "@/supabase/supabaseClient";
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns';
import type { Database } from "./types";

type Period = 'today' | 'weekly' | 'monthly';

export type DashboardStats = Database['public']['Views']['dashboard_metrics']['Row'];

function getPeriodDateString(period: Period): string {
    const now = new Date();
    let date;
    switch (period) {
        case 'today':
            date = startOfDay(now);
            break;
        case 'weekly':
            // Explicitly set Monday as the start of the week to match PostgreSQL's `date_trunc`
            date = startOfWeek(now, { weekStartsOn: 1 });
            break;
        case 'monthly':
            date = startOfMonth(now);
            break;
        default:
            date = startOfDay(now);
    }
    return format(date, 'yyyy-MM-dd');
}


export async function getDashboardStats(period: Period): Promise<DashboardStats> {
    const dateString = getPeriodDateString(period);
    const dateColumn = period === 'today' ? 'day' : period === 'weekly' ? 'week' : 'month';

    const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq(dateColumn, dateString)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        console.error(`Error fetching dashboard stats:`, error.message);
        throw new Error(`Error fetching dashboard stats: ${error.message}`);
    }

    if (!data) {
        return {
            day: null,
            generated_on: null,
            month: null,
            week: null,
            total_revenue: 0,
            total_profit: 0,
            total_items_sold: 0,
            top_3_products: null
        }
    }

    return data;
}

export async function getTotalProfit(): Promise<number> {
    const { data: saleItems, error } = await supabase
      .from('sale_items')
      .select(`
        quantity,
        price,
        products (
          purchase_price
        )
      `);
  
    if (error) {
      console.error('Error fetching data for profit calculation:', error);
      return 0;
    }
  
    if (!saleItems) {
      return 0;
    }
  
    const totalProfit = saleItems.reduce((acc, item: any) => {
      const product = item.products;
      if (product && typeof product.purchase_price === 'number' && typeof item.price === 'number' && typeof item.quantity === 'number') {
        const profitPerItem = item.price - product.purchase_price;
        return acc + (profitPerItem * item.quantity);
      }
      return acc;
    }, 0);
  
    return totalProfit;
}
