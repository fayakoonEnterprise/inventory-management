import type { Database } from "@/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  name: string;
};

export type Sale = {
  id: string;
  invoiceNumber: string;
  date: string;
  items: SaleItem[];
  total: number;
};

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
