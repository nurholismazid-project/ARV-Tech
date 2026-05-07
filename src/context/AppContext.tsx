/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Transaction, Category, Customer, Expense } from '../types';
import { translations, Language, TranslationKey } from '../translations';
import { supabase as initialSupabase, getSupabaseClient } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  expenses: Expense[];
  language: Language;
  isLoading: boolean;
  isConnected: boolean;
  setLanguage: (lang: Language) => void;
  updateSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  t: (key: TranslationKey) => string;
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [language, setLanguageState] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>(initialSupabase);

  // Load from Supabase with localStorage fallback
  const initializeData = useCallback(async (client: SupabaseClient = supabaseClient) => {
    setIsLoading(true);
    try {
      // Helper for deduplication
      const deduplicate = <T extends { id: string }>(arr: T[]): T[] => {
        return arr.filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id)
        );
      };

      // Test connection
      const { error: healthError } = await client.from('products').select('id').limit(1);
      
      // If healthError is missing relation, it means connected but no tables
      const isActuallyConnected = !healthError || healthError.code === 'PGRST116' || healthError.message.includes('relation "products" does not exist');
      setIsConnected(isActuallyConnected);

      // 1. Fetch Products
      const { data: productsData, error: productsError } = await client
        .from('products')
        .select('*');
      
      let finalProducts: Product[] = [];
      if (productsData && productsData.length > 0) {
        finalProducts = deduplicate(productsData);
      } else {
        const savedProductsStr = localStorage.getItem('arv_tech_products');
        const savedProductsSource = savedProductsStr ? JSON.parse(savedProductsStr) : [];
        if (savedProductsSource && savedProductsSource.length > 0) {
          finalProducts = deduplicate(savedProductsSource);
        } else {
          // Sample Initial Data matching user screenshot
          finalProducts = [
            { id: crypto.randomUUID(), name: 'Laptop ASUS ROG G16', description: 'Intel Core i9, RTX 4060, 16GB RAM', buyPrice: 15000000, sellPrice: 18500000, stock: 4, category: 'Laptop', updatedAt: Date.now() },
            { id: crypto.randomUUID(), name: 'SSD Samsung 980 Pro 1TB', description: 'NVMe Gen4 M.2 SSD', buyPrice: 1200000, sellPrice: 1650000, stock: 2, category: 'Accessories', updatedAt: Date.now() },
            { id: crypto.randomUUID(), name: 'PC Gaming ARV Build RTX 4060', description: 'Custom ARV Gaming Rig', buyPrice: 10000000, sellPrice: 13500000, stock: 3, category: 'Computer', updatedAt: Date.now() },
            { id: crypto.randomUUID(), name: 'CCTV Hikvision 5MP', description: 'Outdoor IP Camera', buyPrice: 450000, sellPrice: 650000, stock: 15, category: 'CCTV', updatedAt: Date.now() },
            { id: crypto.randomUUID(), name: 'Service Laptop Standard', description: 'Cleaning & Thermal Paste', buyPrice: 0, sellPrice: 150000, stock: 99, category: 'Service', updatedAt: Date.now() },
          ];
        }
      }
      setProducts(finalProducts);

      // 2. Fetch Transactions
      const { data: transactionsData, error: transactionsError } = await client
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      let finalTransactions: Transaction[] = [];
      if (transactionsData && transactionsData.length > 0) {
        finalTransactions = deduplicate(transactionsData);
      } else {
        const savedTransactionsStr = localStorage.getItem('arv_tech_transactions');
        const savedTransactionsSource = savedTransactionsStr ? JSON.parse(savedTransactionsStr) : [];
        if (savedTransactionsSource && savedTransactionsSource.length > 0) {
          finalTransactions = deduplicate(savedTransactionsSource);
        } else {
          // Sample Initial Data matching user screenshot
          finalTransactions = [
            {
              id: crypto.randomUUID(),
              date: Date.now(),
              totalAmount: 18500000,
              totalProfit: 3500000,
              customerName: 'Budi Santoso',
              status: 'Lunas',
              items: [
                {
                  productId: finalProducts[0].id,
                  name: finalProducts[0].name,
                  quantity: 1,
                  price: 18500000,
                  totalPrice: 18500000
                }
              ]
            }
          ];
        }
      }
      setTransactions(finalTransactions);

      // 3. Fetch Customers
      const { data: customersData, error: customersError } = await client
        .from('customers')
        .select('*');
      
      if (customersData && customersData.length > 0) {
        setCustomers(deduplicate(customersData));
      } else {
        const savedCustomers = localStorage.getItem('arv_tech_customers');
        if (savedCustomers) setCustomers(deduplicate(JSON.parse(savedCustomers)));
      }

      // 4. Fetch Expenses
      const { data: expensesData, error: expensesError } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (expensesData && expensesData.length > 0) {
        setExpenses(deduplicate(expensesData));
      } else {
        const savedExpenses = localStorage.getItem('arv_tech_expenses');
        if (savedExpenses) setExpenses(deduplicate(JSON.parse(savedExpenses)));
      }

    } catch (error) {
      console.error('Database error:', error);
      setIsConnected(false);
      const savedProducts = localStorage.getItem('arv_tech_products');
      const savedTransactions = localStorage.getItem('arv_tech_transactions');
      const savedExpenses = localStorage.getItem('arv_tech_expenses');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } finally {
      const savedLanguage = localStorage.getItem('arv_tech_language') as Language;
      if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
      setIsLoading(false);
    }
  }, [supabaseClient]);

  const updateSupabaseConfig = async (url: string, key: string) => {
    try {
      // Use getSupabaseClient(url, key) which has persistSession: false
      const newClient = getSupabaseClient(url, key);
      const { error } = await newClient.from('products').select('id').limit(1);
      
      const isOkay = !error || error.code === 'PGRST116' || error.message.includes('relation "products" does not exist');
      
      if (isOkay) {
        localStorage.setItem('arv_tech_supabase_url', url);
        localStorage.setItem('arv_tech_supabase_key', key);
        setIsConnected(true);
        
        // After saving, we should ideally reload to re-initialize the singleton with new config
        // or we can manually create a new persistent client and set it
        // but to avoid the multiple instance warning, we'd need to destroy the old one if possible.
        // For now, reload is cleanest for a configuration change.
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return true;
      }
      return false;
    } catch (e) {
      setIsConnected(false);
      return false;
    }
  };

  useEffect(() => {
    initializeData(initialSupabase);
  }, [initializeData]);

  // Sync back to local as backup
  useEffect(() => {
    if (!isLoading) {
      // Deduplicate before saving to localStorage
      const deduplicate = <T extends { id: string }>(arr: T[]): T[] => {
        return arr.filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id)
        );
      };

      const cleanProducts = deduplicate(products);
      const cleanTransactions = deduplicate(transactions);
      const cleanCustomers = deduplicate(customers);
      const cleanExpenses = deduplicate(expenses);

      localStorage.setItem('arv_tech_products', JSON.stringify(cleanProducts));
      localStorage.setItem('arv_tech_transactions', JSON.stringify(cleanTransactions));
      localStorage.setItem('arv_tech_customers', JSON.stringify(cleanCustomers));
      localStorage.setItem('arv_tech_expenses', JSON.stringify(cleanExpenses));
    }
  }, [products, transactions, customers, expenses, isLoading]);

  useEffect(() => {
    localStorage.setItem('arv_tech_language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const addProduct = async (productData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProduct = {
      ...productData,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    
    try {
      const { data, error } = await supabaseClient.from('products').insert([newProduct]).select();
      if (error) throw error;
      if (data) setProducts((prev) => [...prev, data[0]]);
    } catch (error) {
      console.error('Error adding product:', error);
      setProducts((prev) => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updates = { ...productData, updatedAt: Date.now() };
    try {
      const { error } = await supabaseClient.from('products').update(updates).eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (error) {
      console.error('Error updating product:', error);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'updatedAt'>) => {
    const newCustomer = {
      ...customerData,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    
    try {
      const { data, error } = await supabaseClient.from('customers').insert([newCustomer]).select();
      if (error) throw error;
      if (data) setCustomers((prev) => [...prev, data[0]]);
    } catch (error) {
      console.error('Error adding customer:', error);
      setCustomers((prev) => [...prev, newCustomer]);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    const updates = { ...customerData, updatedAt: Date.now() };
    try {
      const { error } = await supabaseClient.from('customers').update(updates).eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    } catch (error) {
      console.error('Error updating customer:', error);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('customers').delete().eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense = {
      ...expenseData,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    
    try {
      const { data, error } = await supabaseClient.from('expenses').insert([newExpense]).select();
      if (error) throw error;
      if (data) setExpenses((prev) => [data[0], ...prev]);
    } catch (error) {
      console.error('Error adding expense:', error);
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const { error } = await supabaseClient.from('expenses').update(expenseData).eq('id', id);
      if (error) throw error;
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
    } catch (error) {
      console.error('Error updating expense:', error);
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('expenses').delete().eq('id', id);
      if (error) throw error;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      date: Date.now(),
    };

    try {
      const { data, error } = await supabaseClient.from('transactions').insert([newTransaction]).select();
      if (error) throw error;
      
      if (data) {
        setTransactions((prev) => [data[0], ...prev]);
        for (const item of transactionData.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            await updateProduct(product.id, { stock: product.stock - item.quantity });
          }
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setTransactions((prev) => [newTransaction, ...prev]);
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
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
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
        customers,
        expenses,
        language,
        isLoading,
        isConnected,
        setLanguage,
        updateSupabaseConfig,
        t,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addExpense,
        updateExpense,
        deleteExpense,
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
