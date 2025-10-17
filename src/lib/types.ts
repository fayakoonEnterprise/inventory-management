import type { Database } from "@/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];


export type PurchaseItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Purchase = {
  id: string;
  purchaseOrder: string;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  total: number;
};

export type Settings = {
  shopName: string;
  logoUrl: string;
  address: string;
  currency: string;
  taxEnabled: boolean;
};

export type SaleWithItems = Sale & {
    sale_items: Pick<SaleItem, 'quantity'> & {
        products: Pick<Product, 'name'> | null
    }[]
}
