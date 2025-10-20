
import type { Database } from "@/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type PurchaseItem = Database["public"]["Tables"]["purchase_items"]["Row"];


export type Settings = {
  shopName: string;
  logoUrl: string;
  address: string;
  currency: string;
  taxEnabled: boolean;
};

export type SaleWithItems = Sale & {
    sale_items: (Pick<SaleItem, 'quantity' | 'price' | 'unit_sold'> & {
        products: Pick<Product, 'id' | 'name'> | null
    })[]
}

export type PurchaseWithItems = Purchase & {
    purchase_items: (Pick<PurchaseItem, 'quantity' | 'cost_price'> & {
        products: Pick<Product, 'id' | 'name'> | null
    })[]
}

    