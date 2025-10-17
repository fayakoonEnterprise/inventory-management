
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
            date = startOfWeek(now);
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
