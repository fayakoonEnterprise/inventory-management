export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockLimit: number;
  imageUrl: string;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
