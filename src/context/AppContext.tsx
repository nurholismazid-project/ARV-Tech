/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Transaction, Category } from '../types';

interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('arv_tech_products');
    const savedTransactions = localStorage.getItem('arv_tech_transactions');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Mock Data if empty
      const mockProducts: Product[] = [
        { id: '1', name: 'Laptop ASUS ROG G16', category: 'Laptop', buyPrice: 15000000, sellPrice: 18500000, stock: 5, updatedAt: Date.now() },
        { id: '2', name: 'CCTV Dahua 2MP Indoor', category: 'CCTV', buyPrice: 250000, sellPrice: 450000, stock: 20, updatedAt: Date.now() },
        { id: '3', name: 'Keyboard Mechanical ARV-K1', category: 'Accessories', buyPrice: 300000, sellPrice: 550000, stock: 15, updatedAt: Date.now() },
        { id: '4', name: 'SSD Samsung 980 Pro 1TB', category: 'Accessories', buyPrice: 1200000, sellPrice: 1650000, stock: 2, updatedAt: Date.now() },
        { id: '5', name: 'PC Gaming ARV Build RTX 4060', category: 'Computer', buyPrice: 10000000, sellPrice: 13500000, stock: 3, updatedAt: Date.now() },
      ];
      setProducts(mockProducts);
    }
    
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('arv_tech_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('arv_tech_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: Date.now() } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      date: Date.now(),
    };

    // Update product stock
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const soldItem = transactionData.items.find((item) => item.productId === product.id);
        if (soldItem) {
          return {
            ...product,
            stock: product.stock - soldItem.quantity,
            updatedAt: Date.now(),
          };
        }
        return product;
      })
    );

    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        transactions,
        addProduct,
        updateProduct,
        deleteProduct,
        addTransaction,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
