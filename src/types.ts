/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Laptop' | 'Computer' | 'Accessories' | 'CCTV' | 'Service';

export interface Product {
  id: string;
  name: string;
  category: Category;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  description?: string;
  updatedAt: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: number;
  items: TransactionItem[];
  totalAmount: number;
  totalProfit: number;
  customerName?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalItemsSold: number;
  lowStockItems: Product[];
  recentTransactions: Transaction[];
}
