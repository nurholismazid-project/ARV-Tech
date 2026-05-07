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
  totalPrice: number;
}

export interface Transaction {
  id: string;
  date: number;
  items: TransactionItem[];
  totalAmount: number;
  totalProfit: number;
  customerName?: string;
  discountType?: 'percent' | 'nominal';
  discountValue?: number;
  discountAmount?: number;
  downPayment?: number;
  remainingBalance?: number;
  paymentMethod?: 'Tunai' | 'Transfer Bank' | 'E-Wallet';
  paymentProofUrl?: string;
  status: 'Lunas' | 'Belum Lunas' | 'Draf';
  dueDate?: number;
}

export type CustomerReference = 'Offline' | 'Reseller' | 'WhatsApp' | 'Facebook' | 'Instagram' | 'TikTok' | 'Website';

export type ExpenseCategory = 'Operational' | 'Marketing' | 'Salary' | 'Rent' | 'Utilities' | 'Equipment' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  reference?: CustomerReference;
  address?: string;
  updatedAt: number;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalItemsSold: number;
  lowStockItems: Product[];
  recentTransactions: Transaction[];
}
